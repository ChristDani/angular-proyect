import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-accounts',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule
  ],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts {
  displayedColumns: string[] = ['fecha', 'operacion', 'descripcion', 'moneda', 'importe'];

  movimientos = [
    {
      fecha: '20/09/2025',
      operacion: '00001',
      descripcion: 'Retiro',
      moneda: 'Soles',
      importe: 10000,
    },
    {
      fecha: '20/09/2025',
      operacion: '00001',
      descripcion: 'Retiro',
      moneda: 'Soles',
      importe: 10000,
    },
    {
      fecha: '20/09/2025',
      operacion: '00001',
      descripcion: 'Retiro',
      moneda: 'Soles',
      importe: 10000,
    },
    {
      fecha: '20/09/2025',
      operacion: '00001',
      descripcion: 'Retiro',
      moneda: 'Soles',
      importe: 10000,
    },
  ];

  selectedAccount: any;

  cuentas = [
    { nombre: 'CUENTA RETIRO', numero: '****2015', saldo: -1000000 },
    { nombre: 'CUENTA AHORROS', numero: '****9981', saldo: 25000 },
    { nombre: 'CUENTA SUELDO', numero: '****7742', saldo: 5800 },
  ];
}
