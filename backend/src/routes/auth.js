const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const { APIService } = require('../services/apiService');
const { 
  asyncHandler, 
  validateRequest, 
  ValidationError, 
  AuthenticationError, 
  ConflictError,
  NotFoundError 
} = require('../middleware/errorHandler');
const { authenticateToken, generateTokens } = require('../middleware/auth');

const router = express.Router();
const apiService = new APIService();

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many requests, please try again later' }
});

// Validation schemas
const registerSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    role: Joi.string().valid('player', 'coach', 'manager', 'admin').default('player'),
    teamCode: Joi.string().optional(),
    position: Joi.string().when('role', {
      is: 'player',
      then: Joi.string().valid('goalkeeper', 'defender', 'midfielder', 'forward').required(),
      otherwise: Joi.optional()
    }),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    dateOfBirth: Joi.date().max('now').optional(),
    nationality: Joi.string().max(50).optional()
  })
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    rememberMe: Joi.boolean().default(false)
  })
});

const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required()
  })
});

const resetPasswordSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).pattern(/^\d{6}$/).required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
  })
});

const verifyResetCodeSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).pattern(/^\d{6}$/).required()
  })
});

const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
  })
});

// Passport configuration
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user exists
    let user = await db.findOne('users', { google_id: profile.id });
    
    if (user) {
      return done(null, user);
    }

    // Check if user exists with same email
    user = await db.findOne('users', { email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      await db.update('users', user.id, {
        google_id: profile.id,
        avatar_url: profile.photos[0]?.value,
        updated_at: new Date()
      });
      return done(null, user);
    }

    // Create new user
    const newUser = await db.create('users', {
      google_id: profile.id,
      email: profile.emails[0].value,
      first_name: profile.name.givenName,
      last_name: profile.name.familyName,
      avatar_url: profile.photos[0]?.value,
      email_verified: true,
      role: 'player',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    });

    return done(null, newUser);
  } catch (error) {
    return done(error, null);
  }
  }));
}

if (process.env.JWT_SECRET) {
  passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  }, async (payload, done) => {
  try {
    const user = await db.findById('users', payload.userId);
    if (user && user.status === 'active') {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
  }));
}

// Helper functions
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

const sendVerificationEmail = async (user, token) => {
  try {
    await emailService.sendVerificationEmail(user.email, {
      firstName: user.first_name,
      verificationUrl: `${process.env.FRONTEND_URL}/verify-email/${token}`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@statsor.com'
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
  }
};

const sendPasswordResetEmail = async (user, resetCode) => {
  try {
    await emailService.sendPasswordResetEmail(user.email, {
      firstName: user.first_name,
      resetCode: resetCode,
      resetUrl: `${process.env.FRONTEND_URL}/reset-password`,
      expirationMinutes: 15,
      requestTime: new Date().toLocaleString(),
      ipAddress: 'Hidden for security',
      userAgent: 'Hidden for security',
      supportEmail: process.env.SUPPORT_EMAIL || 'support@statsor.com'
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }
};

const sendWelcomeEmail = async (user) => {
  try {
    await emailService.sendWelcomeEmail(user.email, {
      firstName: user.first_name,
      email: user.email,
      role: user.role,
      sport: 'Football',
      appUrl: process.env.FRONTEND_URL,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@statsor.com'
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
};

// Routes

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', 
  generalLimiter,
  validateRequest(registerSchema),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, role, teamCode, position, phoneNumber, dateOfBirth, nationality } = req.body;

    // Check if user already exists
    const existingUser = await db.findOne('users', { email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Handle team code if provided
    let teamId = null;
    if (teamCode) {
      const team = await db.findOne('teams', { code: teamCode });
      if (!team) {
        throw new ValidationError('Invalid team code');
      }
      teamId = team.id;
    }

    // Create user
    const user = await db.create('users', {
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
      team_id: teamId,
      position: role === 'player' ? position : null,
      phone_number: phoneNumber,
      date_of_birth: dateOfBirth,
      nationality,
      email_verification_token: verificationToken,
      email_verified: false,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date()
    });

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    // Send welcome email
    await sendWelcomeEmail(user);

    // Generate tokens
    const tokens = generateTokens(user.id, user.role);

    // Store refresh token
    await redis.setRefreshToken(user.id, tokens.refreshToken);

    // Remove sensitive data
    delete user.password_hash;
    delete user.email_verification_token;

    res.status(201).json({
      message: 'User registered successfully. Please check your email for verification and welcome information.',
      user,
      tokens
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login',
  authLimiter,
  validateRequest(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password, rememberMe } = req.body;

    // Find user
    const user = await db.findOne('users', { email });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Check if account is active
    if (user.status !== 'active') {
      throw new AuthenticationError('Account is not active. Please verify your email.');
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Update last login
    await db.update('users', user.id, {
      last_login: new Date(),
      updated_at: new Date()
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.role, rememberMe);

    // Store refresh token
    await redis.setRefreshToken(user.id, tokens.refreshToken);

    // Remove sensitive data
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      user,
      tokens
    });
  })
);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    // Remove refresh token from Redis
    if (refreshToken) {
      await redis.deleteRefreshToken(req.user.id, refreshToken);
    }

    // Add access token to blacklist
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      await redis.blacklistToken(token);
    }

    res.json({ message: 'Logout successful' });
  })
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh',
  generalLimiter,
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token required');
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Check if token exists in Redis
      const storedToken = await redis.getRefreshToken(decoded.userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new AuthenticationError('Invalid refresh token');
      }

      // Get user
      const user = await db.findById('users', decoded.userId);
      if (!user || user.status !== 'active') {
        throw new AuthenticationError('User not found or inactive');
      }

      // Generate new tokens
      const tokens = generateTokens(user.id, user.role);

      // Update refresh token in Redis
      await redis.setRefreshToken(user.id, tokens.refreshToken);

      res.json({
        message: 'Token refreshed successfully',
        tokens
      });
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Invalid or expired refresh token');
      }
      throw error;
    }
  })
);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password',
  generalLimiter,
  validateRequest(forgotPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await db.findOne('users', { email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // Generate reset code
    const resetCode = generateResetCode();
    const resetCodeExpiry = new Date(Date.now() + 900000); // 15 minutes

    // Store reset code
    await db.update('users', user.id, {
      password_reset_code: resetCode,
      password_reset_expires: resetCodeExpiry,
      updated_at: new Date()
    });

    // Send reset email
    await sendPasswordResetEmail(user, resetCode);

    res.json({ message: 'If the email exists, a reset link has been sent.' });
  })
);

