import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Rol, ROLES, Usuario } from '../../core/models/modelos';
import { AuthService } from '../../core/services/auth.service';
import { ForoService } from '../../core/services/foro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ConfirmacionService } from '../../shared/confirmacion.service';

/**
 * Gestión de usuarios (ADMIN): cambiar rol, activar/desactivar y eliminar.
 * Equivale a los endpoints de usuarios-service para el rol ADMIN.
 */
@Component({
  selector: 'app-admin-usuarios',
  imports: [FormsModule, DatePipe],
  template: `
    <div class="card shadow-sm">
      <div class="card-header bg-transparent">
        <div class="row g-2 align-items-center">
          <div class="col-12 col-md-5"><h2 class="h5 mb-0">Usuarios registrados ({{ filtrados().length }})</h2></div>
          <div class="col-6 col-md-3">
            <label class="visually-hidden" for="rolFiltro">Rol</label>
            <select id="rolFiltro" class="form-select form-select-sm" [ngModel]="rolFiltro()" (ngModelChange)="rolFiltro.set($event)">
              <option value="">Todos los roles</option>
              @for (r of listaRoles; track r) { <option [value]="r">{{ roles[r].nombre }}</option> }
            </select>
          </div>
          <div class="col-6 col-md-4">
            <label class="visually-hidden" for="buscarUsuario">Buscar</label>
            <input id="buscarUsuario" type="search" class="form-control form-control-sm" placeholder="Nombre o correo" maxlength="60"
              [ngModel]="texto()" (ngModelChange)="texto.set($event)" />
          </div>
        </div>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr><th>Usuario</th><th class="d-none d-lg-table-cell">Registro</th><th>Rol</th><th>Estado</th><th class="text-end">Acciones</th></tr>
          </thead>
          <tbody>
            @for (u of filtrados(); track u.id) {
              <tr>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="avatar avatar-sm">{{ u.nombre.charAt(0) }}</span>
                    <div style="min-width: 0">
                      <div class="fw-semibold text-truncate">{{ u.nombre }} @if (u.id === actual()?.id) { <span class="badge text-bg-info">Tú</span> }</div>
                      <div class="small text-body-secondary text-truncate">{{ u.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="d-none d-lg-table-cell small">{{ u.fechaCreacion | date: 'd MMM y' }}</td>
                <td style="min-width: 140px">
                  <label class="visually-hidden" [for]="'rol' + u.id">Rol de {{ u.nombre }}</label>
                  <select [id]="'rol' + u.id" class="form-select form-select-sm" [ngModel]="u.rol" [disabled]="u.id === actual()?.id"
                    (ngModelChange)="cambiarRol(u, $event)">
                    @for (r of listaRoles; track r) { <option [value]="r">{{ roles[r].nombre }}</option> }
                  </select>
                </td>
                <td>
                  <div class="form-check form-switch mb-0">
                    <input class="form-check-input" type="checkbox" role="switch" [id]="'estado' + u.id" [checked]="u.estado === 'ACTIVO'"
                      [disabled]="u.id === actual()?.id" (change)="alternarEstado(u)" />
                    <label class="form-check-label small" [for]="'estado' + u.id">{{ u.estado === 'ACTIVO' ? 'Activo' : 'Inactivo' }}</label>
                  </div>
                </td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Eliminar usuario"
                    [disabled]="u.id === actual()?.id" (click)="eliminar(u)"><i class="bi bi-trash"></i></button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="text-center py-4 text-body-secondary">No hay usuarios que coincidan.</td></tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminUsuarios {
  private readonly usuarios = inject(UsuarioService);
  private readonly foro = inject(ForoService);
  private readonly auth = inject(AuthService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly roles = ROLES;
  protected readonly listaRoles: Rol[] = ['ADMIN', 'MODERADOR', 'USUARIO'];
  protected readonly actual = this.auth.usuarioActual;
  protected readonly texto = signal('');
  protected readonly rolFiltro = signal<Rol | ''>('');

  protected readonly filtrados = computed(() => {
    const t = this.texto().trim().toLowerCase();
    return this.usuarios
      .usuarios()
      .filter((u) => (!this.rolFiltro() || u.rol === this.rolFiltro()) && (!t || `${u.nombre} ${u.email}`.toLowerCase().includes(t)));
  });

  protected cambiarRol(u: Usuario, rol: Rol): void {
    this.usuarios.cambiarRol(u.id, rol);
    this.notificaciones.exito(`${u.nombre} ahora es ${ROLES[rol].nombre}.`, 'Rol actualizado');
  }

  protected alternarEstado(u: Usuario): void {
    const estado = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.usuarios.cambiarEstado(u.id, estado);
    this.notificaciones.info(`La cuenta de ${u.nombre} quedó ${estado.toLowerCase()}.`, 'Estado actualizado');
  }

  protected async eliminar(u: Usuario): Promise<void> {
    if (this.foro.tieneContenido(u.id)) {
      this.notificaciones.aviso('El usuario tiene publicaciones o comentarios. Desactívalo en lugar de eliminarlo.', 'No se puede eliminar');
      return;
    }
    const r = await this.confirmacion.confirmar({
      titulo: 'Eliminar usuario',
      mensaje: `¿Eliminar la cuenta de ${u.nombre} (${u.email})?`,
      textoAceptar: 'Eliminar',
    });
    if (r.aceptado) {
      this.usuarios.eliminar(u.id);
      this.notificaciones.exito('Usuario eliminado.');
    }
  }
}
