import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'rol', label: 'Rol' },
  ];

  displayedColumns = [...this.columns.map((col) => col.key), 'acciones'];

  dataSource = [
    // { id: '1', nombre: 'Ana García', rol: 'Admin', monto: 'S/.1000' },
    // { id: '2', nombre: 'Juan Perez', rol: 'Cliente', monto: 'S/.1000' },
    // { id: '3', nombre: 'Cliente3', rol: 'Cliente', monto: 'S/.1000' },
    // { id: '4', nombre: 'Cliente4', rol: 'Cliente', monto: 'S/.1000' },
      { id: '1', nombre: 'Ana García', rol: 'Admin', isExpanded: false },
  { id: '2', nombre: 'Juan Perez', rol: 'Cliente', isExpanded: false },
  { id: '3', nombre: 'Cliente3', rol: 'Cliente', isExpanded: false },
  { id: '4', nombre: 'Cliente4', rol: 'Cliente', isExpanded: false },
  ];

  selectedUserId: string | null = null;
  expandedElement: any | null = null;
  showRow: boolean = false;

  constructor() {}

  ngOnInit(): void {
    console.log('Hola user');
  }

  editUser(user: any) {
    console.log(user);
  }
  
  deleteUser(user: any) {
    console.log(user);
  }
  
  addUserProduct(user: any) {
    this.showRow = !this.showRow;
    this.selectedUserId = this.selectedUserId === user.id ? null : user.id;
    this.expandedElement = this.expandedElement === user ? null : user;
    console.log(user);
    console.log(user.id);
    console.log(this.selectedUserId);
  }

  toggleExpandedRow(user: any) {
  this.expandedElement = this.expandedElement === user ? null : user;
}
}
