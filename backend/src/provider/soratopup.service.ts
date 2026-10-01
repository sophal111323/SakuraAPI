import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ProviderOrderRequest,
  ProviderOrderResponse,
  ProviderStatusResponse,
  ProviderBalanceResponse,
} from './interfaces/provider.interface';

@Injectable()
export class SoraTopupService {
  private readonly logger = new Logger(SoraTopupService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly isMockMode: boolean;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('SORATOPUP_BASE_URL') || 'https://soratopup.com/api/v1';
    this.apiKey = this.configService.get<string>('SORATOPUP_API_KEY') || 'sk_ad0001261f143a7087c74da6d726307b9df9a2fb81cd9399';
    this.isMockMode = !this.apiKey || this.apiKey.includes('dummy') || this.apiKey.includes('your_');
    if (this.isMockMode) {
      this.logger.warn('⚠️ SoraTopup API running in SANDBOX SIMULATION mode for local development.');
    } else {
      this.logger.log(`✓ SoraTopup API live client configured: ${this.baseUrl} with active API Key`);
    }
  }

  /**
   * Normalize internal game codes to SoraTopup provider codes
   */
  private mapGameCode(code: string): string {
    const clean = code.toLowerCase().trim();
    const map: Record<string, string> = {
      'free-fire': 'ff',
      'freefire': 'ff',
      'ff': 'ff',
      'free-fire-id': 'ffid',
      'mobile-legends': 'ml',
      'mobilelegends': 'ml',
      'mlbb': 'ml',
      'ml': 'ml',
      'pubg-mobile': 'pubgm',
      'pubgm': 'pubgm',
      'genshin-impact': 'genshinimpactglobal2',
      'genshin': 'genshinimpactglobal2',
      'honor-of-kings': 'hok',
      'hok': 'hok',
      'arena-of-valor': 'arenaofvalorglobal',
      'aov': 'arenaofvalorglobal',
    };
    return map[clean] || clean;
  }

