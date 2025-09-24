import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
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

export class Users {
  /**
 * Datos de prueba para la tabla de usuarios
 * sustituir con data del CRUD
 */
ELEMENT_DATA: UserElement[] = [
  {
    id: '1',
    nombre: 'Ana García',
    rol: 'Admin',
  },
  {
    id: '2',
    nombre: 'Juan Perez',
    rol: 'Cliente',
  },
  {
    id: '3',
    nombre: 'cliente3',
    rol: 'cliente',
  },
  {
    id: '4',
    nombre: 'cliente4',
    rol: 'cliente',
  },
 
];
  dataSource = this.ELEMENT_DATA;
  columnsToDisplay = ['id', 'nombre', 'rol'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: UserElement | null = null;
  
  /**
   * metodos para expandir/ocultar columnas con acciones (CRUD USER)
   * @param element 
   * @returns 
   */
  isExpanded(element: UserElement) {
    return this.expandedElement === element;
  }

  toggle(element: UserElement) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  /**
   * @param element metodos para CRUD USER
   * hacer llamado del listado al hacer operaciones del crud
   */
  getUsers(element: UserElement) { // llamada del servicio con listado
    console.log('getAllUsers', element);
  }

  addNewUser(element: UserElement) {
    console.log('addNewUser', element);
    //getUsers();llamada del servicio
  }

  editUser(element: UserElement) {
    console.log('editUser', element);
    //getUsers();
  }
  
  deleteUser(element: UserElement) {
    console.log('deleteUser', element);
    //getUsers();
  }
  
  /**
   * métodos para agregar cuenta, prestamo o tarjeta a un usuario
   * consultar cuentas por usuario, usar id de account e id de user para crear productos
   * consultar de qué cuenta quiere hacer la creación de productos
   * se requiere tipo de producto, id de user, id de account
   * @param element 
   */
  addUserAccount(element: UserElement) {
    console.log('addUserAccount', element);
  }
  addUserLoan(element: UserElement) {
    console.log('addUserLoan', element);
  }
  addUserCard(element: UserElement) {
    console.log('addUserCard', element);
  }
}

export interface UserElement {
  id: string;
  nombre: string;
  rol: string;
}

