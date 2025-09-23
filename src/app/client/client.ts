import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { Observable, filter, map, shareReplay } from 'rxjs';
import { MATERIAL_IMPORTS } from '../shared/components/material.imports';

@Component({
  selector: 'app-client',
  imports: [RouterOutlet, RouterLink, CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './client.html',
  styleUrl: './client.css',
})
export class Client implements OnInit {
  private routeTitles: Record<string, string> = {
    '/client/users': 'Inicio',
    '/client/accounts': 'Cuentas',
    '/client/cards': 'Tarjetas',
    '/client/loans': 'Préstamos',
    '/client/transfers': 'Transferencias',
  };
  nameUser = signal('');
  isHandset$: Observable<boolean>;
  currentRoute = signal('');
  constructor(
    private router: Router,
    private auth: AuthService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.isHandset$ = this.breakpointObserver.observe([Breakpoints.Handset]).pipe(
      map((r) => r.matches),
      shareReplay()
    );
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const newTitle = this.routeTitles[event.urlAfterRedirects] || 'Dashboard Cliente';
        this.currentRoute.set(newTitle);
      });
  }

  ngOnInit(): void {
    const name = this.auth.getLoggedInUser()?.name;
    this.nameUser.set(name ? name : 'Admin');
  }

  close(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
