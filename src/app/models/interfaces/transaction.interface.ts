
export interface Transaction{
  id : number;
  accountId: number;
  date: string;
  type: string;
  amount: number;
  description: string;
}