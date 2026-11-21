import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { EstadoContenido } from '../../core/models/modelos';
import { ForoService } from '../../core/services/foro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ConfirmacionService } from '../../shared/confirmacion.service';

type Vista = 'temas' | 'comentarios';
type Filtro = 'TODOS' | EstadoContenido;

/**
 * Panel de moderación (ADMIN y MODERADOR): banear o reactivar temas y comentarios
 * que incumplen las normas del foro. Equivale a administracion-service.
 */
@Component({
  selector: 'app-moderacion',
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
    <section class="encabezado-pagina">
      <div class="container py-4">
        <h1 class="h2 fw-bold mb-1"><i class="bi bi-flag me-2"></i>Panel de moderación</h1>
        <p class="mb-0 opacity-75">Revisa el contenido y aplica las normas de la comunidad</p>
      </div>
    </section>

    <section class="container py-4">
      <div class="row g-3 mb-4">
        @for (e of resumen(); track e.texto) {
          <div class="col-6 col-lg-3">
            <div class="card shadow-sm h-100 border-start border-4" [class]="e.borde">
              <div class="card-body">
                <div class="small text-body-secondary">{{ e.texto }}</div>
                <div class="fs-3 fw-bold">{{ e.valor }}</div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="card shadow-sm">
        <div class="card-header bg-transparent">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-5">
              <div class="btn-group w-100" role="group" aria-label="Tipo de contenido">
                <button type="button" class="btn" [class]="vista() === 'temas' ? 'btn-primario' : 'btn-outline-secondary'" (click)="vista.set('temas')">
                  <i class="bi bi-chat-square-text me-1"></i>Temas
                </button>
                <button type="button" class="btn" [class]="vista() === 'comentarios' ? 'btn-primario' : 'btn-outline-secondary'" (click)="vista.set('comentarios')">
                  <i class="bi bi-chat-dots me-1"></i>Comentarios
                </button>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <label class="visually-hidden" for="filtro">Estado</label>
              <select id="filtro" class="form-select" [ngModel]="filtro()" (ngModelChange)="filtro.set($event)">
                <option value="TODOS">Todos los estados</option>
                <option value="ACTIVO">Activos</option>
                <option value="BANEADO">Baneados</option>
              </select>
            </div>
            <div class="col-6 col-md-4">
              <label class="visually-hidden" for="buscarMod">Buscar</label>
              <input id="buscarMod" type="search" class="form-control" placeholder="Buscar texto o autor" maxlength="60"
                [ngModel]="texto()" (ngModelChange)="texto.set($event)" />
            </div>
          </div>
        </div>

        <div class="table-responsive">
          @if (vista() === 'temas') {
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr><th>Tema</th><th class="d-none d-md-table-cell">Autor</th><th class="d-none d-lg-table-cell">Fecha</th><th>Estado</th><th class="text-end">Acción</th></tr>
              </thead>
              <tbody>
                @for (p of temas(); track p.id) {
                  <tr>
                    <td>
                      <a [routerLink]="['/temas', p.id]" class="fw-semibold">{{ p.titulo }}</a>
                      <div class="small text-body-secondary">{{ p.categoria }}</div>
                      @if (p.motivoBaneo) { <div class="small text-danger">Motivo: {{ p.motivoBaneo }}</div> }
                    </td>
                    <td class="d-none d-md-table-cell">{{ p.autor }}</td>
                    <td class="d-none d-lg-table-cell small">{{ p.fechaCreacion | date: 'd MMM y' }}</td>
                    <td><span class="badge" [class]="p.estado === 'ACTIVO' ? 'text-bg-success' : 'text-bg-danger'">{{ p.estado }}</span></td>
                    <td class="text-end">
                      @if (p.estado === 'ACTIVO') {
                        <button class="btn btn-sm btn-warning" type="button" (click)="banearTema(p.id, p.titulo)"><i class="bi bi-slash-circle me-1"></i>Banear</button>
                      } @else {
                        <button class="btn btn-sm btn-success" type="button" (click)="reactivarTema(p.id)"><i class="bi bi-arrow-counterclockwise me-1"></i>Reactivar</button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="text-center text-body-secondary py-4">No hay temas con ese filtro.</td></tr>
                }
              </tbody>
            </table>
          } @else {
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr><th>Comentario</th><th class="d-none d-md-table-cell">Autor</th><th class="d-none d-lg-table-cell">Tema</th><th>Estado</th><th class="text-end">Acción</th></tr>
              </thead>
              <tbody>
                @for (c of comentarios(); track c.id) {
                  <tr>
                    <td class="text-break">
                      {{ c.contenido }}
                      @if (c.motivoBaneo) { <div class="small text-danger">Motivo: {{ c.motivoBaneo }}</div> }
                    </td>
                    <td class="d-none d-md-table-cell">{{ c.autor }}</td>
                    <td class="d-none d-lg-table-cell small"><a [routerLink]="['/temas', c.idPublicacion]">{{ c.tituloPublicacion }}</a></td>
                    <td><span class="badge" [class]="c.estado === 'ACTIVO' ? 'text-bg-success' : 'text-bg-danger'">{{ c.estado }}</span></td>
                    <td class="text-end">
                      @if (c.estado === 'ACTIVO') {
                        <button class="btn btn-sm btn-warning" type="button" (click)="banearComentario(c.id)"><i class="bi bi-slash-circle me-1"></i>Banear</button>
                      } @else {
                        <button class="btn btn-sm btn-success" type="button" (click)="reactivarComentario(c.id)"><i class="bi bi-arrow-counterclockwise me-1"></i>Reactivar</button>
                      }
                    </td>
                  </tr>
                } @empty {
                  <tr><td colspan="5" class="text-center text-body-secondary py-4">No hay comentarios con ese filtro.</td></tr>
                }
              </tbody>
            </table>
          }
        </div>
      </div>
    </section>
  `,
})
export class Moderacion {
  private readonly foro = inject(ForoService);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly vista = signal<Vista>('temas');
  protected readonly filtro = signal<Filtro>('TODOS');
  protected readonly texto = signal('');

  protected readonly resumen = computed(() => {
    const e = this.foro.estadisticas();
    return [
      { texto: 'Temas activos', valor: e.publicaciones - e.publicacionesBaneadas, borde: 'border-success' },
      { texto: 'Temas baneados', valor: e.publicacionesBaneadas, borde: 'border-danger' },
      { texto: 'Comentarios activos', valor: e.comentarios - e.comentariosBaneados, borde: 'border-success' },
      { texto: 'Comentarios baneados', valor: e.comentariosBaneados, borde: 'border-danger' },
    ];
  });

  protected readonly temas = computed(() =>
    this.foro
      .publicaciones()
      .filter((p) => this.coincide(p.estado, `${p.titulo} ${p.autor}`))
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)),
  );

  protected readonly comentarios = computed(() =>
    this.foro
      .comentarios()
      .filter((c) => this.coincide(c.estado, `${c.contenido} ${c.autor}`))
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)),
  );

  protected async banearTema(id: number, titulo: string): Promise<void> {
    const r = await this.confirmacion.confirmar({
      titulo: 'Banear tema',
      mensaje: `"${titulo}" dejará de ser visible en el foro.`,
      textoAceptar: 'Banear',
      claseAceptar: 'btn-warning',
      pedirMotivo: true,
    });
    if (r.aceptado) {
      this.foro.moderarPublicacion(id, 'BANEADO', r.motivo);
      this.notificaciones.aviso('Tema baneado correctamente.', 'Moderación');
    }
  }

  protected reactivarTema(id: number): void {
    this.foro.moderarPublicacion(id, 'ACTIVO');
    this.notificaciones.exito('El tema fue reactivado.', 'Moderación');
  }

  protected async banearComentario(id: number): Promise<void> {
    const r = await this.confirmacion.confirmar({
      titulo: 'Banear comentario',
      mensaje: 'El comentario dejará de mostrarse en el foro.',
      textoAceptar: 'Banear',
      claseAceptar: 'btn-warning',
      pedirMotivo: true,
    });
    if (r.aceptado) {
      this.foro.moderarComentario(id, 'BANEADO', r.motivo);
      this.notificaciones.aviso('Comentario baneado correctamente.', 'Moderación');
    }
  }

  protected reactivarComentario(id: number): void {
    this.foro.moderarComentario(id, 'ACTIVO');
    this.notificaciones.exito('El comentario fue reactivado.', 'Moderación');
  }

  private coincide(estado: EstadoContenido, texto: string): boolean {
    const termino = this.texto().trim().toLowerCase();
    return (this.filtro() === 'TODOS' || estado === this.filtro()) && (!termino || texto.toLowerCase().includes(termino));
  }
}
