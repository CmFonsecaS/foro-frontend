import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
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
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo, RequisitosPassword],
  template: `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8 col-xl-7">
          <div class="card shadow-sm tarjeta-auth">
            <div class="card-body p-4 p-md-5">
              <div class="text-center mb-4">
                <img src="logo.svg" alt="Logo de Ágora" width="56" height="56" class="mb-2" />
                <h1 class="h3 fw-bold">Crear cuenta</h1>
                <p class="text-body-secondary mb-0">Únete a la comunidad y participa en los foros</p>
              </div>

              <form [formGroup]="form" (ngSubmit)="registrar()" novalidate>
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label for="nombre" class="form-label">Nombre completo</label>
                    <input id="nombre" class="form-control" formControlName="nombre" autocomplete="name"
                      required minlength="3" maxlength="100" placeholder="Ej.: María López"
                      [class.is-invalid]="invalido('nombre')" />
                    <app-error-campo [control]="form.controls.nombre" etiqueta="El nombre" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="email" class="form-label">Correo electrónico</label>
                    <input id="email" type="email" class="form-control" formControlName="email" autocomplete="email"
                      required maxlength="150" placeholder="nombre@dominio.cl"
                      [class.is-invalid]="invalido('email')" />
                    <app-error-campo [control]="form.controls.email" etiqueta="El correo" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="fechaNacimiento" class="form-label">Fecha de nacimiento</label>
                    <input id="fechaNacimiento" type="date" class="form-control" formControlName="fechaNacimiento"
                      required [attr.max]="hoy" [class.is-invalid]="invalido('fechaNacimiento')" />
                    <app-error-campo [control]="form.controls.fechaNacimiento" etiqueta="La fecha de nacimiento" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="ciudad" class="form-label">Ciudad <span class="text-body-secondary">(opcional)</span></label>
                    <input id="ciudad" class="form-control" formControlName="ciudad" maxlength="60"
                      placeholder="Ej.: Santiago" [class.is-invalid]="invalido('ciudad')" />
                    <app-error-campo [control]="form.controls.ciudad" etiqueta="La ciudad" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="password" class="form-label">Contraseña</label>
                    <div class="input-group has-validation">
                      <input id="password" class="form-control" formControlName="password" autocomplete="new-password"
                        required minlength="8" maxlength="20" [type]="verPassword() ? 'text' : 'password'"
                        [class.is-invalid]="invalido('password')" />
                      <button class="btn btn-outline-secondary" type="button" (click)="verPassword.set(!verPassword())"
                        aria-label="Mostrar u ocultar contraseña">
                        <i class="bi" [class.bi-eye]="!verPassword()" [class.bi-eye-slash]="verPassword()"></i>
                      </button>
                    </div>
                    <app-error-campo [control]="form.controls.password" etiqueta="La contraseña" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label for="confirmacion" class="form-label">Confirmar contraseña</label>
                    <input id="confirmacion" class="form-control" formControlName="confirmacion" autocomplete="new-password"
                      required maxlength="20" [type]="verPassword() ? 'text' : 'password'"
                      [class.is-invalid]="invalido('confirmacion') || (form.errors?.['noCoinciden'] && form.controls.confirmacion.touched)" />
                    <app-error-campo [control]="form.controls.confirmacion" etiqueta="La confirmación" />
                    @if (form.errors?.['noCoinciden'] && form.controls.confirmacion.touched) {
                      <div class="invalid-feedback d-block"><i class="bi bi-exclamation-circle me-1"></i>Las contraseñas no coinciden.</div>
                    }
                  </div>

                  <div class="col-12">
                    <app-requisitos-password [valor]="password()" />
                  </div>

                  <div class="col-12">
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" id="terminos" formControlName="terminos" required
                        [class.is-invalid]="invalido('terminos')" />
                      <label class="form-check-label" for="terminos">
                        Acepto las <a routerLink="/normas" target="_blank">normas de la comunidad</a>
                      </label>
                      @if (invalido('terminos')) {
                        <div class="invalid-feedback d-block"><i class="bi bi-exclamation-circle me-1"></i>Debes aceptar las normas para continuar.</div>
                      }
                    </div>
                  </div>

                  <div class="col-12">
                    <button type="submit" class="btn btn-primario w-100 py-2" [disabled]="enviando()">
                      <i class="bi bi-person-plus me-1"></i>Crear cuenta
                    </button>
                  </div>
                </div>
              </form>

              <p class="text-center mt-4 mb-0">¿Ya tienes cuenta? <a routerLink="/login" class="fw-semibold">Inicia sesión</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  private readonly usuarios = inject(UsuarioService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly verPassword = signal(false);
  protected readonly enviando = signal(false);
  protected readonly hoy = new Date().toISOString().slice(0, 10);

  protected readonly form = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), sinSoloEspacios(), nombrePersona()]],
      email: ['', [Validators.required, Validators.email, correoValido(), Validators.maxLength(150), this.emailDisponible()]],
      fechaNacimiento: ['', [Validators.required, edadMinima(13)]],
      ciudad: ['', [Validators.maxLength(60), nombrePersona()]],
      password: ['', [Validators.required, passwordSegura()]],
      confirmacion: ['', [Validators.required]],
      terminos: [false, [Validators.requiredTrue]],
    },
    { validators: camposIguales('password', 'confirmacion') },
  );

  protected readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  protected invalido(campo: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[campo];
    return c.invalid && c.touched;
  }

  protected registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notificaciones.aviso('Revisa los campos marcados en rojo.');
      return;
    }
    this.enviando.set(true);
    const datos = this.form.getRawValue();

    const usuario = this.usuarios.registrar({
      nombre: datos.nombre,
      email: datos.email,
      password: datos.password,
      fechaNacimiento: datos.fechaNacimiento,
      ciudad: datos.ciudad.trim() || undefined,
    });

    this.auth.login(usuario.email, datos.password);
    this.notificaciones.exito('Tu cuenta fue creada con el rol Usuario.', '¡Bienvenido a Ágora!');
    this.router.navigate(['/']);
  }

  // Validador: el correo no debe existir en la colección de usuarios
  private emailDisponible() {
    return (control: AbstractControl): ValidationErrors | null =>
      control.value && this.usuarios.existeEmail(control.value) ? { emailDuplicado: true } : null;
  }
}
