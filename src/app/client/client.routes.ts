import { Routes } from '@angular/router';
import { Client } from './client';
import { LoansPage } from './loans/loans.page';
import { Cards } from './cards/cards';
import { Accounts } from './accounts/accounts';
import { RoleGuardClient } from '../core/guards/role.guard';
import { Users } from '../admin/users/users';
import { Dashboard } from './dashboard/dashboard';
import { TransfersComponent } from './transfers/transfers';


export const CLIENT_ROUTES: Routes = [
    { path: '', 
      component: Client,
      canActivate: [RoleGuardClient],
      canActivateChild: [RoleGuardClient],
      children: [
        { path: '', component: Dashboard},
        { path: 'dashboard', component: Dashboard},
        { path: 'accounts', component: Accounts},
        { path: 'cards', component: Cards},
        { path: 'loans', component: LoansPage},
        { path: 'transfers', component: TransfersComponent},
    ]}
];
