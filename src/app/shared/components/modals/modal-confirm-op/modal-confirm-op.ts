import { Component, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ModalBaseComponent } from '../modal-base/modal-base';
import { OperationConfirmData } from '../../../interfaces/operation-confirm.interface';
import { CurrencyService } from '../../../../core/services/currency.service';

@Component({
  selector: 'app-modal-confirm-op',
  standalone: true,
  imports: [CommonModule, ModalBaseComponent],
  templateUrl: './modal-confirm-op.html',
  styleUrls: ['./modal-confirm-op.css']
})
export class ModalConfirmOp implements AfterViewInit {
  constructor(
    private dialogRef: MatDialogRef<ModalConfirmOp>,
    @Inject(MAT_DIALOG_DATA) public data: OperationConfirmData,
    private currencyService: CurrencyService
  ) {}

  @ViewChild('modalBase') modalBase!: ModalBaseComponent;

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.modalBase) {
        this.modalBase.open();
      }
    });
  }

  onClose(): void {
    this.modalBase.close();
    this.dialogRef.close();
  }

  getOperationTitle(): string {
    switch (this.data.type) {
      case 'transfer-between-accounts':
        return 'Transferencia Entre Cuentas';
      case 'transfer-to-third':
        return 'Transferencia a Terceros';
      case 'service-payment':
        return 'Pago de Servicio';
      default:
        return 'Operación Completada';
    }
  }

  getOperationIcon(): string {
    switch (this.data.type) {
      case 'transfer-between-accounts':
        return 'bi-arrow-left-right';
      case 'transfer-to-third':
        return 'bi-person-add';
      case 'service-payment':
        return 'bi-receipt';
      default:
        return 'bi-check-circle';
    }
  }

  formatCurrency(amount: number, currency: 'USD' | 'PEN'): string {
    return this.currencyService.formatCurrency(amount, currency);
  }

  formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  hasConversion(): boolean {
    return !!(this.data.convertedAmount && this.data.convertedCurrency && this.data.exchangeRate);
  }
}
