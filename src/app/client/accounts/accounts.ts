import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from '../../shared/components/button/button';
import { Account } from '../../models/interfaces/account.interface';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';
import { Transaction } from '../../models/interfaces/transaction.interface';
import { AuthService } from '../../auth/auth.service';
import { AccountService } from '../../core/services/account.service';
import { TransactionService } from '../../core/services/transaction.service';
import { MatDialog } from '@angular/material/dialog';
import { NewAccountModal } from './new-account-modal/new-account-modal';

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
  userId!: string | undefined;

  constructor(
    private auth: AuthService,
    private accountService: AccountService,
    private transactionService: TransactionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.auth.getLoggedInUser()?.id;
    this.userId = id;
    this.getAccountsByUserId(id);
  }

  getAccountsByUserId(user: string | undefined, isNewUser?: boolean): void {
    this.isLoading = true;
    this.accountService.getAccounts().subscribe((accounts: Account[]) => {
      if (user !== undefined) {
        this.cuentas = accounts.filter((account: Account) => account.userId === user);
      }

      if (isNewUser) {
        this.selectedAccount = this.cuentas[this.cuentas.length - 1];
        this.getTransactions();
      }

      this.isLoading = false;
    });
  }

  onAccountChange(): void {
    if (this.selectedAccount) {
      this.getTransactions();
    } else {
      this.movimientos = [];
    }
  }

  getTransactions(): void {
    this.transactionService.getTransactions().subscribe((transactions: Transaction[]) => {
      if (this.selectedAccount?.id) {
        this.movimientos = transactions.filter(
          (tx: Transaction) => tx.accountId === Number(this.selectedAccount.id)
        );
      } else {
        this.movimientos = [];
      }
    });
  }

  openNewAccountModal() {
    const ref = this.dialog.open(NewAccountModal, {
      width: '600px',
      data: {
        userId: this.userId,
      },
    });

    ref.afterClosed().subscribe((createdProduct) => {
      if (createdProduct) {
        this.getAccountsByUserId(this.userId, true);
      }
    });
  }
}
