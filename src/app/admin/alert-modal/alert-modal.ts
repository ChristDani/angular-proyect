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
import {
  concatMap,
  map,
  tap,
  from,
  take,
  switchMap,
  EMPTY,
  catchError,
  of,
  toArray,
  forkJoin,
  finalize,
  Observable,
  mapTo,
} from 'rxjs';

@Component({
  selector: 'app-alert-modal',
  imports: [MATERIAL_IMPORTS],
  templateUrl: './alert-modal.html',
  styleUrl: './alert-modal.css',
})
export class AlertModal {
  @Input() user?: User;
  userID = '';
  accountIDs: string[] = [];
  allAccounts: Account[] = [];

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private dialogRef: MatDialogRef<AlertModal, User | null>,
    private accountService: AccountService,
    private cardService: CardService,
    private loanService: LoanService,
    private transactionService: TransactionService,
    @Inject(MAT_DIALOG_DATA) public data?: User
  ) {
    this.userID = this.data?.id ?? '';
  }

  ngOnInit(): void {
    this.getAccountsForUser(this.userID)
      .pipe(take(1))
      .subscribe((accounts) => {
        this.allAccounts = accounts;
        this.accountIDs = accounts.map((a) => String(a.id));
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  deleteAlertUser(): void {
    const deleteAllResources$ = forkJoin({
      accounts: this.deleteAccountsForUser(this.userID),
      cards: this.deleteCardsForUser(this.userID),
      loans: this.deleteLoansForUser(this.userID),
      transactions: this.deleteTransactionsForUser(this.userID),
    });

    deleteAllResources$
      .pipe(
        take(1),
        switchMap((results) => {
          return this.userService.deleteUser(this.userID);
        }),
        finalize(() => console.log('Flujo de eliminación completado'))
      )
      .subscribe({
        next: (result) => {
          this.toastService.show('Usuario eliminado exitosamente', 'success');
          this.dialogRef.close(result);
        },
        error: (err) => {
          console.error('Error al eliminar usuario o recursos:', err);
          this.toastService.show('Error al eliminar usuario o recursos', 'error');
        },
      });
  }

  /**
   * Cuentas
   */
  private getAccountsForUser(userId: string): Observable<Account[]> {
    const lookup = String(userId);
    return this.accountService.getAccounts().pipe(
      take(1),
      map((accounts: Account[]) => accounts.filter((acc) => String(acc.userId) === lookup))
    );
  }

  private deleteAccountsForUser(
    userId: string
  ): Observable<Array<{ id: any; success: boolean; error?: any }>> {
    return this.getAccountsForUser(userId).pipe(
      switchMap((accounts) => {
        if (!accounts || accounts.length === 0) return of([]);
        const requests = accounts.map((acc) =>
          this.accountService.deleteAccount(acc.id).pipe(
            map(() => ({ id: acc.id, success: true })),
            catchError((err) => of({ id: acc.id, success: false, error: err }))
          )
        );
        return forkJoin(requests);
      })
    );
  }

  /**
   * Tarjetas (cards)
   * - Se asume que CardService tiene un método getCards(): Observable<any[]>
   */
  private getCardsForUser(userId: string): Observable<any[]> {
    const lookup = String(userId);
    return this.cardService.getCards().pipe(
      take(1),
      map((cards: any[]) => cards.filter((c) => String(c.userId) === lookup))
    );
  }

  private deleteCardsForUser(
    userId: string
  ): Observable<Array<{ id: any; success: boolean; error?: any }>> {
    return this.getCardsForUser(userId).pipe(
      switchMap((cards) => {
        if (!cards || cards.length === 0) return of([]);
        const requests = cards.map((card) =>
          this.cardService.deleteCard(card.id).pipe(
            map(() => ({ id: card.id, success: true })),
            catchError((err) => of({ id: card.id, success: false, error: err }))
          )
        );
        return forkJoin(requests);
      })
    );
  }

  /**
   * Préstamos (loans)
   * - Se asume que LoanService tiene un método getLoans(): Observable<any[]>
   */
  private getLoansForUser(userId: string): Observable<any[]> {
    const lookup = String(userId);
    return this.loanService.getLoans().pipe(
      take(1),
      map((loans: any[]) => loans.filter((l) => String(l.userId) === lookup))
    );
  }

  private deleteLoansForUser(
    userId: string
  ): Observable<Array<{ id: any; success: boolean; error?: any }>> {
    return this.getLoansForUser(userId).pipe(
      switchMap((loans) => {
        if (!loans || loans.length === 0) return of([]);
        const requests = loans.map((loan) =>
          this.loanService.deleteLoan(loan.id).pipe(
            map(() => ({ id: loan.id, success: true })),
            catchError((err) => of({ id: loan.id, success: false, error: err }))
          )
        );
        return forkJoin(requests);
      })
    );
  }

  /**
   * Transacciones (transactions)
   * - Se asume que TransactionService tiene un método getTransactions(): Observable<any[]>
   */
  private getTransactionsForUser(userId: string): Observable<any[]> {
    const lookup = String(userId);
    return this.transactionService.getTransactions().pipe(
      take(1),
      map((txs: any[]) => txs.filter((t) => String(t.userId) === lookup))
    );
  }

  private deleteTransactionsForUser(
    userId: string
  ): Observable<Array<{ id: any; success: boolean; error?: any }>> {
    return this.getTransactionsForUser(userId).pipe(
      switchMap((txs) => {
        if (!txs || txs.length === 0) return of([]);
        const requests = txs.map((tx) =>
          this.transactionService.deleteTransaction(tx.id).pipe(
            map(() => ({ id: tx.id, success: true })),
            catchError((err) => of({ id: tx.id, success: false, error: err }))
          )
        );
        return forkJoin(requests);
      })
    );
  }

  /**
   * Eliminación individual pública para cuentas (se puede replicar para otros recursos si se necesita)
   */
  deleteAccountById(id: string): void {
    if (!id) {
      console.warn('No existe ID proporcionado para eliminar');
      return;
    }

    this.accountService
      .deleteAccount(id)
      .pipe(
        take(1),
        map(() => ({ id, success: true })),
        catchError((err) => of({ id, success: false, error: err })),
        finalize(() => console.log('Proceso de eliminación individual finalizado'))
      )
      .subscribe((result) => {
        if ((result as any).success) {
          console.log(`Cuenta ${id} eliminada correctamente`);
        } else {
          console.error(`Error al eliminar cuenta ${id}:`, (result as any).error);
        }
      });
  }
}
