import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Muestra el primer mensaje de error de un campo cuando fue tocado o modificado.
 */
@Component({
  selector: 'app-error-campo',
  template: `
    @if (mensaje(); as m) {
      <div class="invalid-feedback d-block" role="alert"><i class="bi bi-exclamation-circle me-1"></i>{{ m }}</div>
    }
  `,
})
export class ErrorCampo implements OnInit {
  readonly control = input.required<AbstractControl>();
  readonly etiqueta = input('Este campo');

  private readonly destroyRef = inject(DestroyRef);
  // Se incrementa con cada cambio de valor, estado o "touched" del control
  private readonly version = signal(0);

  protected readonly mensaje = computed(() => {
    this.version();
    const c = this.control();
    if (!c.errors || !(c.touched || c.dirty)) {
      return null;
    }
    return traducir(c.errors, this.etiqueta());
  });

  ngOnInit(): void {
    const suscripcion = this.control().events.subscribe(() => this.version.update((v) => v + 1));
    this.destroyRef.onDestroy(() => suscripcion.unsubscribe());
  }
}

function traducir(errores: Record<string, any>, etiqueta: string): string {
  if (errores['required']) return `${etiqueta} es un campo obligatorio.`;
  if (errores['minlength']) return `Debe tener al menos ${errores['minlength'].requiredLength} caracteres.`;
  if (errores['maxlength']) return `No puede superar ${errores['maxlength'].requiredLength} caracteres.`;
  if (errores['email'] || errores['correoInvalido']) return 'Ingresa un correo válido (ej.: nombre@dominio.cl).';
  if (errores['soloEspacios']) return 'No puede contener solo espacios.';
  if (errores['nombreInvalido']) return 'Solo se permiten letras, espacios y guiones.';
  if (errores['passwordDebil']) return 'La contraseña no cumple los requisitos de seguridad.';
  if (errores['edadMinima']) return `Debes tener al menos ${errores['edadMinima'].requerida} años.`;
  if (errores['fechaInvalida']) return 'Ingresa una fecha válida y no futura.';
  if (errores['emailDuplicado']) return 'Este correo ya está registrado.';
  if (errores['nombreDuplicado']) return 'Ya existe un registro con este nombre.';
  if (errores['demasiadasEtiquetas']) return 'Máximo 5 etiquetas.';
  if (errores['etiquetaInvalida']) return 'Cada etiqueta debe tener de 2 a 20 letras, números o guiones.';
  if (errores['requiredTrue']) return 'Debes aceptar para continuar.';
  if (errores['incorrecta']) return 'La contraseña actual no es correcta.';
  if (errores['pattern']) return 'El formato no es válido.';
  return 'Valor no válido.';
}
