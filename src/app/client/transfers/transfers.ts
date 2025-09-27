import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalTransferBetweenAccounts } from '../../shared/components/modals/modal-transfer-between-accounts/modal-transfer-between-accounts';
import { ITransaction, transactionType } from '../../models/interfaces/transaction.interface';
import { STransactions } from '../../shared/services/transactions';

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
  imports: [
    CommonModule, 
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './transfers.html',
  styleUrls: ['./transfers.css']
})
export class TransfersComponent implements OnInit {
  private transactionsService = inject(STransactions);
  transactions = signal<ITransaction[]>([]);
  typeFilter = signal<transactionType | undefined>(undefined);
  dateFilter = signal<string | undefined>(undefined);

  constructor(private dialog: MatDialog) {}

  async getAllTransactions() {
    try {
      const transactions = await this.transactionsService.getAllTransactions(this.typeFilter(), this.dateFilter());
      this.transactions.set(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }

  openTransferModal(type: 'own' | 'third' | 'service'): void {
    switch(type) {
      case 'own':
        const dialogRef = this.dialog.open(ModalTransferBetweenAccounts);

        dialogRef.afterClosed().subscribe(result => {
          if (result) {
            // Actualizar lista de transacciones
            this.refreshTransactions();
          }
        });
        break;
      case 'third':
        // Implementar modal para transferencias a terceros
        break;
      case 'service':
        // Implementar modal para pago de servicios
        break;
    }
  }

  refreshTransactions(): void {
    // Aquí iría la lógica para actualizar la lista de transacciones
    // Por ahora solo recargamos los datos simulados
    this.ngOnInit();
  }

  resetFilters(): void {
    this.typeFilter.set(undefined);
    this.dateFilter.set(undefined);
    this.refreshTransactions();
  }

  openFilterSettings(): void {
    // Implementar modal de configuración de filtros
  }

  // Agrupar transacciones por fecha
  get groupedTransactions(): { [key: string]: ITransaction[] } {
    return this.transactions()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reduce((groups, transaction) => {
        const transactionDate = new Date(transaction.date);
        const dateKey = transactionDate.toISOString().split('T')[0]; // Use ISO date as key for accurate grouping
        const displayDate = this.isToday(transactionDate) ? 
          'Hoy' : 
          `${this.getMonthName(transactionDate.getMonth())} ${transactionDate.getFullYear()}`;
        
        if (!groups[displayDate]) {
          groups[displayDate] = [];
        }
        groups[displayDate].push(transaction);
        return groups;
      }, {} as { [key: string]: ITransaction[] });
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }

  private getMonthName(month: number): string {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
  }

  ngOnInit() {
    this.getAllTransactions();
  }
}
