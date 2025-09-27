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
    private cardService: CardService,
    private accountService: AccountService,
    private loanService: LoanService,
    private transactionService: TransactionService,
    @Inject(MAT_DIALOG_DATA) public data?: User
  ) {
    this.userID = this.data?.id ?? '';
  }

  ngOnInit(): void {
    console.log('UserID:', this.userID);
    // precarga opcional de cuentas
    this.getAccountsForUser(this.userID)
      .pipe(take(1))
      .subscribe((accounts) => {
        this.allAccounts = accounts;
        this.accountIDs = accounts.map((a) => String(a.id));
        console.log('Cuentas cargadas:', this.accountIDs);
      });
  }

  close(): void {
    this.dialogRef.close();
  }

  /**
   * Elimina todas las cuentas del usuario y luego elimina el usuario.
   * Si no hay cuentas, solo elimina el usuario.
   */
  deleteAlertUser(): void {
    console.log('Iniciando eliminación de cuentas y usuario:', this.userID);

    this.deleteAccountsForUser(this.userID)
      .pipe(
        take(1),
        switchMap((results) => {
          // Log de resultados individuales de eliminación de cuentas
          if (results.length > 0) {
            console.log('Resultados de eliminación de cuentas:', results);
          } else {
            console.log('No se encontraron cuentas a eliminar para el usuario.');
          }

          // Luego eliminar el usuario
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
          console.error('Error al eliminar usuario o cuentas:', err);
          this.toastService.show('Error al eliminar usuario', 'error');
        },
      });
  }

  /**
   * Devuelve las cuentas del usuario (compatibiliza userId que puede ser number o string).
   */
  private getAccountsForUser(userId: string): Observable<Account[]> {
    const lookup = String(userId);
    return this.accountService.getAccounts().pipe(
      take(1),
      map((accounts: Account[]) => accounts.filter((acc) => String(acc.userId) === lookup))
    );
  }

  /**
   * Elimina en paralelo todas las cuentas del usuario.
   * Devuelve un arreglo con el resultado por cuenta { id, success, error? }.
   */
  private deleteAccountsForUser(
    userId: string
  ): Observable<Array<{ id: any; success: boolean; error?: any }>> {
    return this.getAccountsForUser(userId).pipe(
      switchMap((accounts) => {
        if (!accounts || accounts.length === 0) {
          return of([]);
        }

        const requests = accounts.map((acc) =>
          this.accountService.deleteAccount(String(acc.id)).pipe(
            // Si falla una eliminación, transformamos el error en resultado para no cancelar el forkJoin
            map(() => ({ id: acc.id, success: true })),
            catchError((err) => of({ id: acc.id, success: false, error: err }))
          )
        );

        return forkJoin(requests);
      })
    );
  }

  /**
   * Método público para eliminar una cuenta específica por id.
   */
  deleteAccountById(id: string): void {
    if (!id) {
      console.warn('No existe ID proporcionado para eliminar');
      return;
    }

    this.accountService
      .deleteAccount(String(id))
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
