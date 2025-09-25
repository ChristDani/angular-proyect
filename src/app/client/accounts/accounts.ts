import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Button } from '../../shared/components/button/button';
import { Account } from '../../models/interfaces/account.interface';
import { MATERIAL_IMPORTS } from '../../shared/components/material.imports';
import { Transaction } from '../../models/interfaces/transaction.interface';

@Component({
  selector: 'app-accounts',
  imports: [CommonModule, ...MATERIAL_IMPORTS, Button],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts {
  displayedColumns: string[] = ['fecha', 'operacion', 'descripcion', 'importe'];

  movimientos: Transaction[] = [
    {
      id: 1,
      accountId: 2,
      date: '2025-09-01',
      type: 'depósito',
      amount: 1000,
      description: 'Depósito de apertura',
    },
    {
      id: 2,
      accountId: 2,
      date: '2025-09-03',
      type: 'retiro',
      amount: 300,
      description: 'Pago de servicios',
    },
    {
      id: 3,
      accountId: 2,
      date: '2025-09-03',
      type: 'depósito',
      amount: 2500,
      description: 'Transferencia recibida',
    },
  ];

  cuentas: Account[] = [
    {
      id: 1,
      userId: 1,
      type: 'ahorro',
      balance: 1500,
      status: 'activa',
    },
        {
      id: 2,
      userId: 2,
      type: 'retiro',
      balance: 1400,
      status: 'inactiva',
    },
  ];

  selectedAccount: Account = this.cuentas[0];

  constructor() {}

  get movimientosFiltrados(): Transaction[] {
    return this.movimientos.filter((m) => m.accountId === this.selectedAccount?.id);
  }
}
