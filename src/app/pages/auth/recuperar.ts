import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { camposIguales, correoValido, passwordSegura } from '../../core/validators/validadores';
import { ErrorCampo } from '../../shared/error-campo';
import { RequisitosPassword } from '../../shared/requisitos-password';

/**
 * Recuperar contraseña en 3 pasos (simulado sin servidor de correo):
 * 1. Ingresar el correo  2. Ingresar el código de 6 dígitos  3. Definir una nueva contraseña
 */
@Component({
  selector: 'app-recuperar',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo, RequisitosPassword],
  template: `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-6">
          <div class="card shadow-sm tarjeta-auth">
            <div class="card-body p-4 p-md-5">
              <div class="text-center mb-4">
                <span class="icono-circular mb-2"><i class="bi bi-key"></i></span>
                <h1 class="h3 fw-bold">Recuperar contraseña</h1>
                <p class="text-body-secondary mb-0">Te ayudamos a volver a tu cuenta en tres pasos</p>
              </div>

              <ol class="pasos list-unstyled d-flex justify-content-between mb-4" aria-label="Progreso">
                @for (n of [1, 2, 3]; track n) {
                  <li class="paso" [class.activo]="paso() >= n">
                    <span class="numero">{{ n }}</span>
                    <span class="d-none d-sm-inline small">{{ ['Correo', 'Código', 'Nueva contraseña'][n - 1] }}</span>
                  </li>
                }
              </ol>

              @switch (paso()) {
                @case (1) {
                  <form [formGroup]="formCorreo" (ngSubmit)="enviarCodigo()" novalidate>
                    <label for="email" class="form-label">Correo electrónico de tu cuenta</label>
                    <input id="email" type="email" class="form-control" formControlName="email" required maxlength="150"
                      placeholder="nombre@dominio.cl"
                      [class.is-invalid]="formCorreo.controls.email.invalid && formCorreo.controls.email.touched" />
                    <app-error-campo [control]="formCorreo.controls.email" etiqueta="El correo" />
                    <button type="submit" class="btn btn-primario w-100 mt-4"><i class="bi bi-send me-1"></i>Enviar código</button>
                  </form>
                }
                @case (2) {
                  <div class="alert alert-info small">
                    <i class="bi bi-envelope-open me-1"></i>
                    Enviamos un código de 6 dígitos a <strong>{{ email() }}</strong>.
                    <br /><span class="text-body-secondary">Simulación: tu código es <strong class="font-monospace">{{ codigoSimulado() }}</strong></span>
                  </div>
                  <form [formGroup]="formCodigo" (ngSubmit)="validarCodigo()" novalidate>
                    <label for="codigo" class="form-label">Código de verificación</label>
                    <input id="codigo" class="form-control text-center fs-4 font-monospace letra-espaciada" formControlName="codigo"
                      inputmode="numeric" autocomplete="one-time-code" required minlength="6" maxlength="6" pattern="[0-9]{6}"
                      placeholder="000000"
                      [class.is-invalid]="formCodigo.controls.codigo.invalid && formCodigo.controls.codigo.touched" />
                    <app-error-campo [control]="formCodigo.controls.codigo" etiqueta="El código" />
                    <div class="d-flex gap-2 mt-4">
                      <button type="button" class="btn btn-outline-secondary" (click)="paso.set(1)">Volver</button>
                      <button type="submit" class="btn btn-primario flex-grow-1">Verificar código</button>
                    </div>
                  </form>
                }
                @case (3) {
                  <form [formGroup]="formPassword" (ngSubmit)="cambiarPassword()" novalidate>
                    <div class="mb-3">
                      <label for="nueva" class="form-label">Nueva contraseña</label>
                      <input id="nueva" type="password" class="form-control" formControlName="password" required
                        minlength="8" maxlength="20" autocomplete="new-password"
                        [class.is-invalid]="formPassword.controls.password.invalid && formPassword.controls.password.touched" />
                      <app-error-campo [control]="formPassword.controls.password" etiqueta="La contraseña" />
                      <app-requisitos-password [valor]="nuevaPassword()" />
                    </div>
                    <div class="mb-3">
                      <label for="confirmar" class="form-label">Confirmar nueva contraseña</label>
                      <input id="confirmar" type="password" class="form-control" formControlName="confirmacion" required
                        maxlength="20" autocomplete="new-password"
                        [class.is-invalid]="formPassword.controls.confirmacion.touched && (formPassword.controls.confirmacion.invalid || formPassword.errors?.['noCoinciden'])" />
                      <app-error-campo [control]="formPassword.controls.confirmacion" etiqueta="La confirmación" />
                      @if (formPassword.errors?.['noCoinciden'] && formPassword.controls.confirmacion.touched) {
                        <div class="invalid-feedback d-block">Las contraseñas no coinciden.</div>
                      }
                    </div>
                    <button type="submit" class="btn btn-primario w-100"><i class="bi bi-check2-circle me-1"></i>Guardar nueva contraseña</button>
                  </form>
                }
              }

              <p class="text-center mt-4 mb-0"><a routerLink="/login"><i class="bi bi-arrow-left me-1"></i>Volver a iniciar sesión</a></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Recuperar {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly paso = signal(1);
  protected readonly email = signal('');
  protected readonly codigoSimulado = signal('');

  protected readonly formCorreo = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, correoValido(), Validators.maxLength(150)]],
  });

  protected readonly formCodigo = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected readonly formPassword = this.fb.nonNullable.group(
    {
      password: ['', [Validators.required, passwordSegura()]],
      confirmacion: ['', [Validators.required]],
    },
    { validators: camposIguales('password', 'confirmacion') },
  );

  protected readonly nuevaPassword = toSignal(this.formPassword.controls.password.valueChanges, { initialValue: '' });

  protected enviarCodigo(): void {
    if (this.formCorreo.invalid) {
      this.formCorreo.markAllAsTouched();
      return;
    }
    const email = this.formCorreo.getRawValue().email.trim().toLowerCase();
    const codigo = this.auth.solicitarCodigo(email);
    if (!codigo) {
      this.notificaciones.error('No existe una cuenta asociada a ese correo.');
      return;
    }
    this.email.set(email);
    this.codigoSimulado.set(codigo);
    this.formCodigo.reset();
    this.paso.set(2);
    this.notificaciones.info('Revisa tu bandeja de entrada (simulación).', 'Código enviado');
  }

  protected validarCodigo(): void {
    if (this.formCodigo.invalid) {
      this.formCodigo.markAllAsTouched();
      return;
    }
    if (this.formCodigo.getRawValue().codigo !== this.codigoSimulado()) {
      this.notificaciones.error('El código ingresado no es correcto.');
      return;
    }
    this.paso.set(3);
  }

  protected cambiarPassword(): void {
    if (this.formPassword.invalid) {
      this.formPassword.markAllAsTouched();
      return;
    }
    const resultado = this.auth.restablecerPassword(
      this.email(),
      this.formCodigo.getRawValue().codigo,
      this.formPassword.getRawValue().password,
    );
    if (resultado !== 'ok') {
      this.notificaciones.error(resultado === 'expirado' ? 'El código expiró, solicita uno nuevo.' : 'Código no válido.');
      this.paso.set(1);
      return;
    }
    this.notificaciones.exito('Ya puedes iniciar sesión con tu nueva contraseña.', 'Contraseña actualizada');
    this.router.navigate(['/login']);
  }
}
