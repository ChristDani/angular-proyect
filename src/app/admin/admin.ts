import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatLine } from '@angular/material/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Observable, filter, map, shareReplay } from 'rxjs';



@Component({
  selector: 'app-admin',
  imports: [RouterOutlet,RouterLink, CommonModule, MatToolbarModule, MatSidenavModule, MatListModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatTableModule, MatPaginatorModule, MatLine],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit{
nameUser = signal('');
isHandset$: Observable<boolean>;
currentRoute = signal('');
  private routeTitles: Record<string, string> = {
    '/admin': 'Inicio',
    '/admin/users': 'Clientes',
    '/admin/reports': 'Reportes',
  };

  constructor(private router: Router, private auth: AuthService, private breakpointObserver: BreakpointObserver){
    this.isHandset$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(map(r => r.matches), shareReplay());
        this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const newTitle = this.routeTitles[event.urlAfterRedirects] || 'Dashboard Cliente';
        this.currentRoute.set(newTitle);
      });
  }

  ngOnInit(): void {
    const name=this.auth.getLoggedInUser()?.name;
    this.nameUser.set(name ? name : 'Admin');
  }

  close(): void{
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
