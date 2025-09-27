import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalBaseComponent } from '../modal-base/modal-base';

@Component({
  selector: 'app-modal-op',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalBaseComponent],
  templateUrl: './modal-transfer-between-accounts.html',
  styleUrls: ['./modal-transfer-between-accounts.css']
})
export class ModalTransferBetweenAccounts implements AfterViewInit {
  constructor(
    private dialogRef: MatDialogRef<ModalTransferBetweenAccounts>
  ) {}

  @ViewChild('modalBase') modalBase!: ModalBaseComponent;

  // Variables para el manejo de moneda y monto
  isDollar: boolean = false;
  amount: number = 500000.00;

  ngAfterViewInit() {
    // Abrimos el modal después de que la vista se ha inicializado
    setTimeout(() => {
      if (this.modalBase) {
        this.modalBase.open();
      }
    });
  }

  // Variables para las cuentas (esto debería venir de un servicio)
  cuentaRetiro = {
    nombre: 'CUENTA RETIRO',
    numero: '****2015',
    monto: 1000000.00
  };

  cuentaDeposito = {
    nombre: 'CUENTA DEPOSITO',
    numero: '****2015',
    monto: 1000000.00
  };

  onClose(): void {
    this.modalBase.close();
    this.dialogRef.close();
  }

  continuar(): void {
    if (this.validarTransferencia()) {
      // Aquí iría la lógica para procesar la transferencia
      const resultado = {
        moneda: this.isDollar ? 'USD' : 'PEN',
        monto: this.amount,
        cuentaOrigen: this.cuentaRetiro,
        cuentaDestino: this.cuentaDeposito
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
    
    if (this.amount > this.cuentaRetiro.monto) {
      alert('Saldo insuficiente');
      return false;
    }

    return true;
  }
}
