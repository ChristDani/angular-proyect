
export interface ITransaction{
  id : string;
  accountId: string;
  date: string;
  type: string;
  amount: number;
  description: string;
  currency: 'USD' | 'PEN';
}

export type transactionType =
  | 'transf.bco'
  | 'pago serv'
  | 'pago tarj'
  | 'depósito'
  | 'retiro'
  | 'compra'
  | 'venta';
