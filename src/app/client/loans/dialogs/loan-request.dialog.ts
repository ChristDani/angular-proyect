import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { Loan } from "../../../models/interfaces/loan.interface";
import { ReactiveFormsModule, Validators } from "@angular/forms";
import { Component, computed, inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { AccountService } from "../../../core/services/account.service";
import { AuthService } from "../../../auth/auth.service";
import { of, startWith } from "rxjs";
import { Account } from "../../../models/interfaces/account.interface";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-loan-request-dialog',
    templateUrl: './loan-request.dialog.html',
    styleUrls: ['./loan-request.dialog.css'],
    imports: [MatDialogModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule],
})
export class LoanRequestDialog {
    data = inject<Loan | null>(MAT_DIALOG_DATA, { optional: true }) ?? null;
    ref = inject(MatDialogRef<LoanRequestDialog>);
    fb = new FormBuilder();
    private accountsSvc = inject(AccountService);
    private authSvc = inject(AuthService)
    private currentUser = this.authSvc.getLoggedInUser();

    private accounts$ = this.currentUser ? this.accountsSvc.getAccountsByUserId(this.currentUser.id).pipe(startWith([] as Account[])) : of([] as Account[]);
    accounts = toSignal(this.accounts$, { initialValue: [] as Account[] });
    loading = computed(() => this.accounts() === null)

    form = this.fb.group({
        accountId: [this.data?.accountId ?? null, [Validators.required, Validators.min(1)]],
        amount: [this.data?.amount ?? null, [Validators.required, Validators.min(100)]],
        installments: [this.data?.installments ?? 12, [Validators.required, Validators.min(1), Validators.max(120)]],
    });

    close() { this.ref.close(); }
    submit() { if (this.form.valid) this.ref.close(this.form.value); }
}