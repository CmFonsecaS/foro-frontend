import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { PASSWORD_DEMO } from '../../core/data/datos-iniciales';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { correoValido } from '../../core/validators/validadores';
import { ErrorCampo } from '../../shared/error-campo';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ErrorCampo],
  template: `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-10 col-md-8 col-lg-5">
          <div class="card shadow-sm tarjeta-auth">
            <div class="card-body p-4 p-md-5">
              <div class="text-center mb-4">
                <img src="logo.svg" alt="Logo de Ágora" width="64" height="64" class="mb-2" />
                <h1 class="h3 fw-bold">Iniciar sesión</h1>
                <p class="text-body-secondary mb-0">Bienvenido de vuelta a la comunidad</p>
              </div>

              @if (error()) {
                <div class="alert alert-danger d-flex align-items-center" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ error() }}
                </div>
              }

              <form [formGroup]="form" (ngSubmit)="ingresar()" novalidate>
                <div class="mb-3">
                  <label for="email" class="form-label">Correo electrónico</label>
                  <div class="input-group has-validation">
                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                    <input id="email" type="email" class="form-control" formControlName="email" autocomplete="email"
                      required maxlength="150" placeholder="nombre@dominio.cl"
                      [class.is-invalid]="form.controls.email.invalid && form.controls.email.touched" />
                  </div>
                  <app-error-campo [control]="form.controls.email" etiqueta="El correo" />
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Contraseña</label>
                  <div class="input-group has-validation">
                    <span class="input-group-text"><i class="bi bi-lock"></i></span>
                    <input id="password" class="form-control" formControlName="password" autocomplete="current-password"
                      required maxlength="20" [type]="verPassword() ? 'text' : 'password'"
                      [class.is-invalid]="form.controls.password.invalid && form.controls.password.touched" />
                    <button class="btn btn-outline-secondary" type="button" (click)="verPassword.set(!verPassword())"
                      [attr.aria-label]="verPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                      <i class="bi" [class.bi-eye]="!verPassword()" [class.bi-eye-slash]="verPassword()"></i>
                    </button>
                  </div>
                  <app-error-campo [control]="form.controls.password" etiqueta="La contraseña" />
                </div>

                <div class="d-flex justify-content-between align-items-center mb-4">
                  <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="recordar" formControlName="recordar" />
                    <label class="form-check-label" for="recordar">Recordarme</label>
                  </div>
                  <a routerLink="/recuperar" class="small">¿Olvidaste tu contraseña?</a>
                </div>

                <button type="submit" class="btn btn-primario w-100 py-2">
                  <i class="bi bi-box-arrow-in-right me-1"></i>Ingresar
                </button>
              </form>

              <p class="text-center mt-4 mb-0">
                ¿No tienes cuenta? <a routerLink="/registro" class="fw-semibold">Regístrate</a>
              </p>
            </div>
          </div>

          <div class="card mt-3 border-0 bg-body-tertiary">
            <div class="card-body small">
              <p class="fw-semibold mb-2"><i class="bi bi-info-circle me-1"></i>Cuentas de demostración (contraseña {{ passwordDemo }})</p>
              <div class="d-flex flex-wrap gap-2">
                @for (c of cuentasDemo; track c.email) {
                  <button type="button" class="btn btn-sm btn-outline-secondary" (click)="usarCuenta(c.email)">
                    {{ c.rol }}: {{ c.email }}
                  </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificaciones = inject(NotificacionService);

  protected readonly verPassword = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly passwordDemo = PASSWORD_DEMO;
  protected readonly cuentasDemo = [
    { rol: 'Admin', email: 'admin@foro.test' },
    { rol: 'Moderador', email: 'moderador@foro.test' },
    { rol: 'Usuario', email: 'ana@foro.test' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email, correoValido(), Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.maxLength(20)]],
    recordar: [true],
  });

  protected usarCuenta(email: string): void {
    this.form.patchValue({ email, password: PASSWORD_DEMO });
    this.error.set(null);
  }

  protected ingresar(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    const resultado = this.auth.login(email, password);

    if (!resultado.ok) {
      const mensajes = {
        credenciales: 'Correo o contraseña incorrectos.',
        inactivo: 'Tu cuenta está desactivada. Contacta a un administrador.',
        bloqueado: 'Demasiados intentos fallidos. Recupera tu contraseña para continuar.',
      };
      this.error.set(mensajes[resultado.motivo]);
      this.form.controls.password.reset('');
      return;
    }

    this.notificaciones.exito(`Hola, ${resultado.usuario.nombre}.`, 'Sesión iniciada');
    const volver = this.route.snapshot.queryParamMap.get('volver');
    this.router.navigateByUrl(volver && volver.startsWith('/') ? volver : '/');
  }
}
