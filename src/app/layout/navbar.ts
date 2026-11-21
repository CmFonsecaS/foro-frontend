import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { ROLES } from '../core/models/modelos';
import { AuthService } from '../core/services/auth.service';
import { NotificacionService } from '../core/services/notificacion.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark barra-principal sticky-top shadow-sm" aria-label="Navegación principal">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" routerLink="/" (click)="cerrarMenu()">
          <img src="logo.svg" alt="" width="36" height="36" />
          <span class="fw-bold marca">Ágora</span>
        </a>

        <button class="navbar-toggler" type="button" aria-controls="menuPrincipal"
          [attr.aria-expanded]="menuAbierto()" aria-label="Abrir menú" (click)="menuAbierto.set(!menuAbierto())">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="menuPrincipal" [class.show]="menuAbierto()">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="cerrarMenu()">
                <i class="bi bi-house-door me-1"></i>Inicio
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/categorias" routerLinkActive="active" (click)="cerrarMenu()">
                <i class="bi bi-grid me-1"></i>Categorías
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/normas" routerLinkActive="active" (click)="cerrarMenu()">
                <i class="bi bi-shield-check me-1"></i>Normas
              </a>
            </li>
            @if (auth.puedeModerar()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/moderacion" routerLinkActive="active" (click)="cerrarMenu()">
                  <i class="bi bi-flag me-1"></i>Moderación
                </a>
              </li>
            }
            @if (auth.esAdmin()) {
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin" routerLinkActive="active" (click)="cerrarMenu()">
                  <i class="bi bi-speedometer2 me-1"></i>Administración
                </a>
              </li>
            }
          </ul>

          <form class="d-flex my-2 my-lg-0 me-lg-3" role="search" (ngSubmit)="buscar()">
            <div class="input-group input-group-sm">
              <input class="form-control" type="search" name="q" placeholder="Buscar temas..." aria-label="Buscar temas"
                maxlength="60" [(ngModel)]="texto" />
              <button class="btn btn-acento" type="submit" aria-label="Buscar"><i class="bi bi-search"></i></button>
            </div>
          </form>

          @if (auth.usuarioActual(); as u) {
            <div class="dropdown">
              <button class="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2" type="button"
                data-bs-toggle="dropdown" aria-expanded="false">
                <span class="avatar avatar-sm">{{ u.nombre.charAt(0) }}</span>
                <span class="text-truncate" style="max-width: 140px">{{ u.nombre }}</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow">
                <li><span class="dropdown-item-text small"><span class="badge" [class]="roles[u.rol].clase">{{ roles[u.rol].nombre }}</span></span></li>
                <li><hr class="dropdown-divider" /></li>
                <li><a class="dropdown-item" routerLink="/temas/nuevo" (click)="cerrarMenu()"><i class="bi bi-plus-circle me-2"></i>Nuevo tema</a></li>
                <li><a class="dropdown-item" routerLink="/mis-publicaciones" (click)="cerrarMenu()"><i class="bi bi-journal-text me-2"></i>Mis publicaciones</a></li>
                <li><a class="dropdown-item" routerLink="/perfil" (click)="cerrarMenu()"><i class="bi bi-person-gear me-2"></i>Mi perfil</a></li>
                <li><hr class="dropdown-divider" /></li>
                <li><button class="dropdown-item text-danger" type="button" (click)="salir()"><i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión</button></li>
              </ul>
            </div>
          } @else {
            <div class="d-flex gap-2">
              <a class="btn btn-outline-light btn-sm" routerLink="/login" (click)="cerrarMenu()">Iniciar sesión</a>
              <a class="btn btn-acento btn-sm" routerLink="/registro" (click)="cerrarMenu()">Registrarse</a>
            </div>
          }
        </div>
      </div>
    </nav>
  `,
})
export class Navbar {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly roles = ROLES;
  protected readonly menuAbierto = signal(false);
  protected texto = '';

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected buscar(): void {
    const q = this.texto.trim();
    this.cerrarMenu();
    this.router.navigate(['/buscar'], { queryParams: q ? { q } : {} });
  }

  protected salir(): void {
    this.auth.logout();
    this.cerrarMenu();
    this.notificaciones.info('Cerraste sesión correctamente. ¡Hasta pronto!', 'Sesión cerrada');
    this.router.navigate(['/']);
  }
}
