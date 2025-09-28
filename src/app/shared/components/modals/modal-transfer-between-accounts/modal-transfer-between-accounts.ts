import { Component, ViewChild, AfterViewInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalBaseComponent } from '../modal-base/modal-base';
import { AccountService } from '../../../../core/services/account.service';
import { Account } from '../../../../models/interfaces/account.interface';

@Component({
  selector: 'app-modal-op',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalBaseComponent],
  templateUrl: './modal-transfer-between-accounts.html',
  styleUrls: ['./modal-transfer-between-accounts.css'],
})
export class ModalTransferBetweenAccounts implements AfterViewInit {
  constructor(private dialogRef: MatDialogRef<ModalTransferBetweenAccounts>) {}

  private accountService = inject(AccountService);
  accounts = signal<Account[]>([]);
  mainAccount = signal<Account | null>(null);
  secondaryAccount = signal<Account | null>(null);

  // Referencia al componente base del modal

  @ViewChild('modalBase') modalBase!: ModalBaseComponent;

  // Variables para el manejo de moneda y monto
  isDollar: boolean = false;
  amount: number = 0.0;

  ngAfterViewInit() {
    // Abrimos el modal después de que la vista se ha inicializado
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

  async getAccounts() {
    try {
      const accounts = await this.accountService.getAccountsByUserId('1').toPromise();
      this.accounts.set(accounts || []);
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
    }
  }

  continuar(): void {
    if (this.validarTransferencia()) {
      // Aquí iría la lógica para procesar la transferencia
      const resultado = {
        moneda: this.isDollar ? 'USD' : 'PEN',
        monto: this.amount,
        cuentaOrigen: this.mainAccount(),
        cuentaDestino: this.secondaryAccount(),
      };

      console.log('Procesando transferencia:', resultado);
      this.modalBase.close();
      this.dialogRef.close(resultado);
    }
  }

  private validarTransferencia(): boolean {
    if (!this.amount || this.amount <= 0) {
      alert('Por favor ingrese un monto válido');
      return false;
    }

    if (this.amount > this.mainAccount()?.balance!) {
      alert('Saldo insuficiente');
      return false;
    }

    return true;
  }
  onNgInit(): void {
    this.getAccounts();
  }
}
