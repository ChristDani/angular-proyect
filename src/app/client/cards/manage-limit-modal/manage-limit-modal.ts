import { Component, Inject } from '@angular/core';
import { MATERIAL_IMPORTS } from '../../../shared/components/material.imports';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Card } from '../../../models/interfaces/card.interface';
import { ToastService } from '../../../shared/services/toast.service';
import { CardService } from '../../../core/services/card.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-limit-modal',
  imports: [...MATERIAL_IMPORTS, ReactiveFormsModule, CommonModule],
  templateUrl: './manage-limit-modal.html',
})
export class ManageLimitModal {
  cardForm!: FormGroup;
  private destroy$ = new Subject<void>();
  currentCard!: Card;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ManageLimitModal, Card | null>,
    private cardService: CardService,
    private toastService: ToastService,
    @Inject(MAT_DIALOG_DATA) data: { card: Card }
  ) {
    if (data) {
      this.currentCard = data.card;
    }
  }

  ngOnInit(): void {
    this.cardForm = this.fb.group({
      limit: ['', Validators.required],
    });
  }
  submitAccount(): void {
    this.cardForm.markAllAsTouched();
    if (this.cardForm.invalid) {
      return;
    }
    const card: Card = {
      id: this.currentCard.id,
      accountId: this.currentCard.accountId,
      limit: this.cardForm.get('limit')!.value,
      type: this.currentCard.type,
      status: this.currentCard.status,
    };
    this.cardService
      .updateCard(card)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.toastService.show(
            `Se actualizo el límite de la tarjeta ${card.id} exitosamente`,
            'success'
          );
          this.dialogRef.close(updated);
        },
        error: (err) => {
          this.toastService.show(
            `No se pudo actualizar el límite de la tarjeta ${card.id}`,
            'error'
          );
          this.cancel();
        },
      });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
