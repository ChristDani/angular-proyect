import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatSnackBarModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  username = signal('');
  password = signal('');

  constructor(private router:Router, private _snackBar: MatSnackBar){}

  login(): void{
    if(this.username()==='admin' && this.password()==='admin'){
      this.router.navigate(['/admin']);
      console.log("correcto");
    }else if(this.username()==='client' && this.password()==='client'){
      this.router.navigate(['/client']);
      console.log("correcto");
    }else{
      this.error()
    }
  }

  clearAlertAndSetUsername(event: any): void{
    this.username.set(event);
  }

  clearAlertAndSetPassword(event: any): void{
    this.password.set(event);
  }

  error() {
    this._snackBar.open('Usuario y/o password incorrecto', '', {
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      duration: 3000,
      panelClass: ['alertStyle']
    });
  }
}
