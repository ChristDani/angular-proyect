import { CurrencyPipe, DecimalPipe } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { startWith } from "rxjs";

@Component({
  selector: "app-loan-simulator-dialog",
  standalone: true,
  templateUrl: "./loan-simulator.dialog.html",
  styleUrls: ["./loan-simulator.dialog.css"],
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CurrencyPipe
  ],
})
export class LoanSimDialog {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    amount: [10000, [Validators.required, Validators.min(100)]],
    rate: [20, [Validators.required, Validators.min(0)]],                 // % anual nominal
    n: [12, [Validators.required, Validators.min(1), Validators.max(360)]], // meses
  });

  formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    { initialValue: this.form.getRawValue() }
  );

  cuota = computed(() => {
    if (this.form.invalid) return 0;

    const { amount, rate, n } = this.formValue();
    const principal = Number(amount ?? 0);
    const months = Number(n ?? 0);
    const monthlyRate = Number(rate ?? 0) / 12 / 100;

    if (!isFinite(principal) || !isFinite(months) || months <= 0) return 0;
    if (monthlyRate === 0) return principal / months;

    const pow = Math.pow(1 + monthlyRate, months);
    return principal * (monthlyRate * pow) / (pow - 1);
  });

  totalPagado = computed(() => this.cuota() * Number(this.formValue().n ?? 0));
  costoFinanciamiento = computed(() => this.totalPagado() - Number(this.formValue().amount ?? 0));
}
