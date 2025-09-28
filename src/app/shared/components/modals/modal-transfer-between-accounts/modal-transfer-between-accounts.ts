import { Component, ViewChild, AfterViewInit, inject, signal, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalBaseComponent } from '../modal-base/modal-base';
import { AccountService } from '../../../../core/services/account.service';
import { Account } from '../../../../models/interfaces/account.interface';
import { AuthService } from '../../../../auth/auth.service';
import { User } from '../../../../models/interfaces/user.interface';

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
  private authService = inject(AuthService);
  accounts = signal<Account[]>([]);
  mainAccount = signal<Account | null>(null);
  secondaryAccount = signal<Account | null>(null);
  user = signal<User | null>(null);

  @Output() reloadAccounts = new EventEmitter<void>();

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
      const accounts = await this.accountService.getAccounts().toPromise();
      this.accounts.set(accounts || []);
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
    }
    console.log(this.accounts());
    
  }

  isFormInvalid(): boolean {
    return (
      this.mainAccount() === null || 
      this.secondaryAccount() === null || 
      this.amount === null || 
      this.amount === undefined || 
      this.amount <= 0 ||
      this.mainAccount() !== this.secondaryAccount()
    );
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
