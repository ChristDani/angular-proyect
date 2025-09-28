import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalTransferBetweenAccounts } from '../../shared/components/modals/modal-transfer-between-accounts/modal-transfer-between-accounts';
import { ITransaction, transactionType } from '../../models/interfaces/transaction.interface';
import { STransactions } from '../../shared/services/transactions';
import { ModalThirdTransfer } from '../../shared/components/modals/modal-third-transfer/modal-third-transfer';
import { ModalServicePayment } from '../../shared/components/modals/modal-service-payment/modal-service-payment';
import { TransactionDateTimePipe } from '../../shared/pipes/transaction-datetime.pipe';

interface Transaction {
  id: number;
  type: string;
  date: Date;
  amount: number;
  description: string;
  currency: 'USD' | 'PEN';
}

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, TransactionDateTimePipe],
  templateUrl: './transfers.html',
  styleUrls: ['./transfers.css'],
})
export class TransfersComponent implements OnInit {
  private transactionsService = inject(STransactions);
  transactions = signal<ITransaction[]>([]);
  typeFilter = signal<transactionType | undefined>(undefined);
  dateFilter = signal<string | undefined>(undefined);

  constructor(private dialog: MatDialog) {}

  async getAllTransactions(type: transactionType | undefined, date: string | undefined) {
    try {
      const transactions = await this.transactionsService.getAllTransactions(type, date);
      this.transactions.set(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  openTransferModal(type: 'own' | 'third' | 'service'): void {
    switch (type) {
      case 'own':
        const ModalTBA = this.dialog.open(ModalTransferBetweenAccounts);

        ModalTBA.afterClosed().subscribe((result) => {
          if (result) {
            // Crear nueva transacción basada en el resultado del modal
            const newTransaction: ITransaction = {
              id: Date.now().toString(), // ID temporal
              accountId: result.cuentaOrigen?.id || 0,
              date: new Date().toISOString().split('T')[0], // Fecha actual en formato YYYY-MM-DD
              type: 'transf.bco',
              amount: -result.monto, // Negativo porque es una salida
              description: `Transferencia a cuenta ${result.cuentaDestino?.accountNumber}`,
              currency: result.moneda
            };

            // Agregar la nueva transacción a la lista actual
            const currentTransactions = this.transactions();
            this.transactions.set([newTransaction, ...currentTransactions]);

            this.refreshTransactions();
          }
        });
        break;
      case 'third':
        const ModalTT = this.dialog.open(ModalThirdTransfer);

        ModalTT.afterClosed().subscribe((result) => {
          if (result) {
            // Crear nueva transacción basada en el resultado del modal
            const newTransaction: ITransaction = {
              id: Date.now().toString(), // ID temporal
              accountId: result.cuentaOrigen?.id || 0,
              date: new Date().toISOString(), // Fecha y hora completa en formato ISO
              type: 'transf.bco',
              amount: -result.monto, // Negativo porque es una salida
              description: `Transferencia a cuenta ${result.cuentaDestino?.accountNumber}`,
              currency: result.moneda
            };

            // Agregar la nueva transacción a la lista actual
            const currentTransactions = this.transactions();
            this.transactions.set([newTransaction, ...currentTransactions]);

            this.refreshTransactions();
          }
        });
        break;
      case 'service':
        const ModalTS = this.dialog.open(ModalServicePayment);

        ModalTS.afterClosed().subscribe((result) => {
          if (result) {
            // Crear nueva transacción basada en el resultado del modal
            const newTransaction: ITransaction = {
              id: Date.now().toString(), // ID temporal
              accountId: result.cuentaOrigen?.id || 0,
              date: new Date().toISOString(), // Fecha y hora completa en formato ISO
              type: 'pago serv',
              amount: -result.monto, // Negativo porque es una salida
              description: `Transferencia a cuenta ${result.cuentaDestino?.accountNumber}`,
              currency: result.moneda
            };

            // Agregar la nueva transacción a la lista actual
            const currentTransactions = this.transactions();
            this.transactions.set([newTransaction, ...currentTransactions]);

            this.refreshTransactions();
          }
        });
        break;
    }
  }

  refreshTransactions(): void {
    this.ngOnInit();
  }

  resetFilters(): void {
    this.typeFilter.set(undefined);
    this.dateFilter.set(undefined);
    this.refreshTransactions();
  }

  // Agrupar transacciones por fecha
  get groupedTransactions(): { key: string; value: ITransaction[] }[] {
    // First sort all transactions by date (most recent first)
    const sortedTransactions = this.transactions().sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Group transactions by display date
    const groups = sortedTransactions.reduce((groups, transaction) => {
      // Parse ISO date string (includes time)
      const transactionDate = new Date(transaction.date);

      // Ensure valid date
      if (isNaN(transactionDate.getTime())) {
        console.warn('Invalid date found:', transaction.date);
        return groups;
      }

      let displayDate: string;
      if (this.isToday(transactionDate)) {
        displayDate = 'Hoy';
      } else if (this.isYesterday(transactionDate)) {
        displayDate = 'Ayer';
      } else if (this.isThisMonth(transactionDate)) {
        displayDate = 'Este mes';
      } else {
        displayDate = `${this.getMonthName(transactionDate.getMonth())} ${transactionDate.getFullYear()}`;
      }

      if (!groups[displayDate]) {
        groups[displayDate] = [];
      }
      groups[displayDate].push(transaction);
      return groups;
    }, {} as { [key: string]: ITransaction[] });

    // Sort the groups by date: "Hoy", "Ayer", "Este mes", then by most recent date
    return Object.entries(groups)
      .sort(([dateA], [dateB]) => {
        // Priority order: Hoy > Ayer > Este mes > other months
        const getPriority = (date: string): number => {
          if (date === 'Hoy') return 1;
          if (date === 'Ayer') return 2;
          if (date === 'Este mes') return 3;
          return 4; // Other months
        };

        const priorityA = getPriority(dateA);
        const priorityB = getPriority(dateB);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // If both are other months, sort by date
        if (priorityA === 4 && priorityB === 4) {
          // Extract month and year from display date
          const [monthNameA, yearA] = dateA.split(' ');
          const [monthNameB, yearB] = dateB.split(' ');

          // Convert month names to numbers (0-based index)
          const monthA = this.getMonthNumber(monthNameA);
          const monthB = this.getMonthNumber(monthNameB);

          // Handle invalid month names
          if (monthA === -1 || monthB === -1) {
            console.warn('Invalid month name found:', monthNameA, monthNameB);
            return 0;
          }

          // Create dates for comparison (using day 1 as reference)
          const dateAObj = new Date(parseInt(yearA), monthA, 1);
          const dateBObj = new Date(parseInt(yearB), monthB, 1);

          // Sort from most recent to oldest
          return dateBObj.getTime() - dateAObj.getTime();
        }

        return 0;
      })
      .map(([key, value]) => ({ key, value }));
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  }

  private isThisMonth(date: Date): boolean {
    const today = new Date();
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months[month];
  }

  private getMonthNumber(monthName: string): number {
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    return months.indexOf(monthName);
  }

  ngOnInit() {
    this.getAllTransactions(this.typeFilter(), this.dateFilter());
  }
}
