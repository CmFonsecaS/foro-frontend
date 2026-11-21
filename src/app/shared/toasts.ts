import { Component, inject } from '@angular/core';

import { NotificacionService } from '../core/services/notificacion.service';

@Component({
  selector: 'app-toasts',
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1090">
      @for (n of servicio.notificaciones(); track n.id) {
        <div class="toast show border-0 shadow" role="status" aria-live="polite">
          <div class="toast-header text-white" [class]="'bg-' + n.tipo">
            <i class="bi me-2" [class]="icono(n.tipo)"></i>
            <strong class="me-auto">{{ n.titulo }}</strong>
            <button type="button" class="btn-close btn-close-white" aria-label="Cerrar" (click)="servicio.cerrar(n.id)"></button>
          </div>
          <div class="toast-body">{{ n.mensaje }}</div>
        </div>
      }
    </div>
  `,
})
export class Toasts {
  protected readonly servicio = inject(NotificacionService);

  protected icono(tipo: string): string {
    return (
      {
        success: 'bi-check-circle-fill',
        danger: 'bi-x-octagon-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill',
      }[tipo] ?? 'bi-bell'
    );
  }
}
