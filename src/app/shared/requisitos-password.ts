import { Component, computed, input } from '@angular/core';

import { REGLAS_PASSWORD } from '../core/validators/validadores';

/**
 * Lista en vivo de las reglas de seguridad de la contraseña y barra de fortaleza.
 */
@Component({
  selector: 'app-requisitos-password',
  template: `
    <div class="requisitos mt-2" aria-live="polite">
      <div class="progress mb-2" role="progressbar" aria-label="Fortaleza de la contraseña"
        [attr.aria-valuenow]="cumplidas()" aria-valuemin="0" [attr.aria-valuemax]="reglas.length" style="height: 6px">
        <div class="progress-bar" [class]="claseBarra()" [style.width.%]="porcentaje()"></div>
      </div>
      <ul class="list-unstyled small mb-0 row row-cols-1 row-cols-sm-2 g-1">
        @for (regla of estado(); track regla.clave) {
          <li class="col" [class.text-success]="regla.ok" [class.text-body-secondary]="!regla.ok">
            <i class="bi me-1" [class.bi-check-circle-fill]="regla.ok" [class.bi-circle]="!regla.ok"></i>{{ regla.texto }}
          </li>
        }
      </ul>
    </div>
  `,
})
export class RequisitosPassword {
  readonly valor = input<string | null>('');
  protected readonly reglas = REGLAS_PASSWORD;

  protected readonly estado = computed(() => {
    const v = this.valor() ?? '';
    return REGLAS_PASSWORD.map((r) => ({ clave: r.clave, texto: r.texto, ok: r.prueba(v) }));
  });

  protected readonly cumplidas = computed(() => this.estado().filter((r) => r.ok).length);
  protected readonly porcentaje = computed(() => (this.cumplidas() / REGLAS_PASSWORD.length) * 100);
  protected readonly claseBarra = computed(() => {
    const p = this.porcentaje();
    return p === 100 ? 'bg-success' : p >= 60 ? 'bg-warning' : 'bg-danger';
  });
}
