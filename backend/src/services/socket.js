const winston = require('winston');
const jwt = require('jsonwebtoken');
const { RedisService } = require('./redis');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map();
    this.rooms = new Map();
  }

  initialize(io) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
    logger.info('Socket service initialized');
  }

  setupMiddleware() {
    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.userEmail = decoded.email;
        
        // Store user session in Redis
        await RedisService.setSession(`socket:${socket.id}`, {
          userId: decoded.userId,
          email: decoded.email,
          connectedAt: new Date().toISOString()
        }, 3600);

        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`User connected: ${socket.userId} (${socket.id})`);
      
      // Store connected user
      this.connectedUsers.set(socket.userId, {
        socketId: socket.id,
        email: socket.userEmail,
        connectedAt: new Date(),
        rooms: new Set()
      });

      // Handle user joining rooms
      socket.on('join_room', async (data) => {
        try {
          const { roomType, roomId } = data;
          const roomKey = `${roomType}:${roomId}`;
          
          await socket.join(roomKey);
          
          // Track room membership
          if (this.connectedUsers.has(socket.userId)) {
            this.connectedUsers.get(socket.userId).rooms.add(roomKey);
          }
          
          // Update room info
          if (!this.rooms.has(roomKey)) {
            this.rooms.set(roomKey, new Set());
          }
          this.rooms.get(roomKey).add(socket.userId);
          
          socket.emit('room_joined', { roomType, roomId, success: true });
          
          // Notify others in the room
          socket.to(roomKey).emit('user_joined_room', {
            userId: socket.userId,
            email: socket.userEmail,
            roomType,
            roomId
          });
          
          logger.info(`User ${socket.userId} joined room ${roomKey}`);
        } catch (error) {
          logger.error('Error joining room:', error);
          socket.emit('room_joined', { success: false, error: error.message });
        }
      });

      // Handle leaving rooms
      socket.on('leave_room', async (data) => {
        try {
          const { roomType, roomId } = data;
          const roomKey = `${roomType}:${roomId}`;
          
          await socket.leave(roomKey);
          
          // Update tracking
          if (this.connectedUsers.has(socket.userId)) {
            this.connectedUsers.get(socket.userId).rooms.delete(roomKey);
          }
          
          if (this.rooms.has(roomKey)) {
            this.rooms.get(roomKey).delete(socket.userId);
            if (this.rooms.get(roomKey).size === 0) {
              this.rooms.delete(roomKey);
            }
          }
          
          socket.emit('room_left', { roomType, roomId, success: true });
          
          // Notify others in the room
          socket.to(roomKey).emit('user_left_room', {
            userId: socket.userId,
            email: socket.userEmail,
            roomType,
            roomId
          });
          
          logger.info(`User ${socket.userId} left room ${roomKey}`);
        } catch (error) {
          logger.error('Error leaving room:', error);
          socket.emit('room_left', { success: false, error: error.message });
        }
      });

      // Handle chat messages
      socket.on('chat_message', async (data) => {
        try {
          const { roomType, roomId, message, messageType = 'text' } = data;
          const roomKey = `${roomType}:${roomId}`;
          
          const chatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: socket.userId,
            email: socket.userEmail,
            message,
            messageType,
            timestamp: new Date().toISOString(),
            roomType,
            roomId
          };
          
          // Store message in Redis for history
          await RedisService.set(
            `chat:${roomKey}:${chatMessage.id}`,
            chatMessage,
            86400 // 24 hours
          );
          
          // Broadcast to room
          this.io.to(roomKey).emit('chat_message', chatMessage);
          
          logger.info(`Chat message sent in room ${roomKey} by user ${socket.userId}`);
        } catch (error) {
          logger.error('Error handling chat message:', error);
          socket.emit('chat_error', { error: error.message });
        }
      });

      // Handle live match updates
      socket.on('match_update', async (data) => {
        try {
          const { matchId, updateType, updateData } = data;
          const roomKey = `match:${matchId}`;
          
          const matchUpdate = {
            id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            matchId,
            updateType,
            updateData,
            timestamp: new Date().toISOString(),
            updatedBy: socket.userId
          };
          
          // Store update in Redis
          await RedisService.set(
            `match_update:${matchId}:${matchUpdate.id}`,
            matchUpdate,
            3600 // 1 hour
          );
          
          // Broadcast to match room
          this.io.to(roomKey).emit('match_update', matchUpdate);
          
          logger.info(`Match update sent for match ${matchId}: ${updateType}`);
        } catch (error) {
          logger.error('Error handling match update:', error);
          socket.emit('match_update_error', { error: error.message });
        }
      });

      // Handle training session updates
      socket.on('training_update', async (data) => {
        try {
          const { sessionId, updateType, updateData } = data;
          const roomKey = `training:${sessionId}`;
          
          const trainingUpdate = {
            id: `training_update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sessionId,
            updateType,
            updateData,
            timestamp: new Date().toISOString(),
            updatedBy: socket.userId
          };
          
          // Broadcast to training room
          this.io.to(roomKey).emit('training_update', trainingUpdate);
          
          logger.info(`Training update sent for session ${sessionId}: ${updateType}`);
        } catch (error) {
          logger.error('Error handling training update:', error);
          socket.emit('training_update_error', { error: error.message });
        }
      });

      // Handle user status updates
      socket.on('status_update', async (data) => {
        try {
          const { status, activity } = data;
          
          const statusUpdate = {
            userId: socket.userId,
            status,
            activity,
            timestamp: new Date().toISOString()
          };
          
          // Update user status in Redis
          await RedisService.set(
            `user_status:${socket.userId}`,
            statusUpdate,
            300 // 5 minutes
          );
          
          // Broadcast to all user's rooms
          if (this.connectedUsers.has(socket.userId)) {
            const userRooms = this.connectedUsers.get(socket.userId).rooms;
            userRooms.forEach(roomKey => {
              socket.to(roomKey).emit('user_status_update', statusUpdate);
            });
          }
          
          logger.info(`Status update for user ${socket.userId}: ${status}`);
        } catch (error) {
          logger.error('Error handling status update:', error);
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        const { roomType, roomId } = data;
        const roomKey = `${roomType}:${roomId}`;
        
        socket.to(roomKey).emit('user_typing', {
          userId: socket.userId,
          email: socket.userEmail,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data) => {
        const { roomType, roomId } = data;
        const roomKey = `${roomType}:${roomId}`;
        
        socket.to(roomKey).emit('user_typing', {
          userId: socket.userId,
          email: socket.userEmail,
          isTyping: false
        });
      });

      // Handle disconnection
      socket.on('disconnect', async (reason) => {
        logger.info(`User disconnected: ${socket.userId} (${socket.id}) - Reason: ${reason}`);
        
        try {
          // Clean up user from all rooms
          if (this.connectedUsers.has(socket.userId)) {
            const user = this.connectedUsers.get(socket.userId);
            
            // Notify all rooms about user leaving
            user.rooms.forEach(roomKey => {
              socket.to(roomKey).emit('user_disconnected', {
                userId: socket.userId,
                email: socket.userEmail,
                disconnectedAt: new Date().toISOString()
              });
              
              // Clean up room tracking
              if (this.rooms.has(roomKey)) {
                this.rooms.get(roomKey).delete(socket.userId);
                if (this.rooms.get(roomKey).size === 0) {
                  this.rooms.delete(roomKey);
                }
              }
            });
            
            this.connectedUsers.delete(socket.userId);
          }
          
          // Clean up session from Redis
          await RedisService.deleteSession(`socket:${socket.id}`);
          
        } catch (error) {
          logger.error('Error during disconnect cleanup:', error);
        }
      });
    });
  }

  // Public methods for external use
  async broadcastToRoom(roomType, roomId, event, data) {
    try {
      const roomKey = `${roomType}:${roomId}`;
      this.io.to(roomKey).emit(event, data);
      logger.info(`Broadcasted ${event} to room ${roomKey}`);
      return true;
    } catch (error) {
      logger.error('Error broadcasting to room:', error);
      return false;
    }
  }

  async sendToUser(userId, event, data) {
    try {
      if (this.connectedUsers.has(userId)) {
        const user = this.connectedUsers.get(userId);
        this.io.to(user.socketId).emit(event, data);
        logger.info(`Sent ${event} to user ${userId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error sending to user:', error);
      return false;
    }
  }

  async broadcastToAll(event, data) {
    try {
      this.io.emit(event, data);
      logger.info(`Broadcasted ${event} to all connected users`);
      return true;
    } catch (error) {
      logger.error('Error broadcasting to all:', error);
      return false;
    }
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  getRoomUsers(roomType, roomId) {
    const roomKey = `${roomType}:${roomId}`;
    return this.rooms.has(roomKey) ? Array.from(this.rooms.get(roomKey)) : [];
  }

  getStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeRooms: this.rooms.size,
      totalConnections: this.io.engine.clientsCount
    };
  }
}

const socketServiceInstance = new SocketService();

module.exports = socketServiceInstance;
module.exports.SocketService = SocketService;
module.exports.default = socketServiceInstance;