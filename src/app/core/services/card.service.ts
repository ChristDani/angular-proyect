import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Card } from '../../models/interfaces/card.interface';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = 'http://localhost:3000/cards';

  constructor(private http:HttpClient){}

  createCard(card: Card): Observable<Card>{
    return this.http.post<Card>(this.apiUrl, card);
  } 

  getCards(): Observable<Card[]>{
    return this.http.get<Card[]>(this.apiUrl);
  }

  getCardById(id:number):Observable<Card>{
    return this.http.get<Card>(`${this.apiUrl}/${id}`)
  }

  updateCard(card: Card): Observable<Card>{
    return this.http.put<Card>(`${this.apiUrl}/${card.id}`, card);
  }

  deleteCard(id:number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}