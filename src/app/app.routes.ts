import { Routes } from '@angular/router';

import { authGuard, invitadoGuard, rolGuard } from './core/guards/guards';

/**
 * Rutas de la aplicación. Las páginas se cargan de forma diferida (lazy loading).
 * - Públicas: inicio, categorías, búsqueda, detalle de tema, normas.
 * - Invitado: login, registro, recuperar contraseña.
 * - Autenticado (cualquier rol): perfil, publicar/editar tema, mis publicaciones.
 * - ADMIN o MODERADOR: moderación.  - Solo ADMIN: administración.
 */
export const routes: Routes = [
  { path: '', title: 'Ágora | Inicio', loadComponent: () => import('./pages/foro/inicio').then((m) => m.Inicio) },
  { path: 'login', title: 'Ágora | Iniciar sesión', canActivate: [invitadoGuard], loadComponent: () => import('./pages/auth/login').then((m) => m.Login) },
  { path: 'registro', title: 'Ágora | Registro', canActivate: [invitadoGuard], loadComponent: () => import('./pages/auth/registro').then((m) => m.Registro) },
  { path: 'recuperar', title: 'Ágora | Recuperar contraseña', canActivate: [invitadoGuard], loadComponent: () => import('./pages/auth/recuperar').then((m) => m.Recuperar) },
  { path: 'perfil', title: 'Ágora | Mi perfil', canActivate: [authGuard], loadComponent: () => import('./pages/auth/perfil').then((m) => m.Perfil) },

  { path: 'categorias', title: 'Ágora | Categorías', loadComponent: () => import('./pages/foro/categorias').then((m) => m.Categorias) },
  { path: 'categorias/:id', title: 'Ágora | Categoría', loadComponent: () => import('./pages/foro/explorar').then((m) => m.Explorar) },
  { path: 'buscar', title: 'Ágora | Buscar', loadComponent: () => import('./pages/foro/explorar').then((m) => m.Explorar) },
  { path: 'temas/nuevo', title: 'Ágora | Nuevo tema', canActivate: [authGuard], loadComponent: () => import('./pages/foro/form-tema').then((m) => m.FormTema) },
  { path: 'temas/:id/editar', title: 'Ágora | Editar tema', canActivate: [authGuard], loadComponent: () => import('./pages/foro/form-tema').then((m) => m.FormTema) },
  { path: 'temas/:id', title: 'Ágora | Tema', loadComponent: () => import('./pages/foro/detalle-tema').then((m) => m.DetalleTema) },
  { path: 'mis-publicaciones', title: 'Ágora | Mis publicaciones', canActivate: [authGuard], loadComponent: () => import('./pages/foro/mis-publicaciones').then((m) => m.MisPublicaciones) },
  { path: 'normas', title: 'Ágora | Normas', loadComponent: () => import('./pages/foro/normas').then((m) => m.Normas) },

  {
    path: 'moderacion',
    title: 'Ágora | Moderación',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['ADMIN', 'MODERADOR'] },
    loadComponent: () => import('./pages/admin/moderacion').then((m) => m.Moderacion),
  },
  {
    path: 'admin',
    title: 'Ágora | Administración',
    canActivate: [authGuard, rolGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      { path: 'resumen', loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminResumen) },
      { path: 'usuarios', loadComponent: () => import('./pages/admin/admin-usuarios').then((m) => m.AdminUsuarios) },
      { path: 'categorias', loadComponent: () => import('./pages/admin/admin-categorias').then((m) => m.AdminCategorias) },
    ],
  },

  { path: '**', title: 'Ágora | Página no encontrada', loadComponent: () => import('./pages/no-encontrado').then((m) => m.NoEncontrado) },
];
