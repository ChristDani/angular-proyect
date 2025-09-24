import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Loan } from '../../models/interfaces/loan.interface';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = 'http://localhost:3000/loans';

  constructor(private http:HttpClient){}

  createLoan(loan: Loan): Observable<Loan>{
    return this.http.post<Loan>(this.apiUrl, loan);
  } 

  getLoans(): Observable<Loan[]>{
    return this.http.get<Loan[]>(this.apiUrl);
  }

  getLoanById(id:number):Observable<Loan>{
    return this.http.get<Loan>(`${this.apiUrl}/${id}`)
  }

  updateLoan(loan: Loan): Observable<Loan>{
    return this.http.put<Loan>(`${this.apiUrl}/${loan.id}`, loan);
  }

  deleteLoan(id:number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}