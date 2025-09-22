import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../../auth/auth.service";
import { inject } from "@angular/core";


export const RoleGuardAdmin: CanActivateFn & CanActivateChildFn = () => {
    const authService = inject(AuthService);
    return authService.canActivate("admin");
}

export const RoleGuardClient: CanActivateFn & CanActivateChildFn = () => {
    const authService = inject(AuthService);
    return authService.canActivate("client");
}