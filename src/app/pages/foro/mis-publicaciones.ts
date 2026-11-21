import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { ForoService } from '../../core/services/foro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ConfirmacionService } from '../../shared/confirmacion.service';

type Pestana = 'temas' | 'comentarios';

@Component({
  selector: 'app-mis-publicaciones',
  imports: [RouterLink, DatePipe],
  template: `
    <section class="container py-4 py-md-5">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 class="h3 fw-bold mb-0">Mis publicaciones</h1>
          <p class="text-body-secondary mb-0">Administra tus temas y comentarios</p>
        </div>
        <a class="btn btn-primario" routerLink="/temas/nuevo"><i class="bi bi-plus-circle me-1"></i>Nuevo tema</a>
      </div>

      <ul class="nav nav-tabs mb-3" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" type="button" role="tab" [class.active]="pestana() === 'temas'" (click)="pestana.set('temas')">
            Temas <span class="badge text-bg-secondary">{{ temas().length }}</span>
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" type="button" role="tab" [class.active]="pestana() === 'comentarios'" (click)="pestana.set('comentarios')">
            Comentarios <span class="badge text-bg-secondary">{{ comentarios().length }}</span>
          </button>
        </li>
      </ul>

      @if (pestana() === 'temas') {
        @if (temas().length) {
          <div class="list-group shadow-sm">
            @for (p of temas(); track p.id) {
              <div class="list-group-item py-3">
                <div class="row align-items-center g-2">
                  <div class="col-12 col-md-7">
                    <a class="fw-semibold" [routerLink]="['/temas', p.id]">{{ p.titulo }}</a>
                    <div class="small text-body-secondary">
                      {{ p.categoria }} · {{ p.fechaCreacion | date: 'd MMM y' }} · {{ p.vistas }} vistas · {{ p.cantidadComentarios }} comentarios
                    </div>
                    @if (p.estado === 'BANEADO') {
                      <div class="small text-danger"><i class="bi bi-slash-circle me-1"></i>Baneado: {{ p.motivoBaneo }}</div>
                    }
                  </div>
                  <div class="col-6 col-md-2">
                    <span class="badge" [class]="p.estado === 'ACTIVO' ? 'text-bg-success' : 'text-bg-danger'">{{ p.estado }}</span>
                  </div>
                  <div class="col-6 col-md-3 text-end">
                    @if (p.estado === 'ACTIVO') {
                      <a class="btn btn-sm btn-outline-primary me-1" [routerLink]="['/temas', p.id, 'editar']" aria-label="Editar"><i class="bi bi-pencil"></i></a>
                    }
                    <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Eliminar" (click)="eliminarTema(p.id, p.titulo)"><i class="bi bi-trash"></i></button>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="estado-vacio text-center py-5">
            <img src="vacio.svg" alt="" width="180" height="140" class="mb-3" />
            <p class="text-body-secondary">Todavía no publicas temas.</p>
            <a class="btn btn-primario" routerLink="/temas/nuevo">Publicar mi primer tema</a>
          </div>
        }
      } @else {
        <div class="list-group shadow-sm">
          @for (c of comentarios(); track c.id) {
            <div class="list-group-item py-3 d-flex flex-wrap gap-2 justify-content-between align-items-start">
              <div class="flex-grow-1" style="min-width: 0">
                <div class="small text-body-secondary">En <a [routerLink]="['/temas', c.idPublicacion]">{{ c.tituloPublicacion }}</a> · {{ c.fechaCreacion | date: 'd MMM y' }}</div>
                <p class="mb-0 text-break">{{ c.contenido }}</p>
                @if (c.estado === 'BANEADO') { <span class="badge text-bg-danger">Baneado: {{ c.motivoBaneo }}</span> }
              </div>
              <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Eliminar comentario" (click)="eliminarComentario(c.id)"><i class="bi bi-trash"></i></button>
            </div>
          } @empty {
            <div class="list-group-item text-body-secondary py-4 text-center">No has comentado aún.</div>
          }
        </div>
      }
    </section>
  `,
})
export class MisPublicaciones {
  private readonly auth = inject(AuthService);
  private readonly foro = inject(ForoService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly pestana = signal<Pestana>('temas');

  protected readonly temas = computed(() => this.foro.publicacionesDe(this.auth.usuarioActual()?.id ?? 0));
  protected readonly comentarios = computed(() =>
    this.foro
      .comentarios()
      .filter((c) => c.idUsuario === this.auth.usuarioActual()?.id)
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)),
  );

  protected async eliminarTema(id: number, titulo: string): Promise<void> {
    const r = await this.confirmacion.confirmar({
      titulo: 'Eliminar tema',
      mensaje: `¿Eliminar "${titulo}" y sus comentarios?`,
      textoAceptar: 'Eliminar',
    });
    if (r.aceptado) {
      this.foro.eliminarPublicacion(id);
      this.notificaciones.exito('El tema fue eliminado.');
    }
  }

  protected async eliminarComentario(id: number): Promise<void> {
    const r = await this.confirmacion.confirmar({
      titulo: 'Eliminar comentario',
      mensaje: '¿Seguro que deseas eliminar este comentario?',
      textoAceptar: 'Eliminar',
    });
    if (r.aceptado) {
      this.foro.eliminarComentario(id);
      this.notificaciones.exito('Comentario eliminado.');
    }
  }
}
