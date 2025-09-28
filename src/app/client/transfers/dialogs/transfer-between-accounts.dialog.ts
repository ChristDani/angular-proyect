// src/app/transfers/transfer-between-accounts.dialog.ts
import { Component, computed, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { AccountService } from '../../../core/services/account.service';
import { AuthService } from '../../../auth/auth.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { Account } from '../../../models/interfaces/account.interface';
import { startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-transfer-between-accounts-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatButtonModule, MatIconModule,
    CurrencyPipe, DecimalPipe
  ],
  templateUrl: './transfer-between-accounts.dialog.html',
  styleUrls: ['./transfer-between-accounts.dialog.css']
})
export class TransferBetweenAccountsDialog {
    private ref = inject(MatDialogRef<TransferBetweenAccountsDialog>);
    private fb = inject(FormBuilder);
    private accountsSvc = inject(AccountService);
    private auth = inject(AuthService);
    private txSvc = inject(TransactionService);
  
    readonly loading = signal(true);
    readonly error = signal<string | null>(null);
    readonly accounts = signal<Account[]>([]);
    readonly submitting = signal(false);
  
    // Non-nullable para evitar null-circus
    form = this.fb.nonNullable.group({
      fromId: ['', Validators.required],
      toId:   ['', Validators.required],
      amount: [0,  [Validators.required, Validators.min(0.01)]],
    });
  
    // CONVERTIMOS EL FORM EN SIGNAL
    private fv = toSignal(this.form.valueChanges.pipe(
      startWith(this.form.getRawValue())
    ), { initialValue: this.form.getRawValue() });
  
    // Derivados 100% reactivos
    readonly from = computed(() => this.accounts().find(a => a.id === this.fv().fromId) ?? null);
    readonly to   = computed(() => this.accounts().find(a => a.id === this.fv().toId)   ?? null);
  
    readonly sameAccount = computed(() => {
      const v = this.fv();
      return !!v.fromId && v.fromId === v.toId;
    });
  
    readonly insufficient = computed(() => {
      const v = this.fv();
      const f = this.from();
      const amt = Number(v.amount) || 0;
      return !!f && amt > 0 && f.balance < amt;
    });
  
    readonly canSubmit = computed(() => {
      const v = this.fv();
      const amt = Number(v.amount) || 0;
      return !!v.fromId && !!v.toId && amt >= 0.01 && !this.sameAccount() && !this.insufficient() && !this.submitting();
    });
  
    constructor() {
      const user = this.auth.getLoggedInUser();
      if (!user?.id) {
        this.error.set('No se detectó usuario en sesión.');
        this.loading.set(false);
        return;
      }
  
      this.accountsSvc.getAccountsByUserId(user.id).subscribe({
        next: list => {
          const actives = list.filter(a => a.status !== 'inactiva');
          this.accounts.set(actives);
  
          // PRESELECCIÓN: dos cuentas distintas si existen
          const a = actives[0], b = actives.find(x => x.id !== a?.id);
          const patch: any = {};
          if (a && !this.fv().fromId) patch.fromId = a.id;
          if (b && !this.fv().toId)   patch.toId   = b.id;
          if (Object.keys(patch).length) this.form.patchValue(patch);
  
          this.loading.set(false);
        },
        error: err => {
          console.error(err);
          this.error.set('No se pudieron cargar tus cuentas.');
          this.loading.set(false);
        }
      });
    }
  
    close() { this.ref.close(null); }
  
    submit() {
      if (!this.canSubmit()) return;
      const user = this.auth.getLoggedInUser() ?? null;
      const userId = user != null ? user.id : null;
      const { fromId, toId, amount } = this.fv();
      this.submitting.set(true);
  
      this.txSvc.transferBetweenAccounts(userId, fromId!, toId!, Number(amount), 'PEN')
        .subscribe({
          next: () => { this.submitting.set(false); this.ref.close({ ok: true }); },
          error: e => { this.submitting.set(false); this.error.set(e?.message || 'No se pudo completar la transferencia.'); }
        });
    }
}