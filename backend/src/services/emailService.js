const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  async initializeTransporter() {
    try {
      // Configure nodemailer with Gmail SMTP
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true' || false,
        auth: {
          user: process.env.EMAIL_USER || 'statsor1@gmail.com',
          pass: process.env.EMAIL_PASS // App password for Gmail
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
      // Don't throw error to prevent app crash, just log it
    }
  }

  async sendEmail(options) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || `"Statsor Team" <statsor1@gmail.com>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${options.to}:`, result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Failed to send email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const templatePath = path.join(__dirname, '../templates/welcome-email.hbs');
      const templateSource = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const html = template({
        firstName: user.first_name || user.name || 'User',
        lastName: user.last_name || '',
        email: user.email,
        appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        supportEmail: 'statsor1@gmail.com',
        year: new Date().getFullYear(),
        sport: user.sport || 'football',
        role: user.role || 'player'
      });

      return await this.sendEmail({
        to: user.email,
        subject: '🎉 Welcome to Statsor - Your Football Management Journey Begins!',
        html
      });
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const templatePath = path.join(__dirname, '../templates/password-reset-email.hbs');
      const templateSource = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      
      const html = template({
        firstName: user.first_name || user.name || 'User',
        resetUrl,
        resetToken,
        appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        supportEmail: 'statsor1@gmail.com',
        year: new Date().getFullYear(),
        expiryTime: '1 hour'
      });

      return await this.sendEmail({
        to: user.email,
        subject: '🔐 Reset Your Statsor Password',
        html
      });
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendVerificationEmail(user, verificationToken) {
    try {
      const templatePath = path.join(__dirname, '../templates/verification-email.hbs');
      const templateSource = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      const html = template({
        firstName: user.first_name || user.name || 'User',
        verificationUrl,
        verificationToken,
        appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        supportEmail: 'statsor1@gmail.com',
        year: new Date().getFullYear()
      });

      return await this.sendEmail({
        to: user.email,
        subject: '✅ Verify Your Statsor Account',
        html
      });
    } catch (error) {
      console.error('❌ Failed to send verification email:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendPasswordResetCodeEmail(user, resetCode) {
    try {
      const templatePath = path.join(__dirname, '../templates/password-reset-code-email.hbs');
      const templateSource = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);

      const html = template({
        firstName: user.first_name || user.name || 'User',
        resetCode,
        appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
        supportEmail: 'statsor1@gmail.com',
        year: new Date().getFullYear(),
        expiryTime: '10 minutes'
      });

      return await this.sendEmail({
        to: user.email,
        subject: '🔑 Your Statsor Password Reset Code',
        html
      });
    } catch (error) {
      console.error('❌ Failed to send password reset code email:', error.message);
      return { success: false, error: error.message };
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Test email functionality
  async testEmail(toEmail = 'statsor1@gmail.com') {
    try {
      const result = await this.sendEmail({
        to: toEmail,
        subject: '🧪 Statsor Email Service Test',
        html: `
          <h2>Email Service Test</h2>
          <p>This is a test email from Statsor platform.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
          <p>If you receive this, the email service is working correctly!</p>
        `
      });
      return result;
    } catch (error) {
      console.error('❌ Email test failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();