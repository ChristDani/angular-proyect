import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from '../../shared/components/button/button';
import { Account } from '../../models/interfaces/account.interface';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';
import { Transaction } from '../../models/interfaces/transaction.interface';
import { AuthService } from '../../auth/auth.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';

@Component({
  selector: 'app-accounts',
  imports: [CommonModule, ...MATERIAL_IMPORTS, Button],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts {
  isLoading: boolean = false;
  displayedColumns: string[] = ['fecha', 'operacion', 'descripcion', 'importe'];

  movimientos: Transaction[] = [];
  cuentas: Account[] = [];
  selectedAccount!: Account;

  constructor(
    private auth: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService
  ) {}

  ngOnInit(): void {
    const id = this.auth.getLoggedInUser()?.id;
    this.getAccountsByUserId(Number(id));
  }

  getAccountsByUserId(user: number | undefined): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe((accounts: Account[]) => {
      if (user !== undefined) {
        this.cuentas = accounts.filter((account: Account) => account.userId === user);
        this.selectedAccount = this.cuentas[0];
        this.isLoading = false;
        this.getTransactions();
      }
    });
  }

  getTransactions(): void {
    this.transactionService.getTransactions().subscribe((transactions: Transaction[]) => {
      this.movimientos = transactions;
    });

  }
}
