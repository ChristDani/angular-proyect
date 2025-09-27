import { Routes } from '@angular/router';
import { Panel } from './panel/panel';
import { Users } from './users/users';
import { Admin } from './admin';
import { Reports } from './reports/reports';
import { RoleGuardAdmin } from '../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: Admin,
    canActivate: [RoleGuardAdmin],
    canActivateChild: [RoleGuardAdmin],
    children: [
      { path: '', component: Panel },
      { path: 'users', component: Users },
      { path: 'reports', component: Reports },
    ],
  },
];
