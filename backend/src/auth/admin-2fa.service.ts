import { Injectable, Logger, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface TwoFactorChallenge {
  userId: string;
  email: string;
  telegramId: string;
  otp: string;
  secretKey256: string;
  expiresAt: number;
  attempts: number;
  ip: string;
  createdAt: number;
}

interface RateLimitRecord {
  count: number;
  blockedUntil: number;
}

@Injectable()
export class Admin2faService {
  private readonly logger = new Logger(Admin2faService.name);

  // In-memory store for active 2FA challenges (expires in 5 minutes)
  private readonly challenges = new Map<string, TwoFactorChallenge>();

  // In-memory rate limiting store (max 5 failed attempts per 5 minutes)
  private readonly rateLimits = new Map<string, RateLimitRecord>();

  private readonly DEFAULT_ADMIN_TG_ID = '7301310227';
  private readonly EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes (300,000 ms)
  private readonly MAX_ATTEMPTS = 5;
  private readonly BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly configService: ConfigService) {
    // Periodic garbage collection for expired challenges and rate limits
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  private getBotToken(): string {
    return (
      this.configService.get<string>('TELEGRAM_BOT_TOKEN') ||
      '8953849304:AAFR_30mTslKWlKY49qY50tTN3jCiXXmaN4'
    );
  }

  /**
   * Check if an IP or identifier is currently rate limited
   */
  checkRateLimit(key: string): void {
    const record = this.rateLimits.get(key);
    if (!record) return;

    const now = Date.now();
    if (record.blockedUntil > now) {
      const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      throw new HttpException(
        `Too many attempts. Blocked for security. Please try again in ${remainingSeconds} seconds.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (now > record.blockedUntil && record.blockedUntil > 0) {
      this.rateLimits.delete(key);
    }
  }

  /**
   * Record a failed attempt and block if limit reached
   */
  async recordFailedAttempt(key: string, ip: string, email: string): Promise<void> {
    const now = Date.now();
    const record = this.rateLimits.get(key) || { count: 0, blockedUntil: 0 };
    record.count += 1;

    if (record.count >= this.MAX_ATTEMPTS) {
      record.blockedUntil = now + this.BLOCK_DURATION_MS;
      this.rateLimits.set(key, record);

      this.logger.warn(`Rate limit triggered for ${key} (IP: ${ip}, Email: ${email}). Blocked for 5 minutes.`);
      
      // Send Security Alert to Admin Telegram
      await this.sendTelegramAlert(
        this.DEFAULT_ADMIN_TG_ID,
        `⚠️ <b>[SECURITY ALERT] Rate Limit Triggered</b>\n\n` +
        `Multiple failed login/2FA attempts detected!\n` +
        `👤 <b>Target:</b> ${email}\n` +
        `🌐 <b>IP Address:</b> <code>${ip}</code>\n` +
        `⏰ <b>Action:</b> Access blocked for 5 minutes.`,
      );

      throw new HttpException(
        'Too many failed attempts. Access blocked for 5 minutes for security.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    } else {
      this.rateLimits.set(key, record);
    }
  }

  /**
   * Reset rate limit after successful authentication
   */
  clearRateLimit(key: string): void {
    this.rateLimits.delete(key);
  }

  /**
   * Generate 256-character secret key and 6-digit OTP
   */
  private generateSecretKey256(): string {
    // 128 random bytes hex-encoded = exactly 256 hexadecimal characters
    return crypto.randomBytes(128).toString('hex');
  }

  private generate6DigitOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create a 2FA challenge when an Admin logs in with correct password
   */
  async createChallenge(
    user: { id: string; email: string; telegramId?: string | null; name: string },
    ip: string,
    userAgent?: string,
  ): Promise<{ tempToken: string; expiresIn: number; adminTelegramId: string }> {
    const rateLimitKey = `admin_login_${ip}_${user.email.toLowerCase()}`;
    this.checkRateLimit(rateLimitKey);

    const tempToken = crypto.randomUUID();
    const otp = this.generate6DigitOtp();
    const secretKey256 = this.generateSecretKey256();
    const now = Date.now();
    const expiresAt = now + this.EXPIRATION_MS;
    const targetTgId = user.telegramId || this.DEFAULT_ADMIN_TG_ID;

    const challenge: TwoFactorChallenge = {
      userId: user.id,
      email: user.email,
      telegramId: targetTgId,
      otp,
      secretKey256,
      expiresAt,
      attempts: 0,
      ip,
      createdAt: now,
    };

    this.challenges.set(tempToken, challenge);

    // Send Telegram Alert with the 6-digit code and 256-character secret key
    const message =
      `🚨 <b>SakuraAPI: Admin Login 2FA Verification</b>\n\n` +
      `Admin login detected with correct password:\n` +
      `👤 <b>Admin:</b> ${user.name} (${user.email})\n` +
      `🆔 <b>Admin ID:</b> <code>${targetTgId}</code>\n` +
      `🌐 <b>IP Address:</b> <code>${ip}</code>\n` +
      `🖥️ <b>Device:</b> <i>${userAgent ? userAgent.slice(0, 50) : 'Unknown'}</i>\n` +
      `⏳ <b>Valid For:</b> 5 minutes (Expires at ${new Date(expiresAt).toLocaleTimeString()})\n\n` +
      `🔢 <b>6-Digit Verification Code:</b>\n` +
      `<code>${otp}</code>\n\n` +
      `🛡️ <b>256-Character Secret Key (Rotates every 5m):</b>\n` +
      `<code>${secretKey256}</code>\n\n` +
      `⚠️ <i>Enter the 6-digit code OR the 256-character Secret Key on the login page to complete authentication. Do not share this key with anyone.</i>`;

    await this.sendTelegramAlert(targetTgId, message);

    return {
      tempToken,
      expiresIn: 300, // 300 seconds (5 minutes)
      adminTelegramId: targetTgId,
    };
  }

  /**
   * Verify the 2FA code or 256-character secret key
   */
  async verifyChallenge(tempToken: string, rawCode: string, ip: string): Promise<string> {
    const rateLimitKey = `admin_2fa_${ip}_${tempToken}`;
    this.checkRateLimit(rateLimitKey);

    const challenge = this.challenges.get(tempToken);
    if (!challenge) {
      throw new UnauthorizedException('2FA session expired or invalid. Please login again.');
    }

    const now = Date.now();
    if (now > challenge.expiresAt) {
      this.challenges.delete(tempToken);
      throw new UnauthorizedException('2FA code has expired (exceeded 5 minutes). Please login again.');
    }

    const cleanInput = (rawCode || '').trim();

    // Check if input matches 6-digit OTP OR 256-character Secret Key
    const isOtpMatch = cleanInput === challenge.otp;
    const isSecretKeyMatch = cleanInput.toLowerCase() === challenge.secretKey256.toLowerCase();

    if (!isOtpMatch && !isSecretKeyMatch) {
      challenge.attempts += 1;
      await this.recordFailedAttempt(rateLimitKey, ip, challenge.email);

      const remainingAttempts = this.MAX_ATTEMPTS - challenge.attempts;
      if (remainingAttempts <= 0) {
        this.challenges.delete(tempToken);
        throw new HttpException(
          'Maximum 2FA verification attempts exceeded. Session terminated.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException(
        `Invalid 2FA code or Secret Key. ${remainingAttempts} attempt(s) remaining.`,
      );
    }

    // Success! Clean up challenge and rate limits
    const userId = challenge.userId;
    const email = challenge.email;
    const targetTgId = challenge.telegramId;
    this.challenges.delete(tempToken);
    this.clearRateLimit(rateLimitKey);
    this.clearRateLimit(`admin_login_${ip}_${email.toLowerCase()}`);

    // Send Confirmation Telegram Alert
    await this.sendTelegramAlert(
      targetTgId,
      `✅ <b>SakuraAPI: Admin Login Successful</b>\n\n` +
      `Admin <b>${email}</b> successfully passed 2FA verification.\n` +
      `🌐 <b>IP Address:</b> <code>${ip}</code>\n` +
      `⏰ <b>Timestamp:</b> ${new Date().toISOString()}`,
    );

    return userId;
  }

  /**
   * Resend 2FA verification code and new 256-char secret key
   */
  async resendChallenge(
    tempToken: string,
    ip: string,
  ): Promise<{ expiresIn: number }> {
    const challenge = this.challenges.get(tempToken);
    if (!challenge) {
      throw new UnauthorizedException('2FA session expired or invalid. Please login again.');
    }

    const rateLimitKey = `admin_resend_${ip}_${challenge.email.toLowerCase()}`;
    this.checkRateLimit(rateLimitKey);

    // Generate fresh OTP and fresh 256-char secret key
    challenge.otp = this.generate6DigitOtp();
    challenge.secretKey256 = this.generateSecretKey256();
    challenge.expiresAt = Date.now() + this.EXPIRATION_MS;
    challenge.attempts = 0;

    const message =
      `🔄 <b>SakuraAPI: Admin 2FA Code Refreshed</b>\n\n` +
      `A new 2FA code and secret key was requested:\n` +
      `👤 <b>Admin:</b> ${challenge.email}\n` +
      `🆔 <b>Admin ID:</b> <code>${challenge.telegramId}</code>\n` +
      `🌐 <b>IP Address:</b> <code>${ip}</code>\n` +
      `⏳ <b>Valid For:</b> 5 minutes\n\n` +
      `🔢 <b>New 6-Digit Code:</b>\n` +
      `<code>${challenge.otp}</code>\n\n` +
      `🛡️ <b>New 256-Character Secret Key:</b>\n` +
      `<code>${challenge.secretKey256}</code>`;

    await this.sendTelegramAlert(challenge.telegramId, message);
    return { expiresIn: 300 };
  }

  /**
   * Send notification via Telegram Bot API
   */
  async sendTelegramAlert(chatId: string, text: string): Promise<boolean> {
    try {
      const botToken = this.getBotToken();
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        this.logger.error(`Failed to send Telegram alert to ${chatId}: ${errorText}`);
        return false;
      }

      return true;
    } catch (err: any) {
      this.logger.error(`Telegram API error: ${err.message}`);
      return false;
    }
  }

  /**
   * Cleanup expired challenges and rate limit blocks
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [token, challenge] of this.challenges.entries()) {
      if (now > challenge.expiresAt) {
        this.challenges.delete(token);
      }
    }

    for (const [key, record] of this.rateLimits.entries()) {
      if (record.blockedUntil > 0 && now > record.blockedUntil) {
        this.rateLimits.delete(key);
      }
    }
  }
}
