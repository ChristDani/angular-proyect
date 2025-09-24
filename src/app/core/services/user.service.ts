import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private http:HttpClient){}

  createUser(user: User): Observable<User>{
    return this.http.post<User>(this.apiUrl, user);
  } 

  getUsers(): Observable<User[]>{
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id:number):Observable<User>{
    return this.http.get<User>(`${this.apiUrl}/${id}`)
  }

  updateUser(user: User): Observable<User>{
    return this.http.put<User>(`${this.apiUrl}/${user.id}`, user);
  }

  deleteUser(id:number):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
