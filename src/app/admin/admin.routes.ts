import { Routes } from '@angular/router';
import { Panel } from './panel/panel';
import { Users } from './users/users';
import { Accounts } from './accounts/accounts';
import { Admin } from './admin';
import { Loans } from './loans/loans';
import { Cards } from './cards/cards';
import { Reports } from './reports/reports';
import { RoleGuardAdmin } from '../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
    { path: '', 
      component: Admin,
      canActivate: [RoleGuardAdmin],
      canActivateChild: [RoleGuardAdmin],
      children: [
        { path: '', component: Panel},
        { path: 'users', component: Users},
        { path: 'accounts', component: Accounts},
        { path: 'loans', component: Loans},
        { path: 'cards', component: Cards},
        { path: 'reports', component: Reports}
      ]}
];
