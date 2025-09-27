import { Component, Inject, Input } from '@angular/core';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../models/interfaces/user.interface';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../shared/services/toast.service';
import { CardService } from '../../core/services/card.service';
import { AccountService } from '../../core/services/account.service';
import { LoanService } from '../../core/services/loan.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../models/interfaces/account.interface';
import { concatMap, map, tap, from, take, switchMap, EMPTY, catchError, of, toArray } from 'rxjs';

@Component({
  selector: 'app-alert-modal',
  imports: [MATERIAL_IMPORTS],
  templateUrl: './alert-modal.html',
  styleUrl: './alert-modal.css',
})
export class AlertModal {
  @Input() user?: User;
  userID = '';
  accountIDs: number[] = [];

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private dialogRef: MatDialogRef<AlertModal, User | null>,
    private cardService: CardService,
    private accountService: AccountService,
    private loanService: LoanService,
    private transactionService: TransactionService,

    @Inject(MAT_DIALOG_DATA) public data?: User
  ) {
    this.userID = this.data?.id || '';
  }
  ngOnInit(): void {
    this.getAccountsByUserId(Number(this.userID));
  }

  close() {
    this.dialogRef.close();
  }

  deleteAlertUser() {
    this.userService.deleteUser(this.userID).subscribe({
      next: (result) => {
        this.toastService.show(`Usuario eliminado exitosamente`, 'error');
        this.dialogRef.close(result);
      },
      error: (error) => {
        console.error('Error eliminando el usuario ', error);
      },
    });
  }

  getAccountsByUserId(user: number | undefined): void {
    this.accountService.getAccounts().subscribe((accounts: Account[]) => {
      if (user !== undefined) {
        const idAccounts = accounts
          .filter((account: Account) => account.userId === user)
          .map((account: Account) => account.id);
        this.accountIDs = idAccounts;
      }
    });
  }
}
