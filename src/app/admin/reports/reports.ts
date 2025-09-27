import { Component } from '@angular/core';
import { Transaction } from '../../models/interfaces/transaction.interface';
import { TransactionService } from '../../core/services/transaction.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-reports',
  imports: [ReactiveFormsModule, MATERIAL_IMPORTS, FormsModule, CommonModule, MatTableModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  private originalTransactions: Transaction[] = [];
  private destroy$ = new Subject<void>();
  transactions: Transaction[] = [];
  types: string[] = [];
  form!: FormGroup;

  constructor(private transactionService: TransactionService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.getTransactions();
    this.form = this.fb.group({
      type: [''],
      date: [''],
      description: [''],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private getTransactions(): void {
    this.transactionService
      .getTransactions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.originalTransactions = Array.isArray(data) ? data : [];
          this.transactions = [...this.originalTransactions];

          this.types = Array.from(new Set(this.originalTransactions.map((t) => t.type))).filter(
            Boolean
          );
        },
        error: (err) => {
          console.error('Error al obtener transacciones', err);
        },
      });
  }

  clearFilters(): void {
    this.form.reset({ type: '', date: '', description: '' });
    this.transactions = [...this.originalTransactions];
  }

  trackByTransaction(_: number, item: Transaction): number {
    return Number(item.id);
  }

  trackByType(_: number, item: string): string {
    return item;
  }

  filterBy(filter: 'type' | 'date' | 'description'): void {
    if (filter !== 'type') this.form.get('type')!.setValue('');
    if (filter !== 'date') this.form.get('date')!.setValue('');
    if (filter !== 'description') this.form.get('description')!.setValue('');

    this.transactions = [...this.originalTransactions];

    if (filter === 'type') {
      const v = (this.form.get('type')!.value || '').toString();
      if (v) this.transactions = this.transactions.filter((t) => t.type === v);
    } else if (filter === 'date') {
      const v = this.form.get('date')!.value;
      if (v)
        this.transactions = this.transactions.filter((t) => {
          const d = new Date(t.date);
          return !isNaN(d.getTime())
            ? d.toISOString().slice(0, 10) === v
            : (t.date || '').toString().slice(0, 10) === v;
        });
    } else {
      const v = (this.form.get('description')!.value || '').toString().trim().toLowerCase();
      if (v)
        this.transactions = this.transactions.filter((t) =>
          (t.description || '').toLowerCase().includes(v)
        );
    }
  }
}
