import { Component, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { sinSoloEspacios } from '../core/validators/validadores';
import { ConfirmacionService } from './confirmacion.service';
import { ErrorCampo } from './error-campo';

@Component({
  selector: 'app-modal-confirmacion',
  imports: [ReactiveFormsModule, ErrorCampo],
  template: `
    @if (servicio.solicitud(); as s) {
      <div class="modal-backdrop fade show"></div>
      <div class="modal fade show d-block" tabindex="-1" role="dialog" aria-modal="true" (keydown.escape)="responder(false)">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content shadow">
            <div class="modal-header">
              <h2 class="modal-title fs-5">{{ s.titulo }}</h2>
              <button type="button" class="btn-close" aria-label="Cerrar" (click)="responder(false)"></button>
            </div>
            <div class="modal-body">
              <p class="mb-3">{{ s.mensaje }}</p>
              @if (s.pedirMotivo) {
                <label for="motivo" class="form-label">Motivo (se informará al autor)</label>
                <textarea id="motivo" class="form-control" rows="3" maxlength="200" required
                  [formControl]="motivo" [class.is-invalid]="motivo.invalid && motivo.touched"
                  placeholder="Ej.: Lenguaje ofensivo, spam, contenido fuera de tema..."></textarea>
                <app-error-campo [control]="motivo" />
                <div class="form-text text-end">{{ motivo.value?.length ?? 0 }}/200</div>
              }
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" (click)="responder(false)">Cancelar</button>
              <button type="button" class="btn" [class]="s.claseAceptar" (click)="responder(true)">{{ s.textoAceptar }}</button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalConfirmacion {
  protected readonly servicio = inject(ConfirmacionService);

  protected readonly motivo = new FormControl('', [
    Validators.required,
    Validators.minLength(5),
    Validators.maxLength(200),
    sinSoloEspacios(),
  ]);

  constructor() {
    // Cada vez que se abre el modal se limpia el motivo
    effect(() => {
      if (this.servicio.solicitud()) {
        this.motivo.reset('');
      }
    });
  }

  protected responder(aceptado: boolean): void {
    const solicitud = this.servicio.solicitud();
    if (!solicitud) {
      return;
    }
    if (aceptado && solicitud.pedirMotivo && this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }
    solicitud.resolver({ aceptado, motivo: (this.motivo.value ?? '').trim() });
  }
}
