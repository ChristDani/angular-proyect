export interface ITransaction {
  id: number;
  accountId: number;
  date: string;
  type: string;
  amount: number;
  description: string;
  currency: 'USD' | 'PEN';
}

export type transactionType =
  | 'TRANSF.BCO'
  | 'PAGO SERV'
  | 'PAGO TARJ'
  | 'DEPÓSITO'
  | 'RETIRO'
  | 'COMPRA'
  | 'VENTA';
