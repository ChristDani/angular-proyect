import { Component, ViewChild, AfterViewInit, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalBaseComponent } from '../modal-base/modal-base';
import { AccountService } from '../../../../core/services/account.service';
import { Account } from '../../../../models/interfaces/account.interface';
import { AuthService } from '../../../../auth/auth.service';
import { TransactionService } from '../../../../core/services/transaction.service';
import { CurrencyService } from '../../../../core/services/currency.service';

interface Service {
  id: string;
  name: string;
  code: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-modal-service-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalBaseComponent],
  templateUrl: './modal-service-payment.html',
  styleUrls: ['./modal-service-payment.css']
})
export class ModalServicePayment implements AfterViewInit, OnInit {
  constructor(private dialogRef: MatDialogRef<ModalServicePayment>) {}

  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private currencyService = inject(CurrencyService);
  
  accounts = signal<Account[]>([]);
  mainAccount = signal<Account | null>(null);
  selectedService = signal<Service | null>(null);
  services = signal<Service[]>([]);
  loading = signal<boolean>(false);

  @ViewChild('modalBase') modalBase!: ModalBaseComponent;

  // Variables para el formulario
  isDollar: boolean = false;
  amount: number = 0;
  selectedFromId: string = '';

  ngOnInit(): void {
    this.loadAccounts();
    this.loadServices();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.modalBase) {
        this.modalBase.open();
      }
    });
  }

  async loadAccounts() {
    try {
      this.loading.set(true);
      const user = this.authService.getLoggedInUser();
      if (!user?.id) {
        console.error('No hay usuario logueado');
        return;
      }

      const accounts = await this.accountService.getAccountsByUserId(user.id).toPromise();
      const activeAccounts = accounts?.filter(acc => acc.status === 'activa') || [];
      this.accounts.set(activeAccounts);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
    } finally {
      this.loading.set(false);
    }
  }

  onFromAccountChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const accountId = target.value;
    const account = this.accounts().find(acc => acc.id === accountId);
    this.mainAccount.set(account || null);
    this.selectedFromId = accountId;
  }

  onServiceChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const serviceId = target.value;
    const service = this.services().find(s => s.id === serviceId);
    this.selectedService.set(service || null);
  }
  
  isFormInvalid(): boolean {
    return (
      this.mainAccount() === null || 
      this.selectedService() === null || 
      this.amount === null || 
      this.amount === undefined || 
      this.amount <= 0 ||
      this.isInsufficientBalance()
    );
  }

  private isInsufficientBalance(): boolean {
    if (!this.mainAccount() || this.amount <= 0) return false;
    
    const selectedCurrency = this.isDollar ? 'USD' : 'PEN';
    const requiredAmount = this.currencyService.convertToAccountCurrency(
      this.amount, 
      selectedCurrency, 
      this.mainAccount()!.currency
    );
    
    return this.mainAccount()!.balance < requiredAmount;
  }

  async continuar(): Promise<void> {
    if (this.isFormInvalid()) {
      return;
    }

    try {
      this.loading.set(true);
      const user = this.authService.getLoggedInUser();
      
      if (!user?.id) {
        console.error('Error: No hay usuario logueado');
        return;
      }

      // Realizar el pago de servicio usando el servicio
      const selectedCurrency = this.isDollar ? 'USD' : 'PEN';
      const result = await this.transactionService.payService(
        user.id,
        this.mainAccount()!.id,
        this.selectedService()!.id,
        this.selectedService()!.name,
        this.amount,
        selectedCurrency,
        `Pago de servicio ${this.selectedService()!.name}`
      ).toPromise();

      if (result?.ok) {
        const resultado = {
          moneda: this.isDollar ? 'USD' : 'PEN',
          monto: this.amount,
          cuentaOrigen: this.mainAccount(),
          servicio: this.selectedService(),
        };

        console.log('Pago de servicio exitoso:', resultado);
        this.modalBase.close();
        this.dialogRef.close(resultado);
      }
    } catch (error: any) {
      console.error('Error en pago de servicio:', error);
      alert(error?.message || 'Error al procesar el pago');
    } finally {
      this.loading.set(false);
    }
  }

  onClose(): void {
    this.modalBase.close();
    this.dialogRef.close();
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
