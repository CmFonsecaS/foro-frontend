import { Injectable, signal } from '@angular/core';

export type TipoNotificacion = 'success' | 'danger' | 'warning' | 'info';

export interface Notificacion {
  id: number;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
}

/**
 * Servicio Singleton de notificaciones (toasts de Bootstrap).
 */
@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private contador = 0;
  readonly notificaciones = signal<Notificacion[]>([]);

  exito(mensaje: string, titulo = 'Listo'): void {
    this.mostrar('success', titulo, mensaje);
  }

  error(mensaje: string, titulo = 'Error'): void {
    this.mostrar('danger', titulo, mensaje);
  }

  aviso(mensaje: string, titulo = 'Atención'): void {
    this.mostrar('warning', titulo, mensaje);
  }

  info(mensaje: string, titulo = 'Información', duracion = 5000): void {
    this.mostrar('info', titulo, mensaje, duracion);
  }

  cerrar(id: number): void {
    this.notificaciones.update((lista) => lista.filter((n) => n.id !== id));
  }

  private mostrar(tipo: TipoNotificacion, titulo: string, mensaje: string, duracion = 4000): void {
    const id = ++this.contador;
    this.notificaciones.update((lista) => [...lista, { id, tipo, titulo, mensaje }]);
    setTimeout(() => this.cerrar(id), duracion);
  }
}
