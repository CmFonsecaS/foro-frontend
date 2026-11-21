import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { ForoService } from '../../core/services/foro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { convertirEtiquetas, etiquetasValidas, sinSoloEspacios } from '../../core/validators/validadores';
import { ErrorCampo } from '../../shared/error-campo';

/**
 * Formulario para publicar un tema nuevo o editar uno propio.
 */
@Component({
  selector: 'app-form-tema',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  template: `
    <section class="container py-4 py-md-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-9 col-xl-8">
          <h1 class="h3 fw-bold mb-1">{{ edicion() ? 'Editar tema' : 'Publicar un nuevo tema' }}</h1>
          <p class="text-body-secondary">Recuerda respetar las <a routerLink="/normas">normas del foro</a>.</p>

          <form class="card shadow-sm" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
            <div class="card-body p-4">
              <div class="row g-3">
                <div class="col-12 col-md-8">
                  <label for="titulo" class="form-label">Título</label>
                  <input id="titulo" class="form-control" formControlName="titulo" required minlength="5" maxlength="200"
                    placeholder="Resume tu tema en una frase"
                    [class.is-invalid]="form.controls.titulo.invalid && form.controls.titulo.touched" />
                  <app-error-campo [control]="form.controls.titulo" etiqueta="El título" />
                </div>
                <div class="col-12 col-md-4">
                  <label for="categoria" class="form-label">Categoría</label>
                  <select id="categoria" class="form-select" formControlName="idCategoria" required
                    [class.is-invalid]="form.controls.idCategoria.invalid && form.controls.idCategoria.touched">
                    <option [ngValue]="null" disabled>Selecciona...</option>
                    @for (c of categorias.categorias(); track c.id) {
                      <option [ngValue]="c.id">{{ c.nombre }}</option>
                    }
                  </select>
                  <app-error-campo [control]="form.controls.idCategoria" etiqueta="La categoría" />
                </div>
                <div class="col-12">
                  <label for="contenido" class="form-label">Contenido</label>
                  <textarea id="contenido" class="form-control" rows="8" formControlName="contenido" required minlength="20" maxlength="4000"
                    placeholder="Desarrolla tu tema: contexto, preguntas, enlaces de referencia..."
                    [class.is-invalid]="form.controls.contenido.invalid && form.controls.contenido.touched"></textarea>
                  <div class="d-flex justify-content-between">
                    <app-error-campo [control]="form.controls.contenido" etiqueta="El contenido" />
                    <small class="text-body-secondary ms-auto">{{ largo() }}/4000</small>
                  </div>
                </div>
                <div class="col-12">
                  <label for="etiquetas" class="form-label">Etiquetas <span class="text-body-secondary">(opcional, separadas por coma)</span></label>
                  <input id="etiquetas" class="form-control" formControlName="etiquetas" maxlength="120" placeholder="java, spring-boot, docker"
                    [class.is-invalid]="form.controls.etiquetas.invalid && form.controls.etiquetas.touched" />
                  <app-error-campo [control]="form.controls.etiquetas" etiqueta="Las etiquetas" />
                </div>
              </div>
            </div>
            <div class="card-footer bg-transparent d-flex flex-wrap gap-2 justify-content-end">
              <button type="button" class="btn btn-outline-secondary" (click)="cancelar()">Cancelar</button>
              <button type="submit" class="btn btn-primario"><i class="bi me-1" [class]="edicion() ? 'bi-save' : 'bi-send'"></i>{{ edicion() ? 'Guardar cambios' : 'Publicar tema' }}</button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
})
export class FormTema implements OnInit {
  /** Presente solo al editar (/temas/:id/editar). */
  readonly id = input<string>();

  protected readonly categorias = inject(CategoriaService);
  private readonly foro = inject(ForoService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly edicion = signal(false);

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200), sinSoloEspacios()]],
    idCategoria: [null as number | null, [Validators.required]],
    contenido: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(4000), sinSoloEspacios()]],
    etiquetas: ['', [Validators.maxLength(120), etiquetasValidas()]],
  });

  private readonly contenido = toSignal(this.form.controls.contenido.valueChanges, { initialValue: '' });
  protected readonly largo = computed(() => (this.contenido() ?? '').length);

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      const p = this.foro.obtener(Number(id));
      if (!p || p.idUsuario !== this.auth.usuarioActual()?.id || p.estado !== 'ACTIVO') {
        this.notificaciones.error('Solo puedes editar tus propios temas activos.');
        this.router.navigate(['/mis-publicaciones']);
        return;
      }
      this.edicion.set(true);
      this.form.setValue({
        titulo: p.titulo,
        idCategoria: p.idCategoria,
        contenido: p.contenido,
        etiquetas: p.etiquetas.join(', '),
      });
    } else {
      const categoria = Number(this.route.snapshot.queryParamMap.get('categoria'));
      if (categoria && this.categorias.buscarPorId(categoria)) {
        this.form.controls.idCategoria.setValue(categoria);
      }
    }
  }

  protected guardar(): void {
    const usuario = this.auth.usuarioActual();
    if (!usuario) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificaciones.aviso('Revisa los campos marcados en rojo.');
      return;
    }
    const v = this.form.getRawValue();
    const datos = {
      titulo: v.titulo ?? '',
      contenido: v.contenido ?? '',
      idCategoria: v.idCategoria as number,
      etiquetas: convertirEtiquetas(v.etiquetas ?? ''),
    };

    if (this.edicion()) {
      const id = Number(this.id());
      this.foro.editar(id, datos);
      this.notificaciones.exito('Los cambios del tema fueron guardados.');
      this.router.navigate(['/temas', id]);
    } else {
      const nuevo = this.foro.publicar(datos, usuario.id);
      this.notificaciones.exito('Tu tema ya está disponible en el foro.', 'Tema publicado');
      this.router.navigate(['/temas', nuevo.id]);
    }
  }

  protected cancelar(): void {
    history.length > 1 ? history.back() : this.router.navigate(['/']);
  }
}
