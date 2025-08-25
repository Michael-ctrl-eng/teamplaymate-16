const { DatabaseService } = require('./database.js');

class AiChatHistoryService {
  constructor() {
    this.db = new DatabaseService();
    if (!this.db.isHealthy()) {
      this.db.initialize();
    }
  }

  async addMessage(userId, message, response, context) {
    try {
      const chatMessage = {
        user_id: userId,
        message: message,
        response: response,
        context: context,
      };
      const savedMessage = await this.db.create('chat_messages', chatMessage);
      return savedMessage;
    } catch (error) {
      console.error('Error adding chat message to history:', error);
      throw error;
    }
  }

  async getHistory(userId) {
    try {
      const history = await this.db.findMany(
        'chat_messages',
        { user_id: userId },
        { orderBy: 'created_at', ascending: true }
      );
      return history;
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }
}

module.exports = { AiChatHistoryService };
