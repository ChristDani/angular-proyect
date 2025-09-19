import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Client } from './client';
import { Transfers } from './transfers/transfers';
import { Loans } from './loans/loans';
import { Cards } from './cards/cards';
import { Accounts } from './accounts/accounts';
import { RoleGuardClient } from '../core/guards/role.guard';


export const CLIENT_ROUTES: Routes = [
    { path: '', 
      component: Client,
      canActivate: [RoleGuardClient],
      canActivateChild: [RoleGuardClient],
      children: [
        { path: '', component: Dashboard},
        { path: 'accounts', component: Accounts},
        { path: 'transfers', component: Transfers},
        { path: 'loans', component: Loans},
        { path: 'cards', component: Cards},
    ]}
];
