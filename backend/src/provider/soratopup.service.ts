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
    this.apiKey = this.configService.get<string>('SORATOPUP_API_KEY') || '';
    // Enable simulation sandbox if key is empty or dummy for local testing
    this.isMockMode = !this.apiKey || this.apiKey.includes('dummy') || this.apiKey.includes('your_');
    if (this.isMockMode) {
      this.logger.warn('⚠️ SoraTopup API running in SANDBOX SIMULATION mode for local development.');
    } else {
      this.logger.log(`✓ SoraTopup API live client configured: ${this.baseUrl}`);
    }
  }

  /**
   * Dispatches a game top-up order to SoraTopup API
   */
  async createTopupOrder(request: ProviderOrderRequest): Promise<ProviderOrderResponse> {
    if (this.isMockMode) {
      return this.simulateTopupOrder(request);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      // SoraTopup standard endpoint adapter
      const endpoint = `${this.baseUrl}/orders`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          game: request.gameCode,
          product: request.productCode,
          player_id: request.playerId,
          server_id: request.serverId,
          partner_order_id: request.partnerOrderId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const json = await response.json();

      if (!response.ok) {
        this.logger.error(`SoraTopup API Error (${response.status}): ${JSON.stringify(json)}`);
        return {
          success: false,
          status: 'FAILED',
          message: json.message || json.error?.message || `Provider returned HTTP ${response.status}`,
          rawData: json,
        };
      }

      const providerOrderId = json.data?.order_id || json.order_id || json.id;
      const statusRaw = (json.data?.status || json.status || 'PENDING').toUpperCase();
      const status = statusRaw === 'SUCCESS' ? 'SUCCESS' : statusRaw === 'FAILED' ? 'FAILED' : 'PENDING';

      return {
        success: status !== 'FAILED',
        providerOrderId: providerOrderId ? String(providerOrderId) : undefined,
        status,
        message: json.message || 'Order dispatched to SoraTopup successfully',
        rawData: json,
      };
    } catch (err: any) {
      this.logger.error(`SoraTopup Network / Exception: ${err.message}`);
      if (err.name === 'AbortError') {
        return {
          success: false,
          status: 'PENDING', // If timed out, treat as pending to avoid premature double charges
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
   */
  async checkOrderStatus(providerOrderId: string): Promise<ProviderStatusResponse> {
    if (this.isMockMode) {
      // Simulate successful confirmation
      return {
        status: 'SUCCESS',
        message: 'Order fulfilled successfully (Sandbox simulation)',
      };
    }

    try {
      const endpoint = `${this.baseUrl}/orders/${encodeURIComponent(providerOrderId)}`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept': 'application/json',
        },
      });

      const json = await response.json();
      if (!response.ok) {
        return {
          status: 'FAILED',
          message: json.message || 'Failed to check order status',
          rawData: json,
        };
      }

      const statusRaw = (json.data?.status || json.status || 'PENDING').toUpperCase();
      const status = statusRaw === 'SUCCESS' ? 'SUCCESS' : statusRaw === 'FAILED' ? 'FAILED' : 'PENDING';

      return {
        status,
        message: json.message,
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
        },
      });
      const json = await response.json();
      const bal = json.data?.balance || json.balance || 0;
      const curr = json.data?.currency || json.currency || 'USD';
      return { balance: parseFloat(bal), currency: curr };
    } catch {
      return { balance: 0, currency: 'USD' };
    }
  }

  /**
   * Sandbox simulator for realistic local development & automated testing
   */
  private simulateTopupOrder(request: ProviderOrderRequest): ProviderOrderResponse {
    // If player_id starts with '9999', simulate immediate failure to test refund logic
    if (request.playerId.startsWith('9999') || request.playerId === '00000000') {
      return {
        success: false,
        status: 'FAILED',
        message: 'Invalid Player ID / Target account not found (Simulated error)',
      };
    }

    // If player_id starts with '8888', simulate pending order
    if (request.playerId.startsWith('8888')) {
      const mockId = `SORA-SIM-PND-${Date.now().toString().slice(-6)}`;
      return {
        success: true,
        providerOrderId: mockId,
        status: 'PENDING',
        message: 'Order received and being processed by game server (Simulated)',
      };
    }

    // Default: Immediate success
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
