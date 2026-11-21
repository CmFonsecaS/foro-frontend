import { Injectable, signal } from '@angular/core';

export interface SolicitudConfirmacion {
  titulo: string;
  mensaje: string;
  textoAceptar: string;
  claseAceptar: string;
  /** Si es true, el modal pide un motivo obligatorio (ej. al banear). */
  pedirMotivo: boolean;
  resolver: (respuesta: { aceptado: boolean; motivo: string }) => void;
}

/**
 * Servicio Singleton que abre el modal de confirmación y devuelve una promesa.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmacionService {
  readonly solicitud = signal<SolicitudConfirmacion | null>(null);

  confirmar(opciones: {
    titulo: string;
    mensaje: string;
    textoAceptar?: string;
    claseAceptar?: string;
    pedirMotivo?: boolean;
  }): Promise<{ aceptado: boolean; motivo: string }> {
    return new Promise((resolve) => {
      this.solicitud.set({
        titulo: opciones.titulo,
        mensaje: opciones.mensaje,
        textoAceptar: opciones.textoAceptar ?? 'Confirmar',
        claseAceptar: opciones.claseAceptar ?? 'btn-danger',
        pedirMotivo: opciones.pedirMotivo ?? false,
        resolver: (respuesta) => {
          this.solicitud.set(null);
          resolve(respuesta);
        },
      });
    });
  }
}
