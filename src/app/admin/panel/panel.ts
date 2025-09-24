import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { StatItem, User } from '../../models/interfaces/user.interface';
import { Account } from '../../models/interfaces/account.interface';
import { Loan } from '../../models/interfaces/loan.interface';
import { Card } from '../../models/interfaces/card.interface';
import { UserService } from '../../core/services/user.service';
import { AccountService } from '../../core/services/account.service';
import { LoanService } from '../../core/services/loan.service';
import { CardService } from '../../core/services/card.service';

@Component({
  selector: 'app-panel',
  imports: [MatCardModule, MatButtonModule, MatProgressBarModule,MatIconModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class Panel implements OnInit {

  users : User[] = [];
  accounts : Account[] = [];
  loans : Loan[] = [];
  cards : Card[] = [];

  clientCount: number = 0;
  adminCount: number = 0;
  accountCount: number = 0;
  accountAhorroCount: number = 0;
  accountCorrienteCount: number = 0;
  loanCount: number = 0;
  cardCount: number = 0;
  cardDebitoCount: number = 0;
  cardCreditoCount: number = 0;

  statistics: StatItem[] = [
];

  constructor(
    private router:Router,
    private userService: UserService, 
    private accountService: AccountService, 
    private loanService: LoanService, 
    private cardService: CardService
  ){}

    ngOnInit(): void {    
    this.getUsers();
    this.getAccounts();
    this.getCards()  
    this.getLoans();
  }

  redirectTo(path: string){
    this.router.navigate([`admin/${path}`]);
  }

  getUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.clientCount = this.users.filter( user => user.role==="client").length;
        this.adminCount = this.users.filter( user => user.role==="admin").length;
        const clients = {
          title: 'Usuarios',
          items: [
            { value: this.users.length, label: 'Cantidad total de Usuarios:' }, 
            { value: this.clientCount, label: 'Cantidad de Clientes:' }, 
            { value: this.adminCount, label: 'Cantidad de Administradores:' }, 
          ]       
        }; 
        this.statistics.push(clients);
      },
      error: (error) => {
        console.error('Error en obtener users ', error);
      }
    });
  }

  getAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
         this.accounts=data;
         this.accountCount = this.accounts.length;
         this.accountAhorroCount = this.accounts.filter( account => account.type==="ahorro").length;
         this.accountCorrienteCount = this.accounts.filter( account => account.type==="corriente").length;
         const accounts = {
          title: 'Cuentas',
          items: [
            { value: this.accountCount, label: 'Cantidad total de Cuentas:' },
            { value: this.accountAhorroCount, label: 'Cantidad total de Cuentas Ahorro:' },
            { value: this.accountCorrienteCount, label: 'Cantidad total de Cuentas Corriente:' },
          ]       
        }; 
        this.statistics.push(accounts);
      }, 
      error: (error) => {
        console.error('Error en obtener accounts ', error);
      }
    });
  }

  getLoans(): void {
    this.loanService.getLoans().subscribe({
      next: (data) => {
         this.loans=data;
         this.loanCount = this.loans.length;
        const loans = {
          title: 'Préstamos',
          items: [
            { value: this.accountCount, label: 'Cantidad total de Préstamos:' }
          ]       
        }; 
        this.statistics.push(loans);
      },
      error: (error) => {
        console.error('Error en obtener loans ', error);
      }
    });
  }

  getCards(): void {
    this.cardService.getCards().subscribe({
      next: (data) => {
         this.cards=data;
         this.cardCount = this.cards.length;
         this.cardDebitoCount = this.cards.filter(card => card.type==="débito").length;
         this.cardCreditoCount = this.cards.filter(card => card.type==="crédito").length;
          const cards = {
          title: 'Tarjetas',
          items: [
            { value: this.cardCount, label: 'Cantidad total de Tarjetas:' }, 
            { value: this.cardDebitoCount, label: 'Cantidad de Tarjetas débito:' }, 
            { value: this.cardCreditoCount, label: 'Cantidad de Tarjetas crédito:' }, 
          ]       
        }; 
        this.statistics.push(cards);
      },
      error: (error) => {
        console.error('Error en obtener cards ', error);
      }
    });
  }

}
