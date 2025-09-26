import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalOpComponent } from '../../shared/components/modals/modal-op/modal-op';

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
  transactions: Transaction[] = [];
  typeFilter: string = '';
  dateFilter: string = '';

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    // Simular datos de transacciones
    this.transactions = [
      {
        id: 1,
        type: 'TRANSF.BCO',
        date: new Date(),
        amount: -1000000.00,
        description: 'Transferencia bancaria',
        currency: 'USD'
      },
      {
        id: 2,
        type: 'TRANSF.BCO',
        date: new Date(2025, 8, 19),
        amount: -1000000.00,
        description: 'Transferencia bancaria',
        currency: 'USD'
      },
      {
        id: 3,
        type: 'TRANSF.BCO',
        date: new Date(2025, 8, 19),
        amount: -1000000.00,
        description: 'Transferencia bancaria',
        currency: 'USD'
      }
    ];
  }

  openTransferModal(type: 'own' | 'third' | 'service'): void {
    switch(type) {
      case 'own':
        const dialogRef = this.dialog.open(ModalOpComponent, {
          width: '500px',
          disableClose: true
        });

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
    this.typeFilter = '';
    this.dateFilter = '';
    this.refreshTransactions();
  }

  openFilterSettings(): void {
    // Implementar modal de configuración de filtros
  }

  // Agrupar transacciones por fecha
  get groupedTransactions(): { [key: string]: Transaction[] } {
    return this.transactions.reduce((groups, transaction) => {
      const dateStr = this.isToday(transaction.date) ? 
        'Hoy' : 
        `${this.getMonthName(transaction.date.getMonth())} ${transaction.date.getFullYear()}`;
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(transaction);
      return groups;
    }, {} as { [key: string]: Transaction[] });
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
}
