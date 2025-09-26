import { CurrencyPipe } from "@angular/common";
import { Component, computed } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
    selector: 'app-loan-simulator-dialog',
    templateUrl: './loan-simulator.dialog.html',
    styleUrls: ['./loan-simulator.dialog.css'],
    imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, CurrencyPipe],
})
export class LoanSimDialog {
    private fb = new FormBuilder();
    form = this.fb.group({
        amount: [10000, [Validators.required, Validators.min(100)]],
        rate: [20, [Validators.required, Validators.min(0)]],
        n: [12, [Validators.required, Validators.min(1), Validators.max(120)]],
    });

    cuota = computed(() => {
        if (this.form.invalid) return 0;
        const { amount, rate, n } = this.form.getRawValue();
        const i = (rate ?? 0) / 12 / 100;
        const m = n ?? 1;
        if (i === 0) return (amount ?? 0) / m;
        return (amount ?? 0) * (i * Math.pow(1 + i, m)) / (Math.pow(1 + i, m) - 1);
    });
}