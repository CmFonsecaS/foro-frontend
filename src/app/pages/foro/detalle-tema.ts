import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { PluralPipe } from '../../shared/plural.pipe';
import { AuthService } from '../../core/services/auth.service';
import { ForoService } from '../../core/services/foro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { sinSoloEspacios } from '../../core/validators/validadores';
import { ConfirmacionService } from '../../shared/confirmacion.service';
import { ErrorCampo } from '../../shared/error-campo';

@Component({
  selector: 'app-detalle-tema',
  imports: [PluralPipe, RouterLink, DatePipe, ReactiveFormsModule, ErrorCampo],
  template: `
    @if (publicacion(); as p) {
      @if (p.estado === 'BANEADO' && !auth.puedeModerar() && !esAutor()) {
        <section class="container py-5 text-center">
          <i class="bi bi-slash-circle display-4 text-danger"></i>
          <h1 class="h3 mt-3">Este tema no está disponible</h1>
          <p class="text-body-secondary">Fue retirado por incumplir las normas del foro.</p>
          <a routerLink="/" class="btn btn-primario">Volver al inicio</a>
        </section>
      } @else {
        <section class="container py-4">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item"><a routerLink="/">Inicio</a></li>
              <li class="breadcrumb-item"><a [routerLink]="['/categorias', p.idCategoria]">{{ p.categoria }}</a></li>
              <li class="breadcrumb-item active text-truncate" aria-current="page">{{ p.titulo }}</li>
            </ol>
          </nav>

          <div class="row g-4">
            <div class="col-12 col-lg-8">
              @if (p.estado === 'BANEADO') {
                <div class="alert alert-danger"><i class="bi bi-slash-circle me-1"></i><strong>Tema baneado.</strong> Motivo: {{ p.motivoBaneo ?? 'Incumple las normas' }}</div>
              }

              <article class="card shadow-sm mb-4" [style.--color-cat]="p.colorCategoria">
                <div class="franja-categoria"></div>
                <div class="card-body p-4">
                  <span class="badge rounded-pill insignia-categoria mb-2"><i class="bi me-1" [class]="p.iconoCategoria"></i>{{ p.categoria }}</span>
                  <h1 class="h3 fw-bold">{{ p.titulo }}</h1>
                  <div class="d-flex flex-wrap align-items-center gap-2 small text-body-secondary mb-3">
                    <span class="avatar avatar-sm">{{ p.autor.charAt(0) }}</span>
                    <strong class="text-body">{{ p.autor }}</strong>
                    <span>· {{ p.fechaCreacion | date: 'd MMM y, HH:mm' }}</span>
                    @if (p.fechaEdicion) { <span>· editado</span> }
                    <span class="ms-auto"><i class="bi bi-eye me-1"></i>{{ p.vistas }} vistas</span>
                  </div>
                  <p class="contenido-tema">{{ p.contenido }}</p>
                  <div class="d-flex flex-wrap gap-1">
                    @for (e of p.etiquetas; track e) {
                      <a class="badge text-bg-light border text-decoration-none" routerLink="/buscar" [queryParams]="{ q: e }">#{{ e }}</a>
                    }
                  </div>
                </div>
                @if (esAutor() || auth.puedeModerar()) {
                  <div class="card-footer bg-transparent d-flex flex-wrap gap-2 justify-content-end">
                    @if (esAutor() && p.estado === 'ACTIVO') {
                      <a class="btn btn-sm btn-outline-primary" [routerLink]="['/temas', p.id, 'editar']"><i class="bi bi-pencil me-1"></i>Editar</a>
                    }
                    @if (esAutor() || auth.esAdmin()) {
                      <button class="btn btn-sm btn-outline-danger" type="button" (click)="eliminarTema()"><i class="bi bi-trash me-1"></i>Eliminar</button>
                    }
                    @if (auth.puedeModerar()) {
                      @if (p.estado === 'ACTIVO') {
                        <button class="btn btn-sm btn-warning" type="button" (click)="banearTema()"><i class="bi bi-slash-circle me-1"></i>Banear tema</button>
                      } @else {
                        <button class="btn btn-sm btn-success" type="button" (click)="reactivarTema()"><i class="bi bi-arrow-counterclockwise me-1"></i>Reactivar</button>
                      }
                    }
                  </div>
                }
              </article>

              <!-- Comentarios -->
              <h2 class="h5 mb-3"><i class="bi bi-chat-dots me-2"></i>Comentarios ({{ comentarios().length }})</h2>

              @for (c of comentarios(); track c.id) {
                <div class="card mb-2 comentario" [class.border-danger]="c.estado === 'BANEADO'">
                  <div class="card-body py-3">
                    <div class="d-flex flex-wrap align-items-center gap-2 small mb-1">
                      <span class="avatar avatar-sm">{{ c.autor.charAt(0) }}</span>
                      <strong>{{ c.autor }}</strong>
                      <span class="text-body-secondary">· {{ c.fechaCreacion | date: 'd MMM y, HH:mm' }}</span>
                      @if (c.estado === 'BANEADO') { <span class="badge text-bg-danger">Baneado: {{ c.motivoBaneo }}</span> }
                      <div class="ms-auto d-flex gap-1">
                        @if (auth.puedeModerar()) {
                          @if (c.estado === 'ACTIVO') {
                            <button class="btn btn-sm btn-link text-warning p-0" type="button" title="Banear comentario" aria-label="Banear comentario" (click)="banearComentario(c.id)"><i class="bi bi-slash-circle"></i></button>
                          } @else {
                            <button class="btn btn-sm btn-link text-success p-0" type="button" title="Reactivar comentario" aria-label="Reactivar comentario" (click)="foro.moderarComentario(c.id, 'ACTIVO')"><i class="bi bi-arrow-counterclockwise"></i></button>
                          }
                        }
                        @if (c.idUsuario === auth.usuarioActual()?.id || auth.esAdmin()) {
                          <button class="btn btn-sm btn-link text-danger p-0 ms-2" type="button" title="Eliminar comentario" aria-label="Eliminar comentario" (click)="eliminarComentario(c.id)"><i class="bi bi-trash"></i></button>
                        }
                      </div>
                    </div>
                    <p class="mb-0">{{ c.contenido }}</p>
                  </div>
                </div>
              } @empty {
                <p class="text-body-secondary">Aún no hay comentarios. ¡Sé el primero en opinar!</p>
              }

              <!-- Nuevo comentario -->
              @if (p.estado === 'ACTIVO') {
                @if (auth.autenticado()) {
                  <form class="card shadow-sm mt-3" [formGroup]="form" (ngSubmit)="comentar()" novalidate>
                    <div class="card-body">
                      <label for="comentario" class="form-label fw-semibold">Escribe un comentario</label>
                      <textarea id="comentario" class="form-control" rows="3" formControlName="contenido" required minlength="2" maxlength="1000"
                        placeholder="Aporta a la conversación con respeto"
                        [class.is-invalid]="form.controls.contenido.invalid && form.controls.contenido.touched"></textarea>
                      <div class="d-flex justify-content-between">
                        <app-error-campo [control]="form.controls.contenido" etiqueta="El comentario" />
                        <small class="text-body-secondary ms-auto">{{ largo() }}/1000</small>
                      </div>
                      <div class="text-end mt-2">
                        <button class="btn btn-primario" type="submit"><i class="bi bi-send me-1"></i>Comentar</button>
                      </div>
                    </div>
                  </form>
                } @else {
                  <div class="alert alert-secondary mt-3">
                    <a routerLink="/login" [queryParams]="{ volver: '/temas/' + p.id }">Inicia sesión</a> o
                    <a routerLink="/registro">regístrate</a> para comentar.
                  </div>
                }
              }
            </div>

            <!-- Lateral -->
            <aside class="col-12 col-lg-4">
              <div class="card shadow-sm mb-3">
                <div class="card-body">
                  <h2 class="h6 fw-bold">Sobre el autor</h2>
                  <div class="d-flex align-items-center gap-2">
                    <span class="avatar">{{ p.autor.charAt(0) }}</span>
                    <div>
                      <div class="fw-semibold">{{ p.autor }}</div>
                      <div class="small text-body-secondary">{{ foro.publicacionesDe(p.idUsuario).length | plural: 'tema publicado' : 'temas publicados' }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card shadow-sm">
                <div class="card-body">
                  <h2 class="h6 fw-bold">Más en {{ p.categoria }}</h2>
                  <ul class="list-unstyled mb-0">
                    @for (r of relacionados(); track r.id) {
                      <li class="py-1 border-bottom"><a [routerLink]="['/temas', r.id]" class="small">{{ r.titulo }}</a></li>
                    } @empty {
                      <li class="small text-body-secondary">No hay otros temas en esta categoría.</li>
                    }
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </section>
      }
    } @else {
      <section class="container py-5 text-center">
        <h1 class="h3">Tema no encontrado</h1>
        <a routerLink="/buscar" class="btn btn-primario mt-2">Buscar temas</a>
      </section>
    }
  `,
})
export class DetalleTema implements OnInit {
  /** Parámetro :id de la ruta (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly auth = inject(AuthService);
  protected readonly foro = inject(ForoService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  private readonly confirmacion = inject(ConfirmacionService);

  protected readonly publicacion = computed(() => this.foro.obtener(Number(this.id())));
  protected readonly esAutor = computed(() => this.publicacion()?.idUsuario === this.auth.usuarioActual()?.id);

  protected readonly comentarios = computed(() => {
    const p = this.publicacion();
    return p ? this.foro.comentariosDe(p.id, this.auth.puedeModerar()) : [];
  });

  protected readonly relacionados = computed(() => {
    const p = this.publicacion();
    return p ? this.foro.buscar('', p.idCategoria).filter((r) => r.id !== p.id).slice(0, 5) : [];
  });

  protected readonly form = this.fb.nonNullable.group({
    contenido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000), sinSoloEspacios()]],
  });
  private readonly texto = toSignal(this.form.controls.contenido.valueChanges, { initialValue: '' });
  protected readonly largo = computed(() => this.texto().length);

  ngOnInit(): void {
    this.foro.registrarVista(Number(this.id()));
  }

  protected comentar(): void {
    const p = this.publicacion();
    const u = this.auth.usuarioActual();
    if (!p || !u) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.foro.comentar(p.id, this.form.getRawValue().contenido, u.id);
    this.form.reset();
    this.notificaciones.exito('Tu comentario fue publicado.');
  }

  protected async eliminarTema(): Promise<void> {
    const p = this.publicacion();
    if (!p) return;
    const r = await this.confirmacion.confirmar({
      titulo: 'Eliminar tema',
      mensaje: `¿Eliminar "${p.titulo}" y todos sus comentarios? Esta acción no se puede deshacer.`,
      textoAceptar: 'Eliminar',
    });
    if (r.aceptado) {
      this.foro.eliminarPublicacion(p.id);
      this.notificaciones.exito('El tema fue eliminado.');
      this.router.navigate(['/mis-publicaciones']);
    }
  }

  protected async banearTema(): Promise<void> {
    const p = this.publicacion();
    if (!p) return;
    const r = await this.confirmacion.confirmar({
      titulo: 'Banear tema',
      mensaje: `El tema "${p.titulo}" dejará de ser visible para la comunidad.`,
      textoAceptar: 'Banear',
      claseAceptar: 'btn-warning',
      pedirMotivo: true,
    });
    if (r.aceptado) {
      this.foro.moderarPublicacion(p.id, 'BANEADO', r.motivo);
      this.notificaciones.aviso('El tema fue baneado.', 'Moderación');
    }
  }

  protected reactivarTema(): void {
    const p = this.publicacion();
    if (!p) return;
    this.foro.moderarPublicacion(p.id, 'ACTIVO');
    this.notificaciones.exito('El tema vuelve a estar visible.', 'Moderación');
  }

  protected async banearComentario(id: number): Promise<void> {
    const r = await this.confirmacion.confirmar({
      titulo: 'Banear comentario',
      mensaje: 'El comentario dejará de mostrarse a la comunidad.',
      textoAceptar: 'Banear',
      claseAceptar: 'btn-warning',
      pedirMotivo: true,
    });
    if (r.aceptado) {
      this.foro.moderarComentario(id, 'BANEADO', r.motivo);
      this.notificaciones.aviso('El comentario fue baneado.', 'Moderación');
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
