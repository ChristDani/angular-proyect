import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITransaction, transactionType } from '../../models/interfaces/transaction.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class STransactions {
  private transactions: ITransaction[] = [];
  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:3000/transactions';

  private loadTransactions(): Observable<ITransaction[]> {
    return this.http.get<ITransaction[]>(this.apiUrl);
  }

  private isSameDay(date1: Date | null, date2: Date | null): boolean {
    if (!date1 || !date2) return true;
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  ngOnInit() {
    this.loadTransactions().subscribe(data => {
      this.transactions = data;
    });
  }

  async getAllTransactions(type?: transactionType, date?: string): Promise<ITransaction[]> {
    try {
      const allTransactions = await this.loadTransactions().toPromise();
      const searchDate = date ? new Date(date) : null;
      return (allTransactions || []).filter(transaction => {
        let matches = true;

        if (type) {
          matches = matches && transaction.type === type;
        }

        if (searchDate) {
          matches = matches && this.isSameDay(new Date(transaction.date), searchDate);
        }

        return matches;
      });
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  }

  
}