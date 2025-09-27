import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  username = signal('');
  password = signal('');

  constructor(private router: Router, private auth: AuthService, private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    if (this.auth.getLoggedInUser()?.role === 'admin') {
      this.router.navigate(['/admin']);
    }

    if (this.auth.getLoggedInUser()?.role === 'client') {
      this.router.navigate(['/client']);
    }
  }

  login(): void {
    this.auth.autenticacion(this.username(), this.password()).subscribe({
      next: (user) => {
        if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        }
        if (user.role === 'client') {
          this.router.navigate(['/client']);
        }
      },
      error: (err) => {
        this.error();
        console.log(err);
      },
    });
  }

  clearAlertAndSetUsername(event: any): void {
    this.username.set(event);
  }

  clearAlertAndSetPassword(event: any): void {
    this.password.set(event);
  }

  error() {
    this._snackBar.open('Usuario y/o password incorrecto', '', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3000,
      panelClass: ['alertStyle'],
    });
  }
}
