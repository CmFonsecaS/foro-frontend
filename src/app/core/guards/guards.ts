import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { Rol } from '../models/modelos';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

/**
 * Guards de rutas: controlan el acceso a las páginas según la sesión y el rol.
 */

/** Requiere un usuario autenticado. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.autenticado()) {
    return true;
  }
  inject(NotificacionService).aviso('Debes iniciar sesión para acceder a esta página.');
  return router.createUrlTree(['/login'], { queryParams: { volver: state.url } });
};

/** Requiere uno de los roles indicados en data.roles de la ruta. */
export const rolGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as Rol[];

  if (!auth.autenticado()) {
    return router.createUrlTree(['/login']);
  }
  if (auth.tieneRol(...roles)) {
    return true;
  }
  inject(NotificacionService).error('No tienes permisos para acceder a esta sección.', 'Acceso denegado');
  return router.createUrlTree(['/']);
};

/** Evita que un usuario con sesión vuelva a login o registro. */
export const invitadoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado() ? inject(Router).createUrlTree(['/']) : true;
};
