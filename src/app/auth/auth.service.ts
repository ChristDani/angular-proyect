import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../models/interfaces/user.interface';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';

  constructor(private router: Router, private http: HttpClient) { }

  autenticacion(username: string, password: string): Observable<User> {

    const params = new HttpParams().set('username', username).set('password', password);

    return this.http.get<User[]>(this.apiUrl, { params }).pipe(
      map(users => {
        if (!users || users.length === 0) {
          throw new Error('Usuario Invalido');
        }

        const { password: _omit, ...safeUser} = users[0] as any as User
        localStorage.setItem('loggedInUser', JSON.stringify(safeUser));
        return safeUser as User ;
      }),
      catchError(err => {
        return throwError(() => err);
      })
    );
  }

  getLoggedInUser(): User | null {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('loggedInUser');
  }

  canActivate(rol: string): boolean {
    if (!this.getLoggedInUser()) {
      this.router.navigate(['/']);
      return false;
    } else {
      if (this.getLoggedInUser()?.role === rol) {
        return true;
      }
      this.router.navigate(['/']);
      return false;
    }
  }

}