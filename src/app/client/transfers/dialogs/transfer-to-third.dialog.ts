// src/app/transfers/transfer-to-third.dialog.ts
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, of, catchError, map, first } from 'rxjs';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators, AsyncValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
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

@Component({
  selector: 'app-transfer-to-third-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule, MatSelectModule, MatInputModule,
    MatButtonModule, MatIconModule, CurrencyPipe, DecimalPipe
  ],
  templateUrl: './transfer-to-third.dialog.html',
  styleUrls: ['./transfer-to-third.dialog.css']
})
export class TransferToThirdDialog {
  private ref = inject(MatDialogRef<TransferToThirdDialog>);
  private fb = inject(FormBuilder);
  private accountsSvc = inject(AccountService);
  private txSvc = inject(TransactionService);
  private auth = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly accounts = signal<Account[]>([]);
  readonly submitting = signal(false);

  // validador async: verifica que exista la cuenta destino
  private accountExistsValidator: AsyncValidatorFn = (control: AbstractControl) => {
    const id = (control.value as string || '').trim();
    if (!id) return of(null);
    return this.accountsSvc.getAccountById(id).pipe(
      map(acc => acc ? null : { accountNotFound: true }),
      catchError(() => of({ accountNotFound: true })),
      first()
    );
  };

  form = this.fb.nonNullable.group({
    fromId: ['', Validators.required],
    toAccountId: ['', {
      validators: [Validators.required],
      asyncValidators: [this.accountExistsValidator],
      updateOn: 'blur'
    }],
    description: [''],
    amount: [0, [Validators.required, Validators.min(0.01)]],
  });

  private fv = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), { initialValue: this.form.getRawValue() });
  private statusSig = toSignal(this.form.statusChanges.pipe(startWith(this.form.status)), { initialValue: this.form.status });

  readonly from = computed(() => this.accounts().find(a => a.id === this.fv().fromId) ?? null);
  readonly sameAccount = computed(() => {
    const v = this.fv();
    return !!v.fromId && v.fromId === v.toAccountId;
  });
  readonly insufficient = computed(() => {
    const v = this.fv();
    const f = this.from();
    const amt = Number(v.amount) || 0;
    return !!f && amt > 0 && f.balance < amt;
  });
  readonly canSubmit = computed(() =>
    this.statusSig() === 'VALID' && !this.sameAccount() && !this.insufficient() && !this.submitting()
  );

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

        // autoseleccionar primera cuenta para no dejar todo en blanco
        if (actives[0] && !this.fv().fromId) {
          this.form.patchValue({ fromId: actives[0].id });
        }
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
    const userId = this.auth.getLoggedInUser()?.id ?? '';
    const { fromId, toAccountId, amount, description } = this.fv();
    this.submitting.set(true);

    this.txSvc.transferToThirdParty(userId, fromId!, toAccountId!, Number(amount), 'PEN', description)
      .subscribe({
        next: () => { this.submitting.set(false); this.ref.close({ ok: true }); },
        error: e => { this.submitting.set(false); this.error.set(e?.message || 'No se pudo completar la transferencia.'); }
      });
  }
}
