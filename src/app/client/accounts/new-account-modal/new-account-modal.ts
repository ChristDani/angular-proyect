import { Component, Inject } from '@angular/core';
import { MATERIAL_IMPORTS } from '../../../shared/components/material.imports';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NewAccountData, SubType } from '../../../models/interfaces/products-user.interface';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccountService } from '../../../core/services/account.service';
import { Subject, takeUntil } from 'rxjs';
import { UGenerator } from '../../../shared/components/utils/generator.util';
import { Account } from '../../../models/interfaces/account.interface';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-new-account-modal',
  imports: [MATERIAL_IMPORTS, ReactiveFormsModule],
  templateUrl: './new-account-modal.html',
  styleUrl: './new-account-modal.css',
})
export class NewAccountModal {
  accountForm!: FormGroup;
  private destroy$ = new Subject<void>();
  subTypesCuenta: SubType[] = [
    { value: 'corriente', label: 'Corriente' },
    { value: 'ahorro', label: 'Ahorro' },
  ];

  userId!: string;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<NewAccountModal, Account | null>,
    private accountService: AccountService,
    private toastService: ToastService,
    @Inject(MAT_DIALOG_DATA) private data: NewAccountData
  ) {
    if (data) {
      this.userId = data.userId ?? '';
    }
  }

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      type: ['', Validators.required],
      balance: ['', [Validators.required, Validators.min(0)]],
    });
  }

  submitAccount(): void {
    this.accountForm.markAllAsTouched();
    if (this.accountForm.invalid) {
      return;
    }
    const account: Account = {
      id: UGenerator.generateId(),
      userId: this.userId,
      type: this.accountForm.get('type')!.value,
      balance: Number(this.accountForm.get('balance')!.value),
      status: 'activa',
      currency: 'PEN'
    };
    this.accountService
      .createAccount(account)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.toastService.show(`Cuenta creada exitosamente`, 'success');
          this.dialogRef.close(created);
        },
        error: (err) => {
          this.toastService.show(`No se pudo crear la cuenta, inténtalo de nuevo.`, 'error');
          this.dialogRef.close();
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
