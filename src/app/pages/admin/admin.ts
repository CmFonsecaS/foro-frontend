import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { CategoriaService } from '../../core/services/categoria.service';
import { ForoService } from '../../core/services/foro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ConfirmacionService } from '../../shared/confirmacion.service';

/**
 * Contenedor del panel de administración (solo ADMIN) con sus sub-páginas.
 */
@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <section class="encabezado-pagina">
      <div class="container py-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 class="h2 fw-bold mb-1"><i class="bi bi-speedometer2 me-2"></i>Administración</h1>
          <p class="mb-0 opacity-75">Gestión de usuarios, roles y categorías del foro</p>
        </div>
        <button class="btn btn-outline-light btn-sm" type="button" (click)="restablecer()">
          <i class="bi bi-arrow-repeat me-1"></i>Restablecer datos de demo
        </button>
      </div>
    </section>

    <section class="container py-4">
      <ul class="nav nav-pills mb-4 flex-nowrap overflow-auto">
        <li class="nav-item"><a class="nav-link text-nowrap" routerLink="resumen" routerLinkActive="active"><i class="bi bi-bar-chart me-1"></i>Resumen</a></li>
        <li class="nav-item"><a class="nav-link text-nowrap" routerLink="usuarios" routerLinkActive="active"><i class="bi bi-people me-1"></i>Usuarios</a></li>
        <li class="nav-item"><a class="nav-link text-nowrap" routerLink="categorias" routerLinkActive="active"><i class="bi bi-grid me-1"></i>Categorías</a></li>
        <li class="nav-item"><a class="nav-link text-nowrap" routerLink="/moderacion"><i class="bi bi-flag me-1"></i>Moderación</a></li>
      </ul>
      <router-outlet />
    </section>
  `,
})
export class Admin {
  private readonly usuarios = inject(UsuarioService);
  private readonly categorias = inject(CategoriaService);
  private readonly foro = inject(ForoService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected async restablecer(): Promise<void> {
    const r = await this.confirmacion.confirmar({
      titulo: 'Restablecer datos',
      mensaje: 'Se perderán los cambios realizados y se cargarán los datos iniciales de la demostración.',
      textoAceptar: 'Restablecer',
      claseAceptar: 'btn-warning',
    });
    if (r.aceptado) {
      this.usuarios.restablecer();
      this.categorias.restablecer();
      this.foro.restablecer();
      this.notificaciones.info('Se cargaron los datos iniciales.', 'Datos restablecidos');
    }
  }
}

@Component({
  selector: 'app-admin-resumen',
  imports: [RouterLink],
  template: `
    <div class="row g-3 mb-4">
      @for (e of tarjetas(); track e.texto) {
        <div class="col-6 col-md-4 col-xl-2">
          <div class="card shadow-sm text-center h-100">
            <div class="card-body">
              <i class="bi fs-3" [class]="e.icono + ' ' + e.color"></i>
              <div class="fs-3 fw-bold">{{ e.valor }}</div>
              <div class="small text-body-secondary">{{ e.texto }}</div>
            </div>
          </div>
        </div>
      }
    </div>

    <div class="row g-4">
      <div class="col-12 col-lg-7">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-transparent fw-semibold">Temas por categoría</div>
          <div class="card-body">
            @for (c of porCategoria(); track c.nombre) {
              <div class="mb-3">
                <div class="d-flex justify-content-between small"><span>{{ c.nombre }}</span><span>{{ c.cantidad }}</span></div>
                <div class="progress" role="progressbar" [attr.aria-label]="'Temas en ' + c.nombre" style="height: 10px">
                  <div class="progress-bar" [style.width.%]="c.porcentaje" [style.background]="c.color"></div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
      <div class="col-12 col-lg-5">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-transparent fw-semibold">Usuarios por rol</div>
          <ul class="list-group list-group-flush">
            @for (r of porRol(); track r.rol) {
              <li class="list-group-item d-flex justify-content-between align-items-center">
                {{ r.rol }} <span class="badge text-bg-secondary rounded-pill">{{ r.cantidad }}</span>
              </li>
            }
          </ul>
          <div class="card-body">
            <a routerLink="../usuarios" class="btn btn-primario btn-sm">Gestionar usuarios</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminResumen {
  private readonly usuarios = inject(UsuarioService);
  private readonly categorias = inject(CategoriaService);
  private readonly foro = inject(ForoService);

  protected readonly tarjetas = computed(() => {
    const e = this.foro.estadisticas();
    return [
      { icono: 'bi-people', color: 'texto-primario', valor: this.usuarios.usuarios().length, texto: 'Usuarios' },
      { icono: 'bi-person-check', color: 'text-success', valor: this.usuarios.activos(), texto: 'Activos' },
      { icono: 'bi-grid', color: 'texto-primario', valor: this.categorias.categorias().length, texto: 'Categorías' },
      { icono: 'bi-chat-square-text', color: 'texto-primario', valor: e.publicaciones, texto: 'Temas' },
      { icono: 'bi-chat-dots', color: 'texto-primario', valor: e.comentarios, texto: 'Comentarios' },
      { icono: 'bi-slash-circle', color: 'text-danger', valor: e.publicacionesBaneadas + e.comentariosBaneados, texto: 'Baneados' },
    ];
  });

  protected readonly porCategoria = computed(() => {
    const datos = this.categorias.categorias().map((c) => ({
      nombre: c.nombre,
      color: c.color,
      cantidad: this.foro.contarPorCategoria(c.id),
    }));
    const max = Math.max(1, ...datos.map((d) => d.cantidad));
    return datos.map((d) => ({ ...d, porcentaje: (d.cantidad / max) * 100 }));
  });

  protected readonly porRol = computed(() =>
    (['ADMIN', 'MODERADOR', 'USUARIO'] as const).map((rol) => ({
      rol,
      cantidad: this.usuarios.usuarios().filter((u) => u.rol === rol).length,
    })),
  );
}
