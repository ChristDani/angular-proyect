export interface OperationConfirmData {
  type: 'transfer-between-accounts' | 'transfer-to-third' | 'service-payment';
  success: boolean;
  operationId: string;
  timestamp: string;
  fromAccount?: {
    id: string;
    type: string;
    currency: 'USD' | 'PEN';
    balance: number;
  };
  toAccount?: {
    id: string;
    type: string;
    currency: 'USD' | 'PEN';
    balance: number;
  };
  thirdPartyAccount?: string;
  service?: {
    id: string;
    name: string;
    category: string;
  };
  amount: number;
  currency: 'USD' | 'PEN';
  convertedAmount?: number;
  convertedCurrency?: 'USD' | 'PEN';
  exchangeRate?: number;
  description?: string;
  fees?: number;
}