import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AvatarService {
  private readonly logger = new Logger(AvatarService.name);
  private readonly avatarsDir = path.resolve(process.cwd(), 'uploads', 'avatars');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.avatarsDir)) {
      try {
        fs.mkdirSync(this.avatarsDir, { recursive: true });
      } catch (err: any) {
        this.logger.error(`Failed to create avatars directory: ${err.message}`);
      }
    }
  }

  getAvatarPath(username: string): string {
    const clean = username.replace(/^@/, '').toLowerCase().trim();
    return path.join(this.avatarsDir, `${clean}.jpg`);
  }

  async getOrFetchAvatar(
    username: string,
    forceRefresh = false,
  ): Promise<{ filePath?: string; svg?: string }> {
    const clean = username.replace(/^@/, '').toLowerCase().trim();
    if (!clean) {
      return { svg: this.generateSvg('S') };
    }

    const filePath = path.join(this.avatarsDir, `${clean}.jpg`);

    // 1. Check if avatar is already stored on VPS disk
    if (fs.existsSync(filePath) && !forceRefresh) {
      try {
        const stats = fs.statSync(filePath);
        if (stats.size > 500) {
          return { filePath };
        }
      } catch {
        // Continue to fresh fetch
      }
    }

    // 2. Try scraping the official Telegram public preview to download and save to VPS
    try {
      this.logger.log(`📥 Fetching Telegram profile photo for @${clean} to save on VPS disk...`);
      const tgRes = await fetch(`https://t.me/${clean}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
      });

      if (tgRes.ok) {
        const html = await tgRes.text();
        const match =
          html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
          html.match(/<img\s+class="tgme_page_photo_image"[^>]+src="([^"]+)"/i) ||
          html.match(/<meta\s+name="twitter:image"\s+content="([^"]+)"/i);

        const photoUrl = match ? match[1] : null;

        // Verify photoUrl is a genuine CDN profile image
        if (
          photoUrl &&
          photoUrl.includes('telesco.pe/file/') &&
          !photoUrl.includes('telegram.org/img')
        ) {
          const imgRes = await fetch(photoUrl);
          if (imgRes.ok) {
            const buffer = Buffer.from(await imgRes.arrayBuffer());
            if (buffer.length > 500) {
              if (!fs.existsSync(this.avatarsDir)) {
                fs.mkdirSync(this.avatarsDir, { recursive: true });
              }
              fs.writeFileSync(filePath, buffer);
              this.logger.log(
                `✅ Saved @${clean} avatar to VPS storage (${buffer.length} bytes): ${filePath}`,
              );

              // Update database record in background
              this.updateDbPhotoUrl(clean).catch(() => {});

              return { filePath };
            }
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`⚠️ Could not scrape Telegram avatar for @${clean}: ${err.message}`);
    }

    // 3. Fallback: If previously stored on disk, use it
    if (fs.existsSync(filePath)) {
      return { filePath };
    }

    // 4. Default: Return gradient SVG initial
    return { svg: this.generateSvg(clean.charAt(0).toUpperCase() || 'S') };
  }

  private async updateDbPhotoUrl(cleanTelegram: string) {
    const avatarUrl = `/api/v1/avatar/${cleanTelegram}`;
    try {
      await this.prisma.user.updateMany({
        where: {
          OR: [
            { telegram: cleanTelegram },
            { telegram: `@${cleanTelegram}` },
          ],
        },
        data: { telegramPhotoUrl: avatarUrl },
      });
      await this.prisma.reseller.updateMany({
        where: {
          OR: [
            { telegram: cleanTelegram },
            { telegram: `@${cleanTelegram}` },
          ],
        },
        data: { telegramPhotoUrl: avatarUrl },
      });
    } catch {
      // Non-fatal
    }
  }

  generateSvg(initial: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ec4899" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
  </defs>
  <rect width="120" height="120" rx="36" fill="#0d091e" stroke="url(#bgGrad)" stroke-width="4"/>
  <text x="60" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="52" fill="#f472b6" text-anchor="middle">${initial}</text>
</svg>`;
  }
}
