import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UserService } from '../../core/services/user.service';
import { User } from '../../models/interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { ProductCreationModal } from './product-creation-modal/product-creation-modal';
import { Client } from '../../models/interfaces/products-user.interface';
import { UserCreationModal } from './user-creation-modal/user-creation-modal';
import { AlertModal } from '../alert-modal/alert-modal';
import { ToastService } from '../../shared/services/toast.service';

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
  dataSource: User[] = [];
  columnsToDisplay = ['id', 'name', 'role'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: User | null = null;

  users: User[] = [];

  deleteUserAlert: boolean = false;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  /**
   * metodos para expandir/ocultar columnas con acciones (CRUD USER)
   * @param element
   * @returns
   */
  isExpanded(element: User) {
    return this.expandedElement === element;
  }

  toggle(element: User) {
    this.expandedElement = this.isExpanded(element) ? null : element;
  }

  /**
   * @param element metodos para CRUD USER
   * hacer llamado del listado al hacer operaciones del crud
   */
  getUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.dataSource = this.users;
      },
      error: (error) => {
        console.error('Error en obtener users ', error);
      },
    });
  }

  addNewUser() {
    const ref = this.dialog.open(UserCreationModal, {
      width: '600px',
    });

    ref.afterClosed().subscribe((created) => {
      if (created) {
        this.getUsers();
      }
    });
  }

  editUser(element: User) {
    const ref = this.dialog.open(UserCreationModal, {
      width: '600px',
      data: element,
    });

    ref.afterClosed().subscribe((updated) => {
      if (updated) {
        this.getUsers();
      }
    });
  }

  deleteUser(element: User) {
    this.deleteUserAlert = true;
    const id = element.id;

    const ref = this.dialog.open(AlertModal, {
      width: '500px',
      data: {
        id,
      },
    });

    ref.afterClosed().subscribe((userDelete) => {
      if (userDelete) {
        this.getUsers();
      }
    });
  }

  /**
   * métodos para agregar cuenta, prestamo o tarjeta a un usuario
   * consultar cuentas por usuario, usar id de account e id de user para crear productos
   * consultar de qué cuenta quiere hacer la creación de productos
   * se requiere tipo de producto, id de user, id de account
   * @param element
   */

  openCreateProductDialog(client: Client) {
    const ref = this.dialog.open(ProductCreationModal, {
      width: '600px',
      data: {
        client,
      },
    });

    ref.afterClosed().subscribe((createdProduct) => {
      if (createdProduct) {
        this.getUsers();
      }
    });
  }
}
