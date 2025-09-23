import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-panel',
  imports: [MatCardModule, MatButtonModule, MatProgressBarModule,MatIconModule],
  templateUrl: './panel.html',
  styleUrl: './panel.css'
})
export class Panel {

  statistics = [
  {
    title: 'Clientes',
    items: [
      { value: 40, class: 'total', label: 'Clientes actuales' },
      { value: 40, class: 'new', label: 'Nuevos clientes registrados' },
      { value: 10, class: 'delete', label: 'Clientes eliminados' }
    ]
  },
  {
    title: 'Tarjetas',
    items: [
      { value: 40, class: 'total', label: 'Tarjetas actuales' },
      { value: 40, class: 'new', label: 'Solicitudes de nuevas tarjetas' },
      { value: 10, class: 'delete', label: 'Tarjetas eliminadas/bloqueadas' }
    ]
  },
  {
    title: 'Cuentas',
    items: [
      { value: 40, class: 'total', label: 'Cuentas actuales' },
      { value: 40, class: 'new', label: 'Nuevos cuentas registrados' },
      { value: 10, class: 'delete', label: 'Cuentas eliminados' }
    ]
  },
  {
    title: 'Préstamos',
    items: [
      { value: 40, class: 'total', label: 'Préstamos actuales' },
      { value: 40, class: 'new', label: 'Nuevos Préstamos registrados' },
      { value: 10, class: 'delete', label: 'Préstamos eliminados' }
    ]
  }
];

  constructor(private router:Router){}

  redirectTo(path: string){
    this.router.navigate([`admin/${path}`]);
  }

}
