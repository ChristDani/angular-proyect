import { Routes } from '@angular/router';
import { Panel } from './panel/panel';
import { Users } from './users/users';
import { Accounts } from './accounts/accounts';
import { Admin } from './admin';
import { Loans } from './loans/loans';
import { Cards } from './cards/cards';
import { Reports } from './reports/reports';


export const ADMIN_ROUTES: Routes = [
    { path: '', 
      component: Admin,
      children: [
        { path: '', component: Panel},
        { path: 'users', component: Users},
        { path: 'accounts', component: Accounts},
        { path: 'loans', component: Loans},
        { path: 'cards', component: Cards},
        { path: 'reports', component: Reports}
      ]}
];
