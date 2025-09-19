import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Client } from './client';
import { Transfers } from './transfers/transfers';
import { Loans } from './loans/loans';
import { Cards } from './cards/cards';
import { Accounts } from './accounts/accounts';


export const CLIENT_ROUTES: Routes = [
    { path: '', 
      component: Client,
    children: [
        { path: '', component: Dashboard},
        { path: 'accounts', component: Accounts},
        { path: 'transfers', component: Transfers},
        { path: 'loans', component: Loans},
        { path: 'cards', component: Cards},
    ]}
];
