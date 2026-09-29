export interface ProviderOrderRequest {
  gameCode: string;
  productCode: string;
  playerId: string;
  serverId?: string;
  partnerOrderId: string;
}

export interface ProviderOrderResponse {
  success: boolean;
  providerOrderId?: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  message?: string;
  rawData?: any;
}

export interface ProviderStatusResponse {
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  message?: string;
  rawData?: any;
}

export interface ProviderBalanceResponse {
  balance: number;
  currency: string;
}
