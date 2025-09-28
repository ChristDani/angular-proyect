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

@Component({
  selector: 'app-modal-third-transfer',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalBaseComponent],
  templateUrl: './modal-third-transfer.html',
  styleUrls: ['./modal-third-transfer.css'],
})
export class ModalThirdTransfer implements AfterViewInit, OnInit {
  constructor(private dialogRef: MatDialogRef<ModalThirdTransfer>) {}

  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  private currencyService = inject(CurrencyService);
  
  accounts = signal<Account[]>([]);
  mainAccount = signal<Account | null>(null);
  loading = signal<boolean>(false);

  @ViewChild('modalBase') modalBase!: ModalBaseComponent;

  // Variables para el formulario
  isDollar: boolean = false;
  amount: number = 0;
  selectedFromId: string = '';
  destinationAccount: string = '';

  ngOnInit(): void {
    this.loadAccounts();
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

  isFormInvalid(): boolean {
    return (
      this.mainAccount() === null ||
      !this.destinationAccount.trim() ||
      this.amount === null ||
      this.amount === undefined ||
      this.amount <= 0 ||
      this.destinationAccount.length !== 20 ||
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

      // Realizar la transferencia usando el servicio
      const selectedCurrency = this.isDollar ? 'USD' : 'PEN';
      const result = await this.transactionService.transferToThirdParty(
        user.id,
        this.mainAccount()!.id,
        this.destinationAccount,
        this.amount,
        selectedCurrency,
        `Transferencia a cuenta ${this.destinationAccount}`
      ).toPromise();

      if (result?.ok) {
        const resultado = {
          moneda: this.isDollar ? 'USD' : 'PEN',
          monto: this.amount,
          cuentaOrigen: this.mainAccount(),
          cuentaDestino: this.destinationAccount,
        };

        console.log('Transferencia a terceros exitosa:', resultado);
        this.modalBase.close();
        this.dialogRef.close(resultado);
      }
    } catch (error: any) {
      console.error('Error en transferencia a terceros:', error);
      alert(error?.message || 'Error al procesar la transferencia');
    } finally {
      this.loading.set(false);
    }
  }

  onClose(): void {
    this.modalBase.close();
    this.dialogRef.close();
  }}
