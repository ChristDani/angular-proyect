import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { AccountService } from '../../core/services/account.service';
import { CardService } from '../../core/services/card.service';
import { LoanService } from '../../core/services/loan.service';
import { Account } from '../../models/interfaces/account.interface';
import { Card } from '../../models/interfaces/card.interface';
import { Loan } from '../../models/interfaces/loan.interface';
import { CommonModule, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  isLoadingAccount: boolean = false;
  isLoadingCard: boolean = false;
  isLoadingLoan: boolean = false;

  mensajeAccount: string = '';
  mensajeCard: string = '';
  mensajeLoan: string = '';

  id: string | undefined;
  accountIds: string[] = [];
  accounts: Account[] = [];
  cards: Card[] = [];
  loans: Loan[] = [];

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private cardService: CardService,
    private loanService: LoanService
  ) {}

  ngOnInit(): void {
    this.id = this.authService.getLoggedInUser()?.id;
    this.isLoadingAccount = true;
    this.isLoadingCard = true;
    this.isLoadingLoan = true;
    this.mensajeAccount = '...Consultando cuentas...';
    this.mensajeCard = '...Consultando tarjetas...';
    this.mensajeLoan = '...Consultando préstamos...';
    this.getAccounts();
  }

  getAccounts() {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.accounts = data.filter((da) => da.userId === this.id);
          if (this.accounts.length === 0) {
            this.mensajeAccount = 'No hay cuentas registradas';
          } else {
            this.accountIds = this.accounts.map((account) => account.id.toString());
            if (this.accountIds.length > 0) {
              this.getCards();
              this.getLoans();
            } else {
              this.mensajeCard = 'No hay tarjetas registradas';
              this.mensajeLoan = 'No hay préstamos registrados';
            }
          }
        } else {
          this.mensajeAccount = 'No hay cuentas registradas';
        }
        this.isLoadingAccount = false;
      },
      error: (error) => {
        this.isLoadingAccount = false;
        this.mensajeAccount = 'Error, no se pudo obtener las cuentas';
        console.error('Error en obtener accounts ', error);
      },
    });
  }

  getCards() {
    this.cardService.getCards().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.cards = data.filter((da) => this.accountIds.includes(da.accountId.toString()));
          if (this.cards.length === 0) {
            this.mensajeCard = 'No hay tarjetas registradas';
          }
        } else {
          this.mensajeCard = 'No hay tarjetas registradas';
        }
        this.isLoadingCard = false;
      },
      error: (error) => {
        this.isLoadingCard = false;
        this.mensajeCard = 'Error, no se pudo obtener las tarjetas';
        console.error('Error en obtener tarjetas ', error);
      },
    });
  }

  getLoans() {
    this.loanService.getLoans().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.loans = data.filter((da) => this.accountIds.includes(da.accountId.toString()));
          if (this.loans.length === 0) {
            this.mensajeLoan = 'No hay préstamos registradas';
          }
        } else {
          this.mensajeLoan = 'No hay préstamos registradas';
        }
        this.isLoadingLoan = false;
      },
      error: (error) => {
        this.isLoadingLoan = false;
        this.mensajeLoan = 'Error, no se pudo obtener los préstamos';
        console.error('Error en obtener préstamos ', error);
      },
    });
  }
}