// @route   POST /api/auth/verify-reset-code
// @desc    Verify password reset code
// @access  Public
router.post('/verify-reset-code',
  generalLimiter,
  validateRequest(verifyResetCodeSchema),
  asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    const user = await db.findOne('users', {
      email,
      password_reset_code: code,
      password_reset_expires: { $gt: new Date() }
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset code');
    }

    res.json({ 
      message: 'Reset code verified successfully',
      valid: true 
    });
  })
);

// @route   POST /api/auth/reset-password
// @desc    Reset password with verified code
// @access  Public
router.post('/reset-password',
  generalLimiter,
  validateRequest(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email, code, password } = req.body;

    const user = await db.findOne('users', {
      email,
      password_reset_code: code,
      password_reset_expires: { $gt: new Date() }
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset code');
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user
    await db.update('users', user.id, {
      password_hash: hashedPassword,
      password_reset_code: null,
      password_reset_expires: null,
      updated_at: new Date()
    });

    // Invalidate all refresh tokens
    await redis.deleteAllRefreshTokens(user.id);

    res.json({ message: 'Password reset successful' });
  })
);

// @route   POST /api/auth/change-password
// @desc    Change password (authenticated)
// @access  Private
router.post('/change-password',
  authenticateToken,
  validateRequest(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user with password
    const user = await db.findById('users', userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.update('users', userId, {
      password_hash: hashedPassword,
      updated_at: new Date()
    });

    // Invalidate all refresh tokens except current session
    await redis.deleteAllRefreshTokens(userId);

    res.json({ message: 'Password changed successfully' });
  })
);

// @route   GET /api/auth/verify-email/:token
// @desc    Verify email address
// @access  Public
router.get('/verify-email/:token',
  asyncHandler(async (req, res) => {
    const { token } = req.params;

    const user = await db.findOne('users', { email_verification_token: token });
    if (!user) {
      throw new ValidationError('Invalid verification token');
    }

    // Update user
    await db.update('users', user.id, {
      email_verified: true,
      email_verification_token: null,
      status: 'active',
      updated_at: new Date()
    });

    res.json({ message: 'Email verified successfully' });
  })
);

// @route   POST /api/auth/resend-verification
// @desc    Resend verification email
// @access  Private
router.post('/resend-verification',
  authenticateToken,
  generalLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await db.findById('users', userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.email_verified) {
      throw new ValidationError('Email is already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Update user
    await db.update('users', userId, {
      email_verification_token: verificationToken,
      updated_at: new Date()
    });

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.json({ message: 'Verification email sent' });
  })
);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  asyncHandler(async (req, res) => {
    // Generate tokens
    const tokens = generateTokens(req.user.id, req.user.role);

    // Store refresh token
    await redis.setRefreshToken(req.user.id, tokens.refreshToken);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`);
  })
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await db.findById('users', req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Remove sensitive data
    delete user.password_hash;
    delete user.email_verification_token;
    delete user.password_reset_token;

    res.json({ user });
  })
);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const allowedFields = ['first_name', 'last_name', 'phone_number', 'date_of_birth', 'nationality', 'position'];
    
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new ValidationError('No valid fields to update');
    }

    updateData.updated_at = new Date();

    const updatedUser = await db.update('users', userId, updateData);
    
    // Remove sensitive data
    delete updatedUser.password_hash;
    delete updatedUser.email_verification_token;
    delete updatedUser.password_reset_token;

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  })
);

module.exports = router;