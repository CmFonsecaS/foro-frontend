import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validadores personalizados de formularios.
 */

/** Reglas de seguridad de la contraseña (6 validaciones). */
export const REGLAS_PASSWORD = [
  { clave: 'minimo', texto: 'Mínimo 8 caracteres', prueba: (v: string) => v.length >= 8 },
  { clave: 'maximo', texto: 'Máximo 20 caracteres', prueba: (v: string) => v.length > 0 && v.length <= 20 },
  { clave: 'mayuscula', texto: 'Al menos una letra mayúscula', prueba: (v: string) => /[A-Z]/.test(v) },
  { clave: 'minuscula', texto: 'Al menos una letra minúscula', prueba: (v: string) => /[a-z]/.test(v) },
  { clave: 'numero', texto: 'Al menos un número', prueba: (v: string) => /\d/.test(v) },
  { clave: 'especial', texto: 'Al menos un carácter especial (!@#$%...)', prueba: (v: string) => /[^A-Za-z0-9\s]/.test(v) },
  { clave: 'espacios', texto: 'Sin espacios en blanco', prueba: (v: string) => v.length > 0 && !/\s/.test(v) },
] as const;

/** Valida la contraseña contra todas las reglas y devuelve las que no cumple. */
export function passwordSegura(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    if (!valor) {
      return null; // "required" se valida por separado
    }
    const incumplidas = REGLAS_PASSWORD.filter((r) => !r.prueba(valor)).map((r) => r.clave);
    return incumplidas.length ? { passwordDebil: incumplidas } : null;
  };
}

/** Comprueba que dos campos del grupo coincidan (ej. contraseña y confirmación). */
export function camposIguales(campo: string, confirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const a = grupo.get(campo)?.value;
    const b = grupo.get(confirmacion)?.value;
    return a && b && a !== b ? { noCoinciden: true } : null;
  };
}

/** Rechaza textos formados solo por espacios. */
export function sinSoloEspacios(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    return typeof valor === 'string' && valor.length > 0 && valor.trim().length === 0
      ? { soloEspacios: true }
      : null;
  };
}

/** Nombre de persona: solo letras (con tildes), espacios, apóstrofes y guiones. */
export function nombrePersona(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    return valor && !/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/.test(valor.trim()) ? { nombreInvalido: true } : null;
  };
}

/** Correo con dominio y extensión (más estricto que el validador email de Angular). */
export function correoValido(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    return valor && !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(valor.trim()) ? { correoInvalido: true } : null;
  };
}

/** Edad mínima a partir de una fecha de nacimiento (yyyy-mm-dd). */
export function edadMinima(anios: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor: string = control.value ?? '';
    if (!valor) {
      return null;
    }
    const nacimiento = new Date(valor + 'T00:00:00');
    if (Number.isNaN(nacimiento.getTime()) || nacimiento > new Date()) {
      return { fechaInvalida: true };
    }
    const limite = new Date();
    limite.setFullYear(limite.getFullYear() - anios);
    return nacimiento > limite ? { edadMinima: { requerida: anios } } : null;
  };
}

/** Etiquetas separadas por comas: máximo 5, cada una de 2 a 20 caracteres alfanuméricos. */
export function etiquetasValidas(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const etiquetas = convertirEtiquetas(control.value ?? '');
    if (etiquetas.length > 5) {
      return { demasiadasEtiquetas: true };
    }
    return etiquetas.some((e) => !/^[\p{L}\d-]{2,20}$/u.test(e)) ? { etiquetaInvalida: true } : null;
  };
}

export function convertirEtiquetas(texto: string): string[] {
  return texto
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}
