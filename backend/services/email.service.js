const EmailConfig = require('../models/EmailConfig');

class EmailService {
  async getConfig(userId) {
    let config = await EmailConfig.findOne({ user: userId });
    if (!config) return null;
    return {
      ...config.toObject(),
      password: config.password ? '••••••••' : ''
    };
  }

  async saveConfig(userId, data) {
    const existing = await EmailConfig.findOne({ user: userId });
    // Don't overwrite password with mask
    if (existing && data.password === '••••••••') {
      data.password = existing.password;
    }
    const config = await EmailConfig.findOneAndUpdate(
      { user: userId },
      { ...data, user: userId },
      { new: true, upsert: true, runValidators: true }
    );
    return { ...config.toObject(), password: '••••••••' };
  }

  async testConnection(userId) {
    const config = await EmailConfig.findOne({ user: userId });
    if (!config) throw new Error('إعدادات البريد الإلكتروني غير موجودة');

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.username, pass: config.password }
    });

    try {
      await transporter.verify();
      return { success: true, message: 'تم الاتصال بنجاح' };
    } catch (err) {
      return { success: false, message: `فشل الاتصال: ${err.message}` };
    } finally {
      transporter.close();
    }
  }

  async sendEmail(userId, to, subject, html) {
    const config = await EmailConfig.findOne({ user: userId });
    if (!config || !config.isActive) throw new Error('البريد الإلكتروني غير مفعّل');

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.username, pass: config.password }
    });

    try {
      const info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to,
        subject,
        html
      });
      return { success: true, messageId: info.messageId };
    } catch (err) {
      throw new Error(`فشل إرسال البريد: ${err.message}`);
    } finally {
      transporter.close();
    }
  }

  async deleteConfig(userId) {
    const config = await EmailConfig.findOneAndDelete({ user: userId });
    if (!config) throw new Error('إعدادات البريد الإلكتروني غير موجودة');
    return config;
  }
}

module.exports = new EmailService();