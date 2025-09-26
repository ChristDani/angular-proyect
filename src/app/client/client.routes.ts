import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Client } from './client';
import { TransfersComponent } from './transfers/transfers';
import { Loans } from './loans/loans';
import { Cards } from './cards/cards';
import { Accounts } from './accounts/accounts';
import { RoleGuardClient } from '../core/guards/role.guard';
import { Users } from '../admin/users/users';


export const CLIENT_ROUTES: Routes = [
    { path: '', 
      component: Client,
      canActivate: [RoleGuardClient],
      canActivateChild: [RoleGuardClient],
      children: [
        { path: '', component: Dashboard},
        { path: 'users', component: Users},
        { path: 'accounts', component: Accounts},
        { path: 'cards', component: Cards},
        { path: 'loans', component: Loans},
        { path: 'transfers', component: TransfersComponent},
        
        
    ]}
];
