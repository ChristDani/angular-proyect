// src/app/transfers/transfers.page.ts
import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule }   from '@angular/material/card';
import { MatIconModule }   from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { TransactionService } from '../../core/services/transaction.service';
import { ITransaction, TxGroupKey } from '../../models/interfaces/transaction.interface';
import { AuthService } from '../../auth/auth.service';
import { TransferBetweenAccountsDialog } from './dialogs/transfer-between-accounts.dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { TransferToThirdDialog } from './dialogs/transfer-to-third.dialog';

@Component({
  selector: 'app-transfers-page',
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './transfers.html',
  styleUrls: ['./transfers.css']
})
export class TransfersPage {
  private svc = inject(TransactionService);
  private auth = inject(AuthService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  // signals
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly transactions = signal<ITransaction[]>([]);

  // usuario actual
  readonly currentUserId = this.auth.getLoggedInUser()?.id ?? '';
  constructor() {
    effect(() => {
      this.loading.set(true);
      this.error.set(null);
      this.svc.getAllUserTransactions(this.currentUserId).subscribe({
        next: txs => {
          this.transactions.set(txs);
          this.loading.set(false);
        },
        error: err => {
          this.error.set('No se pudieron cargar las transacciones');
          this.loading.set(false);
          console.error(err);
        }
      });
    });
  }

  private reloadTransactions() {
    this.loading.set(true);
    this.error.set(null);

    this.svc.getAllUserTransactions(this.currentUserId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: txs => {
          this.transactions.set(txs);
          this.loading.set(false);
        },
        error: err => {
          console.error(err);
          this.error.set('No se pudieron cargar las transacciones');
          this.loading.set(false);
        }
      });
  }


  readonly grouped = computed(() => {
    const todayISO = new Date().toISOString().slice(0, 10);
    const groups = new Map<TxGroupKey, ITransaction[]>();
    for (const t of this.transactions()) {
      const key: TxGroupKey = t.date === todayISO
        ? 'Hoy'
        : this.formatMonthYear(t.date);
      const list = groups.get(key) ?? [];
      list.push(t);
      groups.set(key, list);
    }
    const entries = Array.from(groups.entries()).sort((a, b) => {
      if (a[0] === 'Hoy') return -1;
      if (b[0] === 'Hoy') return 1;
      const da = this.monthYearToDate(a[0]);
      const db = this.monthYearToDate(b[0]);
      return db.getTime() - da.getTime();
    });
    return entries;
  });

  private formatMonthYear(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
      .replace(/^\w/, c => c.toUpperCase());
  }

  private monthYearToDate(label: string) {
    const [mes, anio] = label.split(' ');
    const monthIdx = [
      'enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre'
    ].findIndex(m => m.toLowerCase() === mes.toLowerCase());
    return new Date(Number(anio), monthIdx, 1);
  }

  doOwnTransfer() {
    this.dialog.open(TransferBetweenAccountsDialog, {
      panelClass: 'dialog-rounded'
    })
    .afterClosed()
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(res => {
      if (res?.ok) this.reloadTransactions();
    });
  }

  doThirdTransfer() {
    this.dialog.open(TransferToThirdDialog, { panelClass: 'dialog-rounded' })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(res => {
        if (res?.ok) this.reloadTransactions();
      });
  }

  doPayServices()   { /* abre modal o navega */ }

  isOutflow(t: ITransaction) { return t.amount < 0; }
}
