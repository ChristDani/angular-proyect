import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '../../../../core/services/account.service';
import { Account } from '../../../../models/interfaces/account.interface';
import { ModalBaseComponent } from '../modal-base/modal-base';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Service {
  id: string;
  name: string;
  code: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-modal-service-payment',
  imports: [ModalBaseComponent, CommonModule, FormsModule],
  templateUrl: './modal-service-payment.html',
  styleUrl: './modal-service-payment.css'
})
export class ModalServicePayment {
  constructor(private dialogRef: MatDialogRef<ModalServicePayment>) {}

  private accountService = inject(AccountService);
  accounts = signal<Account[]>([]);
  mainAccount = signal<Account | null>(null);
  selectedService = signal<Service | null>(null);
  services = signal<Service[]>([]);

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
  
  isFormInvalid(): boolean {
    return (
      this.mainAccount() === null || 
      this.selectedService() === null || 
      this.amount === null || 
      this.amount === undefined || 
      this.amount <= 0
    );
  }

  continuar(): void {
    if (this.validarPagoServicio()) {
      // Aquí iría la lógica para procesar el pago de servicio
      const resultado = {
        moneda: this.isDollar ? 'USD' : 'PEN',
        monto: this.amount,
        cuentaOrigen: this.mainAccount(),
        servicio: this.selectedService(),
      };

      console.log('Procesando pago de servicio:', resultado);
      this.modalBase.close();
      this.dialogRef.close(resultado);
    }
  }

  private validarPagoServicio(): boolean {
    if (!this.amount || this.amount <= 0) {
      alert('Por favor ingrese un monto válido');
      return false;
    }

    if (this.amount > this.mainAccount()?.balance!) {
      alert('Saldo insuficiente');
      return false;
    }

    if (!this.selectedService()) {
      alert('Por favor seleccione un servicio');
      return false;
    }

    return true;
  }
  onServiceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const serviceId = target.value;
    const service = this.services().find(s => s.id === serviceId);
    this.selectedService.set(service || null);
  }

  onNgInit(): void {
    this.getAccounts();
    this.loadServices();
  }

  private loadServices(): void {
    // Datos de ejemplo de servicios
    const mockServices: Service[] = [
      {
        id: '1',
        name: 'ENEL - Luz del Sur',
        code: '****2015',
        category: 'Electricidad',
        icon: '⚡'
      },
      {
        id: '2',
        name: 'SEDAPAL',
        code: '****3456',
        category: 'Agua',
        icon: '💧'
      },
      {
        id: '3',
        name: 'Movistar',
        code: '****7890',
        category: 'Telefonía',
        icon: '📱'
      },
      {
        id: '4',
        name: 'Netflix',
        code: '****1234',
        category: 'Entretenimiento',
        icon: '🎬'
      },
      {
        id: '5',
        name: 'Spotify',
        code: '****5678',
        category: 'Música',
        icon: '🎵'
      }
    ];
    this.services.set(mockServices);
  }

}
