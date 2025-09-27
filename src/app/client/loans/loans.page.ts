import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import {
  Component,
  effect,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
  signal,
  ViewChild,
} from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { startWith, tap, switchMap, catchError, of, forkJoin, map } from 'rxjs';
import { LoanService } from '../../core/services/loan.service';
import { Loan } from '../../models/interfaces/loan.interface';
import { LoanRequestDialog } from './dialogs/loan-request.dialog';
import { LoanSimDialog } from './dialogs/loan-simulator.dialog';
import { AuthService } from '../../auth/auth.service';
import { AccountService } from '../../core/services/account.service';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';

@Component({
  selector: 'app-loans-page',
  templateUrl: './loans.page.html',
  styleUrls: ['./loans.page.css'],
  imports: [
    ...MATERIAL_IMPORTS,
    CurrencyPipe,
    TitleCasePipe,
  ],
})
export class LoansPage {
  private svc = inject(LoanService);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private auth = inject(AuthService);
  private accountSvc = inject(AccountService);

  displayedColumns = ['id', 'accountId', 'amount', 'installments', 'status'];
  dataSource = new MatTableDataSource<Loan>([]);

  loading = signal(true);
  refresh = signal(0);

  loans = toSignal(
    toObservable(this.refresh).pipe(
      startWith(0),
      tap(() => this.loading.set(true)),
      switchMap(() => {
        const user = this.auth.getLoggedInUser();
        if (user == null) {
          this.snack.open('Sesión no encontrada. Inicia sesion.', 'Cerrar', { duration: 3000 });
          return of([] as Loan[]);
        }
        return this.accountSvc.getAccountsByUserId(user.id).pipe(
          switchMap((accounts) => {
            if (!accounts || accounts.length === 0) return of([] as Loan[]);
            const calls = accounts.map((acc) =>
              this.svc.getLoansByAccountId(String(acc.id)).pipe(catchError(() => of([] as Loan[])))
            );
            return forkJoin(calls).pipe(map((chunks) => chunks.flat()));
          })
        );
      }),
      tap(() => this.loading.set(false)),
      catchError(() => {
        this.loading.set(false);
        this.snack.open('No se pudo cargar préstamos.', 'Cerrar', { duration: 3000 });
        return of([] as Loan[]);
      })
    ),
    { initialValue: [] as Loan[] }
  );

  constructor(private injector: EnvironmentInjector) {}

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    runInInjectionContext(this.injector, () => {
      effect(() => {
        this.dataSource.data = this.loans();
      });
    });
  }

  applyFilter(v: string) {
    this.dataSource.filter = v.trim().toLowerCase();
  }

  openSimulator() {
    this.dialog.open(LoanSimDialog, { width: '640px' });
  }

  openRequest() {
    this.dialog
      .open(LoanRequestDialog, { width: '520px' })
      .afterClosed()
      .subscribe((val) => {
        if (!val) return;
        const payload: Loan = { id: `${Date.now()}`, status: 'PENDIENTE', ...val };
        this.svc.createLoan(payload).subscribe({
          next: () => {
            this.snack.open('Préstamo creado', 'OK', { duration: 2000 });
            this.refresh.update((n) => n + 1);
          },
          error: () => this.snack.open('Error creando préstamo', 'Cerrar', { duration: 3000 }),
        });
      });
  }
}
