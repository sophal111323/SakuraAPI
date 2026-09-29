import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CheckIdResult {
  valid: boolean;
  username: string | null;
  region?: string | null;
  gameTitle?: string | null;
  gameCode: string;
  userId: string;
  serverId?: string | null;
  message?: string;
  raw?: any;
}

export interface Bay2GameCategory {
  gameCode: string;
  name: string;
  description?: string;
  imageUrl?: string;
  gameFields: string[];
}

@Injectable()
export class Bay2GameService {
  private readonly logger = new Logger(Bay2GameService.name);
  private readonly checkIdUrl: string;
  private readonly apiUrl: string;
  private readonly apiKey: string;

  // In-memory cache for categories (1 hour TTL)
  private cachedCategories: Bay2GameCategory[] | null = null;
  private categoriesExpiresAt = 0;

  constructor(private readonly configService: ConfigService) {
    this.checkIdUrl =
      this.configService.get<string>('BAY2GAME_CHECKID_URL') ||
      'https://checkid.bay2game.xyz/check_id';
    this.apiUrl =
      this.configService.get<string>('BAY2GAME_API_URL') ||
      'https://api.bay2game.xyz/api';
    this.apiKey =
      this.configService.get<string>('BAY2GAME_API_KEY') ||
      'b2g_8c7b36d85f1d018933cad4d31e5d00142c2372c92f26d52f';
  }

  /**
   * Normalizes standard game codes to Bay2Game game codes
   */
  normalizeGameCode(code: string): string {
    const c = code.toLowerCase().trim();
    const map: Record<string, string> = {
      'mobile-legends': 'mlbb',
      'mobile_legends': 'mlbb',
      'mlbb': 'mlbb',
      'free-fire': 'freefire_global',
      'free_fire': 'freefire_global',
      'freefire': 'freefire_global',
      'genshin-impact': 'genshin_impact',
      'genshin_impact': 'genshin_impact',
      'genshin': 'genshin_impact',
      'pubg-mobile': 'pubgm_global',
      'pubg_mobile': 'pubgm_global',
      'pubg': 'pubgm_global',
      'honor-of-kings': 'honor_of_kings',
      'hok': 'honor_of_kings',
      'valorant': 'valorant',
    };
    return map[c] || c;
  }

  /**
   * Checks and validates a game player ID via Bay2Game
   * Flow: Reseller -> SakuraAPI -> Bay2Game
   */
  async checkId(game: string, userId: string, serverId?: string): Promise<CheckIdResult> {
    const normalizedGame = this.normalizeGameCode(game);
    const cleanUserId = userId.trim();
    const cleanServerId = serverId?.trim();

    const params = new URLSearchParams({
      game: normalizedGame,
      userid: cleanUserId,
    });
    if (cleanServerId) {
      params.set('serverid', cleanServerId);
    }

    const targetUrl = `${this.checkIdUrl}?${params.toString()}`;
    this.logger.log(`🔍 Checking Game ID via Bay2Game: ${normalizedGame} - ${cleanUserId}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SakuraAPI-Gateway/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await response.json();
      const status = json.status?.toString().toUpperCase();
      let isValid = (status === 'SUCCESS' || status === 'APPROVED' || status === 'OK' || status === '200') && Boolean(json.username);

      // Smart server fallback: If Free Fire Global failed, try Free Fire SG (Singapore/Cambodia/Malaysia)
      if (!isValid && normalizedGame === 'freefire_global') {
        try {
          this.logger.log(`🔄 Free Fire Global not found, trying Free Fire SG for ${cleanUserId}...`);
          const sgUrl = `${this.checkIdUrl}?game=freefire_sg&userid=${cleanUserId}`;
          const sgRes = await fetch(sgUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'User-Agent': 'SakuraAPI-Gateway/1.0' },
          });
          const sgJson = await sgRes.json();
          const sgStatus = sgJson.status?.toString().toUpperCase();
          if ((sgStatus === 'SUCCESS' || sgStatus === 'APPROVED' || sgStatus === 'OK') && Boolean(sgJson.username)) {
            return {
              valid: true,
              username: sgJson.username,
              region: sgJson.region || 'SG',
              gameTitle: sgJson.game_title || 'Free Fire SG',
              gameCode: 'freefire_sg',
              userId: cleanUserId,
              serverId: cleanServerId || null,
              message: sgJson.message || 'Player ID verified successfully (SG server)',
              raw: sgJson,
            };
          }
        } catch {
          // ignore fallback error and return original result
        }
      }

      return {
        valid: isValid,
        username: json.username || null,
        region: json.region || null,
        gameTitle: json.game_title || null,
        gameCode: normalizedGame,
        userId: cleanUserId,
        serverId: cleanServerId || null,
        message: json.message || (isValid ? 'Player ID verified successfully' : 'Player ID not found or invalid'),
        raw: json,
      };
    } catch (err: any) {
      clearTimeout(timeout);
      this.logger.error(`❌ Bay2Game check_id error: ${err.message}`);

      if (err.name === 'AbortError') {
        throw new HttpException(
          {
            code: 'PROVIDER_TIMEOUT',
            message: 'Game ID validation provider timed out. Please try again.',
          },
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }

      throw new HttpException(
        {
          code: 'CHECK_ID_ERROR',
          message: 'Unable to validate player ID with upstream provider at this time.',
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Retrieves available game categories from Bay2Game with 1-hour in-memory cache
   */
  async getCategories(): Promise<Bay2GameCategory[]> {
    const now = Date.now();
    if (this.cachedCategories && this.categoriesExpiresAt > now) {
      return this.cachedCategories;
    }

    const targetUrl = `${this.apiUrl}/categories?api_key=${this.apiKey}`;
    this.logger.log(`🔄 Fetching fresh categories from Bay2Game...`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SakuraAPI-Gateway/1.0',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      if (json.status !== 'success' || !Array.isArray(json.categories)) {
        return this.cachedCategories || [];
      }

      const mapped: Bay2GameCategory[] = json.categories.map((c: any) => ({
        gameCode: c.game_code,
        name: c.name,
        description: c.description || '',
        imageUrl: c.image_url || '',
        gameFields: c.game_fields || ['userid'],
      }));

      this.cachedCategories = mapped;
      this.categoriesExpiresAt = now + 60 * 60 * 1000; // 1 hour

      return mapped;
    } catch (err: any) {
      clearTimeout(timeout);
      this.logger.error(`❌ Bay2Game categories error: ${err.message}`);
      if (this.cachedCategories) {
        return this.cachedCategories;
      }
      return [];
    }
  }
}
