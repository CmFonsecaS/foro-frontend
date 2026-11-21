import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { PluralPipe } from '../../shared/plural.pipe';
import { Categoria } from '../../core/models/modelos';
import { CategoriaService } from '../../core/services/categoria.service';
import { ForoService } from '../../core/services/foro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { sinSoloEspacios } from '../../core/validators/validadores';
import { ConfirmacionService } from '../../shared/confirmacion.service';
import { ErrorCampo } from '../../shared/error-campo';

/**
 * CRUD de categorías (ADMIN). Equivale a /api/categorias de administracion-service.
 */
@Component({
  selector: 'app-admin-categorias',
  imports: [PluralPipe, ReactiveFormsModule, ErrorCampo],
  template: `
    <div class="row g-4">
      <div class="col-12 col-lg-5 order-lg-2">
        <form class="card shadow-sm" [formGroup]="form" (ngSubmit)="guardar()" novalidate>
          <div class="card-header bg-transparent fw-semibold">{{ editando() ? 'Editar categoría' : 'Nueva categoría' }}</div>
          <div class="card-body">
            <div class="mb-3">
              <label for="nombreCat" class="form-label">Nombre</label>
              <input id="nombreCat" class="form-control" formControlName="nombre" required minlength="3" maxlength="100"
                [class.is-invalid]="form.controls.nombre.invalid && form.controls.nombre.touched" />
              <app-error-campo [control]="form.controls.nombre" etiqueta="El nombre" />
            </div>
            <div class="mb-3">
              <label for="descripcionCat" class="form-label">Descripción</label>
              <textarea id="descripcionCat" class="form-control" rows="3" formControlName="descripcion" required minlength="10" maxlength="255"
                [class.is-invalid]="form.controls.descripcion.invalid && form.controls.descripcion.touched"></textarea>
              <app-error-campo [control]="form.controls.descripcion" etiqueta="La descripción" />
            </div>
            <div class="row g-2">
              <div class="col-8">
                <label for="iconoCat" class="form-label">Ícono</label>
                <select id="iconoCat" class="form-select" formControlName="icono" required>
                  @for (i of iconos; track i.clase) { <option [value]="i.clase">{{ i.nombre }}</option> }
                </select>
              </div>
              <div class="col-4">
                <label for="colorCat" class="form-label">Color</label>
                <input id="colorCat" type="color" class="form-control form-control-color w-100" formControlName="color" required />
              </div>
            </div>
            <div class="mt-3 p-2 rounded border d-flex align-items-center gap-2" [style.--color-cat]="form.controls.color.value">
              <span class="icono-categoria"><i class="bi" [class]="form.controls.icono.value"></i></span>
              <span class="fw-semibold">{{ form.controls.nombre.value || 'Vista previa' }}</span>
            </div>
          </div>
          <div class="card-footer bg-transparent d-flex gap-2 justify-content-end">
            @if (editando()) {
              <button type="button" class="btn btn-outline-secondary" (click)="cancelar()">Cancelar</button>
            }
            <button type="submit" class="btn btn-primario"><i class="bi bi-save me-1"></i>{{ editando() ? 'Guardar' : 'Crear' }}</button>
          </div>
        </form>
      </div>

      <div class="col-12 col-lg-7 order-lg-1">
        <div class="list-group shadow-sm">
          @for (c of categorias.categorias(); track c.id) {
            <div class="list-group-item d-flex align-items-center gap-3 py-3" [style.--color-cat]="c.color">
              <span class="icono-categoria"><i class="bi" [class]="c.icono"></i></span>
              <div class="flex-grow-1" style="min-width: 0">
                <div class="fw-semibold">{{ c.nombre }} <span class="badge text-bg-light border">{{ foro.contarPorCategoria(c.id) | plural: 'tema' : 'temas' }}</span></div>
                <div class="small text-body-secondary text-truncate">{{ c.descripcion }}</div>
              </div>
              <button class="btn btn-sm btn-outline-primary" type="button" aria-label="Editar" (click)="editar(c)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-sm btn-outline-danger" type="button" aria-label="Eliminar" (click)="eliminar(c)"><i class="bi bi-trash"></i></button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class AdminCategorias {
  protected readonly categorias = inject(CategoriaService);
  protected readonly foro = inject(ForoService);
  private readonly fb = inject(FormBuilder);
  private readonly confirmacion = inject(ConfirmacionService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly editando = signal<number | null>(null);

  protected readonly iconos = [
    { clase: 'bi-cpu', nombre: 'Procesador' },
    { clase: 'bi-code-slash', nombre: 'Código' },
    { clase: 'bi-controller', nombre: 'Control de juego' },
    { clase: 'bi-mortarboard', nombre: 'Educación' },
    { clase: 'bi-rocket-takeoff', nombre: 'Cohete' },
    { clase: 'bi-film', nombre: 'Película' },
    { clase: 'bi-music-note-beamed', nombre: 'Música' },
    { clase: 'bi-trophy', nombre: 'Deportes' },
    { clase: 'bi-book', nombre: 'Libros' },
    { clase: 'bi-chat-heart', nombre: 'Comunidad' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), sinSoloEspacios(), this.nombreUnico()]],
    descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255), sinSoloEspacios()]],
    icono: ['bi-chat-heart', [Validators.required]],
    color: ['#1f3a5f', [Validators.required, Validators.pattern(/^#[0-9a-fA-F]{6}$/)]],
  });

  protected editar(c: Categoria): void {
    this.editando.set(c.id);
    this.form.reset({ nombre: c.nombre, descripcion: c.descripcion, icono: c.icono, color: c.color });
  }

  protected cancelar(): void {
    this.editando.set(null);
    this.form.reset();
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const datos = this.form.getRawValue();
    const id = this.editando();
    if (id) {
      this.categorias.actualizar(id, datos);
      this.notificaciones.exito('Categoría actualizada.');
    } else {
      this.categorias.crear(datos);
      this.notificaciones.exito('Categoría creada.');
    }
    this.cancelar();
  }

  protected async eliminar(c: Categoria): Promise<void> {
    if (this.foro.tienePublicaciones(c.id)) {
      this.notificaciones.aviso('La categoría tiene temas asociados y no puede eliminarse.', 'No se puede eliminar');
      return;
    }
    const r = await this.confirmacion.confirmar({
      titulo: 'Eliminar categoría',
      mensaje: `¿Eliminar la categoría "${c.nombre}"?`,
      textoAceptar: 'Eliminar',
    });
    if (r.aceptado) {
      this.categorias.eliminar(c.id);
      this.notificaciones.exito('Categoría eliminada.');
    }
  }

  private nombreUnico() {
    return (control: AbstractControl): ValidationErrors | null =>
      control.value && this.categorias.existeNombre(control.value, this.editando() ?? undefined) ? { nombreDuplicado: true } : null;
  }
}
