import { Routes } from '@angular/router';
import { Login } from './auth/login/login';


export const routes: Routes = [
    { path: '', redirectTo: 'auth', pathMatch: 'full' },
    { path: 'auth', component: Login},
    { path: 'admin', 
      loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },
    { path: 'client',
      loadChildren: () => import('./client/client.routes').then(m => m.CLIENT_ROUTES)
    }
];
