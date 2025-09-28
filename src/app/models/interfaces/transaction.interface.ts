
export interface ITransaction{
  id : string;
  accountId: string;
  date: string; // Formato ISO string con fecha y hora: "2025-09-28T10:30:00.000Z"
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
