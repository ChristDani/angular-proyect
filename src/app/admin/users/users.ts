import { Component, OnInit, signal } from '@angular/core';
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
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ProductCreationModal } from './product-creation-modal/product-creation-modal';
import { Account, Client } from '../../models/interfaces/products-user.interface';

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

  constructor(
    // private fb:FormBuilder,
    private userService: UserService,
    private dialog: MatDialog
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
    console.log('addNewUser');
    //getUsers();llamada del servicio
  }

  editUser(element: User) {
    console.log('editUser', element);
    //getUsers();
  }

  deleteUser(element: User) {
    console.log('deleteUser', element);
    Swal.fire({
      title: 'Eliminar usuario',
      text: 'No podras revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#005CBB',
      confirmButtonText: 'Si, eliminar!',
      cancelButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(element.id).subscribe({
          next: () => {
            console.log('Usuario eliminado exitosamente');
            this.getUsers();
          },
          error: (error) => {
            console.error('Error eliminando el usuario ', error);
          },
        });
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
  addUserAccount(element: User) {
    console.log('addUserAccount', element);
  }

  openCreateProductDialog(client: Client) {
    const ref = this.dialog.open(ProductCreationModal, {
      width: '600px',
      data: {
        client,
      },
    });

    ref.afterClosed().subscribe((createdProduct) => {
      if (createdProduct) {
        console.log('Producto creado:', createdProduct);
      }
    });
  }
}