  /**
   * Dispatches a game top-up order to SoraTopup API
   * Endpoint: POST https://soratopup.com/api/v1/order
   */
  async createTopupOrder(request: ProviderOrderRequest): Promise<ProviderOrderResponse> {
    if (this.isMockMode) {
      return this.simulateTopupOrder(request);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const endpoint = `${this.baseUrl}/order`;
      const providerGameCode = this.mapGameCode(request.gameCode);

      // Build payload matching SoraTopup's dynamic field requirements
      const payload: Record<string, any> = {
        game: providerGameCode,
        code: request.productCode,
        idempotency_key: request.partnerOrderId,
        playerId: request.playerId,
      };

      if (request.serverId) {
        payload.serverId = request.serverId;
      }

      this.logger.log(`Dispatching order to SoraTopup: ${JSON.stringify(payload)}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
          'Idempotency-Key': request.partnerOrderId,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const json = await response.json();

      if (!response.ok || json.ok === false) {
        this.logger.error(`SoraTopup Order Error (${response.status}): ${JSON.stringify(json)}`);
        return {
          success: false,
          status: 'FAILED',
          message: json.msg || json.message || json.error || `Provider error: ${response.status}`,
          rawData: json,
        };
      }

      // Successful order response
      const providerOrderId = json.refid || json.ref || json.orderId || json.data?.order_id || json.id;
      const statusRaw = (json.status || json.running || json.data?.status || 'PENDING').toUpperCase();
      const status = statusRaw === 'SUCCESS' ? 'SUCCESS' : statusRaw === 'FAILED' ? 'FAILED' : 'PENDING';

      return {
        success: status !== 'FAILED',
        providerOrderId: providerOrderId ? String(providerOrderId) : undefined,
        status,
        message: json.msg || json.message || 'Order placed successfully on SoraTopup',
        rawData: json,
      };
    } catch (err: any) {
      this.logger.error(`SoraTopup Order Exception: ${err.message}`);
      if (err.name === 'AbortError') {
        return {
          success: false,
          status: 'PENDING',
          message: 'Upstream provider timed out. Order is queued for status verification.',
        };
      }
      return {
        success: false,
        status: 'FAILED',
        message: err.message || 'Network error reaching SoraTopup API',
      };
    }
  }

  /**
   * Checks the status of an existing order from SoraTopup
   * Endpoint: GET https://soratopup.com/api/v1/order?ref=<code>
   */
  async checkOrderStatus(providerOrderId: string): Promise<ProviderStatusResponse> {
    if (this.isMockMode) {
      return {
        status: 'SUCCESS',
        message: 'Order fulfilled successfully (Sandbox simulation)',
      };
    }

    try {
      const endpoint = `${this.baseUrl}/order?ref=${encodeURIComponent(providerOrderId)}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      });

      const json = await response.json();
      if (!response.ok || json.ok === false) {
        return {
          status: 'FAILED',
          message: json.msg || json.message || 'Failed to check order status',
          rawData: json,
        };
      }

      const statusRaw = (json.status || json.running || json.data?.status || 'PENDING').toUpperCase();
      const status = statusRaw === 'SUCCESS' ? 'SUCCESS' : (statusRaw === 'FAILED' || statusRaw === 'CANCELLED' || statusRaw === 'REJECTED') ? 'FAILED' : 'PENDING';

      return {
        status,
        message: json.msg || json.message || 'Order status checked',
        rawData: json,
      };
    } catch (err: any) {
      return {
        status: 'PENDING',
        message: `Network error verifying status: ${err.message}`,
      };
    }
  }

  /**
   * Gets current reseller account balance at SoraTopup
   * Endpoint: GET https://soratopup.com/api/v1/balance
   */
  async getProviderBalance(): Promise<ProviderBalanceResponse> {
    if (this.isMockMode) {
      return { balance: 9999.0, currency: 'USD' };
    }

    try {
      const endpoint = `${this.baseUrl}/balance`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      });

      const json = await response.json();
      const bal = json.balance !== undefined ? json.balance : (json.data?.balance || 0);
      const curr = json.currency || json.data?.currency || 'USD';
      return { balance: parseFloat(bal), currency: curr };
    } catch (err: any) {
      this.logger.error(`Error fetching SoraTopup balance: ${err.message}`);
      return { balance: 0, currency: 'USD' };
    }
  }

  /**
   * Fetch full game catalogue from SoraTopup
   * Endpoint: GET https://soratopup.com/api/v1/catalogue
   */
  async getCatalogue(): Promise<any[]> {
    try {
      const endpoint = `${this.baseUrl}/catalogue`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      });
      const json = await response.json();
      return json.games || json.data || [];
    } catch (err: any) {
      this.logger.error(`Error fetching SoraTopup catalogue: ${err.message}`);
      return [];
    }
  }

  /**
   * Fetch packages/denominations for a specific game
   * Endpoint: GET https://soratopup.com/api/v1/packages?game=<code>
   */
  async getPackages(gameCode: string): Promise<any[]> {
    try {
      const providerGameCode = this.mapGameCode(gameCode);
      const endpoint = `${this.baseUrl}/packages?game=${encodeURIComponent(providerGameCode)}`;
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      });
      const json = await response.json();
      return json.packages || json.data || [];
    } catch (err: any) {
      this.logger.error(`Error fetching SoraTopup packages for ${gameCode}: ${err.message}`);
      return [];
    }
  }

  /**
   * Sandbox simulator for realistic local development & automated testing
   */
  private simulateTopupOrder(request: ProviderOrderRequest): ProviderOrderResponse {
    if (request.playerId.startsWith('9999') || request.playerId === '00000000') {
      return {
        success: false,
        status: 'FAILED',
        message: 'Invalid Player ID / Target account not found (Simulated error)',
      };
    }

    if (request.playerId.startsWith('8888')) {
      const mockId = `SORA-SIM-PND-${Date.now().toString().slice(-6)}`;
      return {
        success: true,
        providerOrderId: mockId,
        status: 'PENDING',
        message: 'Order received and being processed by game server (Simulated)',
      };
    }

    const mockId = `SORA-SIM-OK-${Date.now().toString().slice(-6)}`;
    return {
      success: true,
      providerOrderId: mockId,
      status: 'SUCCESS',
      message: 'Game account credited successfully (Simulated fulfillment)',
      rawData: {
        upstream_tx: mockId,
        delivered_at: new Date().toISOString(),
      },
    };
  }
}
