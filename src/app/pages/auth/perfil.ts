import { DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';

import { ROLES } from '../../core/models/modelos';
import { AuthService } from '../../core/services/auth.service';
import { ForoService } from '../../core/services/foro.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { UsuarioService } from '../../core/services/usuario.service';
import {
  camposIguales,
  correoValido,
  edadMinima,
  nombrePersona,
  passwordSegura,
  sinSoloEspacios,
} from '../../core/validators/validadores';
import { ErrorCampo } from '../../shared/error-campo';
import { RequisitosPassword } from '../../shared/requisitos-password';

@Component({
  selector: 'app-perfil',
  imports: [ReactiveFormsModule, DatePipe, ErrorCampo, RequisitosPassword],
  template: `
    @if (usuario(); as u) {
      <section class="container py-4 py-md-5">
        <div class="row g-4">
          <!-- Resumen del perfil -->
          <aside class="col-12 col-lg-4">
            <div class="card shadow-sm text-center h-100">
              <div class="card-body p-4">
                <span class="avatar avatar-xl mb-3">{{ u.nombre.charAt(0) }}</span>
                <h1 class="h4 mb-1">{{ u.nombre }}</h1>
                <p class="text-body-secondary mb-2">{{ u.email }}</p>
                <span class="badge mb-3" [class]="roles[u.rol].clase">{{ roles[u.rol].nombre }}</span>
                <p class="small text-body-secondary">{{ roles[u.rol].descripcion }}</p>
                @if (u.bio) {
                  <p class="fst-italic">"{{ u.bio }}"</p>
                }
                <div class="row text-center g-2 mt-2">
                  <div class="col-6"><div class="estadistica"><strong>{{ resumen().publicaciones }}</strong><span>Temas</span></div></div>
                  <div class="col-6"><div class="estadistica"><strong>{{ resumen().comentarios }}</strong><span>Comentarios</span></div></div>
                </div>
                <p class="small text-body-secondary mt-3 mb-0">Miembro desde {{ u.fechaCreacion | date: 'longDate' }}</p>
              </div>
            </div>
          </aside>

          <div class="col-12 col-lg-8">
            <!-- Datos personales -->
            <div class="card shadow-sm mb-4">
              <div class="card-header bg-transparent"><h2 class="h5 mb-0"><i class="bi bi-person-gear me-2"></i>Modificar perfil</h2></div>
              <div class="card-body">
                <form [formGroup]="formPerfil" (ngSubmit)="guardarPerfil()" novalidate>
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label for="nombre" class="form-label">Nombre completo</label>
                      <input id="nombre" class="form-control" formControlName="nombre" required minlength="3" maxlength="100"
                        [class.is-invalid]="formPerfil.controls.nombre.invalid && formPerfil.controls.nombre.touched" />
                      <app-error-campo [control]="formPerfil.controls.nombre" etiqueta="El nombre" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label for="email" class="form-label">Correo electrónico</label>
                      <input id="email" type="email" class="form-control" formControlName="email" required maxlength="150"
                        [class.is-invalid]="formPerfil.controls.email.invalid && formPerfil.controls.email.touched" />
                      <app-error-campo [control]="formPerfil.controls.email" etiqueta="El correo" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label for="ciudad" class="form-label">Ciudad</label>
                      <input id="ciudad" class="form-control" formControlName="ciudad" maxlength="60"
                        [class.is-invalid]="formPerfil.controls.ciudad.invalid && formPerfil.controls.ciudad.touched" />
                      <app-error-campo [control]="formPerfil.controls.ciudad" etiqueta="La ciudad" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label for="fecha" class="form-label">Fecha de nacimiento</label>
                      <input id="fecha" type="date" class="form-control" formControlName="fechaNacimiento" [attr.max]="hoy"
                        [class.is-invalid]="formPerfil.controls.fechaNacimiento.invalid && formPerfil.controls.fechaNacimiento.touched" />
                      <app-error-campo [control]="formPerfil.controls.fechaNacimiento" etiqueta="La fecha" />
                    </div>
                    <div class="col-12">
                      <label for="bio" class="form-label">Sobre mí</label>
                      <textarea id="bio" class="form-control" rows="3" formControlName="bio" maxlength="250"
                        placeholder="Cuéntale a la comunidad sobre ti"
                        [class.is-invalid]="formPerfil.controls.bio.invalid && formPerfil.controls.bio.touched"></textarea>
                      <div class="d-flex justify-content-between">
                        <app-error-campo [control]="formPerfil.controls.bio" etiqueta="La descripción" />
                        <small class="text-body-secondary ms-auto">{{ largoBio() }}/250</small>
                      </div>
                    </div>
                  </div>
                  <div class="d-flex flex-wrap gap-2 justify-content-end mt-4">
                    <button type="button" class="btn btn-outline-secondary" (click)="cargarPerfil()" [disabled]="formPerfil.pristine">Descartar cambios</button>
                    <button type="submit" class="btn btn-primario" [disabled]="formPerfil.pristine"><i class="bi bi-save me-1"></i>Guardar cambios</button>
                  </div>
                </form>
              </div>
            </div>

            <!-- Cambio de contraseña -->
            <div class="card shadow-sm">
              <div class="card-header bg-transparent"><h2 class="h5 mb-0"><i class="bi bi-shield-lock me-2"></i>Cambiar contraseña</h2></div>
              <div class="card-body">
                <form [formGroup]="formPassword" (ngSubmit)="cambiarPassword()" novalidate>
                  <div class="row g-3">
                    <div class="col-12">
                      <label for="actual" class="form-label">Contraseña actual</label>
                      <input id="actual" type="password" class="form-control" formControlName="actual" required maxlength="20"
                        autocomplete="current-password"
                        [class.is-invalid]="formPassword.controls.actual.invalid && formPassword.controls.actual.touched" />
                      <app-error-campo [control]="formPassword.controls.actual" etiqueta="La contraseña actual" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label for="nueva" class="form-label">Nueva contraseña</label>
                      <input id="nueva" type="password" class="form-control" formControlName="nueva" required minlength="8"
                        maxlength="20" autocomplete="new-password"
                        [class.is-invalid]="formPassword.controls.nueva.invalid && formPassword.controls.nueva.touched" />
                      <app-error-campo [control]="formPassword.controls.nueva" etiqueta="La nueva contraseña" />
                    </div>
                    <div class="col-12 col-md-6">
                      <label for="confirmacion" class="form-label">Confirmar nueva contraseña</label>
                      <input id="confirmacion" type="password" class="form-control" formControlName="confirmacion" required
                        maxlength="20" autocomplete="new-password"
                        [class.is-invalid]="formPassword.controls.confirmacion.touched && (formPassword.controls.confirmacion.invalid || formPassword.errors?.['noCoinciden'])" />
                      <app-error-campo [control]="formPassword.controls.confirmacion" etiqueta="La confirmación" />
                      @if (formPassword.errors?.['noCoinciden'] && formPassword.controls.confirmacion.touched) {
                        <div class="invalid-feedback d-block">Las contraseñas no coinciden.</div>
                      }
                    </div>
                    <div class="col-12"><app-requisitos-password [valor]="nuevaPassword()" /></div>
                  </div>
                  <div class="text-end mt-3">
                    <button type="submit" class="btn btn-primario"><i class="bi bi-key me-1"></i>Actualizar contraseña</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    }
  `,
})
export class Perfil implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly usuarios = inject(UsuarioService);
  private readonly foro = inject(ForoService);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly roles = ROLES;
  protected readonly usuario = this.auth.usuarioActual;
  protected readonly hoy = new Date().toISOString().slice(0, 10);

  protected readonly resumen = computed(() => {
    const id = this.usuario()?.id ?? 0;
    return {
      publicaciones: this.foro.publicacionesDe(id).length,
      comentarios: this.foro.comentarios().filter((c) => c.idUsuario === id).length,
    };
  });

  protected readonly formPerfil = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), sinSoloEspacios(), nombrePersona()]],
    email: ['', [Validators.required, Validators.email, correoValido(), Validators.maxLength(150), this.emailDisponible()]],
    ciudad: ['', [Validators.maxLength(60), nombrePersona()]],
    fechaNacimiento: ['', [edadMinima(13)]],
    bio: ['', [Validators.maxLength(250), sinSoloEspacios()]],
  });

  protected readonly formPassword = this.fb.nonNullable.group(
    {
      actual: ['', [Validators.required]],
      nueva: ['', [Validators.required, passwordSegura()]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: camposIguales('nueva', 'confirmacion') },
  );

  private readonly bio = toSignal(this.formPerfil.controls.bio.valueChanges, { initialValue: '' });
  protected readonly largoBio = computed(() => (this.bio() ?? '').length);
  protected readonly nuevaPassword = toSignal(this.formPassword.controls.nueva.valueChanges, { initialValue: '' });

  ngOnInit(): void {
    this.cargarPerfil();
  }

  protected cargarPerfil(): void {
    const u = this.usuario();
    if (!u) {
      return;
    }
    this.formPerfil.reset({
      nombre: u.nombre,
      email: u.email,
      ciudad: u.ciudad ?? '',
      fechaNacimiento: u.fechaNacimiento ?? '',
      bio: u.bio ?? '',
    });
  }

  protected guardarPerfil(): void {
    const u = this.usuario();
    if (!u) {
      return;
    }
    if (this.formPerfil.invalid) {
      this.formPerfil.markAllAsTouched();
      return;
    }
    const datos = this.formPerfil.getRawValue();
    this.usuarios.actualizarPerfil(u.id, {
      nombre: datos.nombre.trim(),
      email: datos.email,
      ciudad: datos.ciudad.trim() || undefined,
      fechaNacimiento: datos.fechaNacimiento || undefined,
      bio: datos.bio.trim() || undefined,
    });
    this.cargarPerfil();
    this.notificaciones.exito('Tus datos fueron actualizados.', 'Perfil guardado');
  }

  protected cambiarPassword(): void {
    const u = this.usuario();
    if (!u) {
      return;
    }
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    const { actual, nueva } = this.formPassword.getRawValue();
    if (actual !== u.password) {
      this.formPassword.controls.actual.setErrors({ incorrecta: true });
      this.notificaciones.error('La contraseña actual no es correcta.');
      return;
    }
    if (actual === nueva) {
      this.notificaciones.aviso('La nueva contraseña debe ser distinta de la actual.');
      return;
    }
    this.usuarios.cambiarPassword(u.id, nueva);
    this.formPassword.reset();
    this.notificaciones.exito('Tu contraseña fue actualizada.', 'Contraseña cambiada');
  }

  private emailDisponible() {
    return (control: AbstractControl): ValidationErrors | null =>
      control.value && this.usuarios.existeEmail(control.value, this.usuario()?.id) ? { emailDuplicado: true } : null;
  }
}
