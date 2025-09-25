import { Component, Inject } from '@angular/core';
import {
  Client,
  DialogData,
  Product,
  ProductType,
  SubType,
} from '../../../models/interfaces/products-user.interface';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardService } from '../../../core/services/card.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../models/interfaces/account.interface';
import { MATERIAL_IMPORTS } from '../../../shared/components/material.imports';
import { combineLatest, startWith, Subject, takeUntil } from 'rxjs';
import { Card } from '../../../models/interfaces/card.interface';
import { Loan } from '../../../models/interfaces/loan.interface';
import { LoanService } from '../../../core/services/loan.service';

@Component({
  selector: 'app-product-creation-modal',
  imports: [MATERIAL_IMPORTS, ReactiveFormsModule],
  templateUrl: './product-creation-modal.html',
  styleUrl: './product-creation-modal.css',
})
export class ProductCreationModal {
  private destroy$ = new Subject<void>();
  client!: Client;
  type!: string;
  userAccount: Account[] = [];

  productForm!: FormGroup;
  isSubmitting = false;

  // Opciones para selects (se pueden externalizar)
  productTypes: { value: ProductType; label: string }[] = [
    { value: 'tarjeta', label: 'Tarjeta' },
    { value: 'prestamo', label: 'Préstamo' },
  ];

  subTypesCuenta: SubType[] = [
    { value: 'debito', label: 'Débito' },
    { value: 'ahorro', label: 'Ahorro' },
  ];
  subTypesTarjeta: SubType[] = [
    { value: 'debito', label: 'Débito' },
    { value: 'crédito', label: 'Crédito' },
  ];
  installments = [3, 6, 9, 12, 18, 24];

  constructor(
    private fb: FormBuilder,
    private cardService: CardService,
    private accountService: AccountService,
    private loanService: LoanService,
    private dialogRef: MatDialogRef<ProductCreationModal, Product | null>,
    @Inject(MAT_DIALOG_DATA) private data: DialogData
  ) {
    if (data) {
      this.client = data.client;
      this.type = data.type ?? '';
    }
  }

  ngOnInit(): void {
    this.getAccounts();
    this.productForm = this.fb.group({
      selectedAccount: ['', Validators.required],
      productType: ['', Validators.required],
      subProductType: ['', Validators.required],
    });
    this.watchProductAndSubProduct();
  }

  getAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        const userAccount = data.filter((account) => account.userId === Number(this.client.id));
        this.userAccount = userAccount;
      },
      error: (error) => {
        console.error('Error en obtener cards ', error);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    this.productForm.markAllAsTouched();
    const productType = this.productForm.get('productType')!.value;
    if (productType === 'prestamo') {
      this.createLoan();
    } else {
      this.createCard();
    }
  }

  createCard(): void {
    if (this.productForm.invalid) {
      return;
    }

    const productType = this.productForm.get('productType')!.value;
    const subProductType = this.productForm.get('subProductType')!.value;

    // Solo creamos tarjeta cuando productType es 'tarjeta'
    if (productType !== 'tarjeta') {
      return;
    }

    const card: Card = {
      id: this.generateId(),
      accountId: Number(this.productForm.get('selectedAccount')!.value),
      type: subProductType,
      limit: this.productForm.get('limitCreditCard')
        ? Number(this.productForm.get('limitCreditCard')!.value || 0)
        : 0,
      status: 'activa',
    };

    this.cardService
      .createCard(card)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.productForm.reset();
          this.cancel();
        },
        error: (err) => {
          console.error('Error creando tarjeta', err);
        },
      });
  }

  createLoan(): void {
    const loan: Loan = {
      id: this.generateId(),
      accountId: Number(this.productForm.get('selectedAccount')!.value),
      amount: Number(this.productForm.get('loanAmount')!.value),
      installments: Number(this.productForm.get('installmentsQuotas')!.value),
      status: '',
    };

    this.loanService
      .createLoan(loan)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.productForm.reset();
          this.cancel();
        },
        error: (err) => {
          console.error('Error creando préstamo', err);
        },
      });

    return;
  }

  // Generador simple de id numérico (timestamp + aleatorio pequeño)
  private generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }

  /**
   * Condicionalmente asigna validadores a ciertos campos del formulario
   * basado en las selecciones actuales de productType (tarjeta, prestamo) y subProductType(debito, credito).
   * - Si productType es 'tarjeta' y subProductType es 'credito', entonces
   *   'limitCreditCard' es requerido y debe ser >= 0.
   * - Si productType es 'prestamo', entonces 'loanAmount' y 'installmentsQuotas' son requeridos.
   * - Si productType es 'tarjeta' y subProductType es 'debito', entonces no hay validadores adicionales.
   * - Si las condiciones cambian y ciertos campos ya no son necesarios, se eliminan del formulario.
   * Utiliza combineLatest para observar cambios en ambos campos y ajustar los validadores en consecuencia.
   * El método se asegura de que los validadores se actualicen sin emitir eventos innecesarios.
   */
  private watchProductAndSubProduct(): void {
    const product$ = this.productForm
      .get('productType')!
      .valueChanges.pipe(startWith(this.productForm.get('productType')!.value));
    const subProduct$ = this.productForm
      .get('subProductType')!
      .valueChanges.pipe(startWith(this.productForm.get('subProductType')!.value));

    combineLatest([product$, subProduct$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([productType, subProductType]) => {
        // Lógica para añadir/remover controles según la condición
        // tarjeta + credito -> agregar limitCreditCard (required + min)
        if (productType === 'tarjeta' && subProductType === 'crédito') {
          if (!this.productForm.contains('limitCreditCard')) {
            this.productForm.addControl(
              'limitCreditCard',
              new FormControl('', [Validators.required, Validators.min(0)])
            );
          } else {
            // en caso de que exista, asegurar validadores correctos
            const c = this.productForm.get('limitCreditCard')!;
            c.setValidators([Validators.required, Validators.min(0)]);
            c.updateValueAndValidity({ emitEvent: false });
          }

          // asegurar que no existan controles de préstamo
          if (this.productForm.contains('loanAmount')) {
            this.productForm.removeControl('loanAmount');
          }
          if (this.productForm.contains('installmentsQuotas')) {
            this.productForm.removeControl('installmentsQuotas');
          }
        }
        // tarjeta + debito -> solo subProductType (los condicionales se remueven)
        else if (productType === 'tarjeta' && subProductType === 'debito') {
          if (this.productForm.contains('limitCreditCard')) {
            this.productForm.removeControl('limitCreditCard');
          }
          if (this.productForm.contains('loanAmount')) {
            this.productForm.removeControl('loanAmount');
          }
          if (this.productForm.contains('installmentsQuotas')) {
            this.productForm.removeControl('installmentsQuotas');
          }
        }
        // prestamo -> añadir loanAmount y installmentsQuotas (required)
        else if (productType === 'prestamo') {
          if (!this.productForm.contains('loanAmount')) {
            this.productForm.addControl('loanAmount', new FormControl('', [Validators.required]));
          } else {
            const loan = this.productForm.get('loanAmount')!;
            loan.setValidators([Validators.required]);
            loan.updateValueAndValidity({ emitEvent: false });
          }

          if (!this.productForm.contains('installmentsQuotas')) {
            this.productForm.addControl(
              'installmentsQuotas',
              new FormControl('', [Validators.required])
            );
          } else {
            const inst = this.productForm.get('installmentsQuotas')!;
            inst.setValidators([Validators.required]);
            inst.updateValueAndValidity({ emitEvent: false });
          }

          // remover control de tarjeta si existiera
          if (this.productForm.contains('limitCreditCard')) {
            this.productForm.removeControl('limitCreditCard');
          }
        } else {
          if (this.productForm.contains('limitCreditCard')) {
            this.productForm.removeControl('limitCreditCard');
          }
          if (this.productForm.contains('loanAmount')) {
            this.productForm.removeControl('loanAmount');
          }
          if (this.productForm.contains('installmentsQuotas')) {
            this.productForm.removeControl('installmentsQuotas');
          }
        }
      });
  }
}
