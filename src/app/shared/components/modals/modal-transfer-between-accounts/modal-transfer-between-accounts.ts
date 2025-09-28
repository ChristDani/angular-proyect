import { CommonModule } from '@angular/common';
import { Component, ViewChild, AfterViewInit, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ModalBaseComponent } from '../modal-base/modal-base';
import { AccountService } from '../../../../core/services/account.service';
import { Account } from '../../../../models/interfaces/account.interface';
import { AuthService } from '../../../../auth/auth.service';
import { TransactionService } from '../../../../core/services/transaction.service';

@Component({
  selector: 'app-modal-op',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalBaseComponent],
  templateUrl: './modal-transfer-between-accounts.html',
  styleUrls: ['./modal-transfer-between-accounts.css'],
})
export class ModalTransferBetweenAccounts implements AfterViewInit, OnInit {
  constructor(private dialogRef: MatDialogRef<ModalTransferBetweenAccounts>) {}

  private accountService = inject(AccountService);
  private authService = inject(AuthService);
  private transactionService = inject(TransactionService);
  
  accounts = signal<Account[]>([]);
  mainAccount = signal<Account | null>(null);
  secondaryAccount = signal<Account | null>(null);
  loading = signal<boolean>(false);

  @ViewChild('modalBase') modalBase!: ModalBaseComponent;

  // Variables para el formulario
  isDollar: boolean = false;
  amount: number = 0;
  selectedFromId: string = '';
  selectedToId: string = '';

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

  onToAccountChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const accountId = target.value;
    const account = this.accounts().find(acc => acc.id === accountId);
    this.secondaryAccount.set(account || null);
    this.selectedToId = accountId;
  }

  isFormInvalid(): boolean {
    return (
      this.mainAccount()?.id === null ||
      this.secondaryAccount()?.id === null ||
      this.amount === null ||
      this.amount === undefined ||
      this.amount <= 0 ||
      this.mainAccount()?.id === this.secondaryAccount()?.id
    );
  }

  async continuar(): Promise<void> {
    if (this.isFormInvalid()) {
      return;
    }

    try {
      this.loading.set(true);
      const user = this.authService.getLoggedInUser();
      
      if (!user?.id) {
        alert('Error: No hay usuario logueado');
        return;
      }

      // Realizar la transferencia usando el servicio
      const result = await this.transactionService.transferBetweenAccounts(
        user.id,
        this.mainAccount()!.id,
        this.secondaryAccount()!.id,
        this.amount
      ).toPromise();

      if (result?.ok) {
        const resultado = {
          moneda: this.isDollar ? 'USD' : 'PEN',
          monto: this.amount,
          cuentaOrigen: this.mainAccount(),
          cuentaDestino: this.secondaryAccount(),
        };

        console.log('Transferencia exitosa:', resultado);
        this.modalBase.close();
        this.dialogRef.close(resultado);
      }
    } catch (error: any) {
      console.error('Error en transferencia:', error);
      alert(error?.message || 'Error al procesar la transferencia');
    } finally {
      this.loading.set(false);
    }
  }

  onClose(): void {
    this.modalBase.close();
    this.dialogRef.close();
  }
}
