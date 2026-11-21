import { computed, signal, Signal } from '@angular/core';

/**
 * Patrón REPOSITORY (genérico) sobre una colección en memoria.
 * - Los datos viven en un arreglo dentro de un signal (patrón Observer:
 *   los componentes se actualizan solos cuando la colección cambia).
 * - Opcionalmente se respaldan en localStorage para que la demo conserve
 *   los cambios al recargar la página.
 */
export class RepositorioLocal<T extends { id: number }> {
  private readonly datos = signal<T[]>([]);

  /** Colección de solo lectura para las vistas. */
  readonly todos: Signal<T[]> = this.datos.asReadonly();
  readonly total = computed(() => this.datos().length);

  constructor(
    private readonly clave: string,
    private readonly iniciales: T[],
  ) {
    this.datos.set(this.cargar());
  }

  buscarPorId(id: number): T | undefined {
    return this.datos().find((item) => item.id === id);
  }

  agregar(item: Omit<T, 'id'>): T {
    const nuevo = { ...item, id: this.siguienteId() } as T;
    this.datos.update((lista) => [...lista, nuevo]);
    this.guardar();
    return nuevo;
  }

  actualizar(id: number, cambios: Partial<T>): T | undefined {
    let actualizado: T | undefined;
    this.datos.update((lista) =>
      lista.map((item) => {
        if (item.id !== id) {
          return item;
        }
        actualizado = { ...item, ...cambios, id };
        return actualizado;
      }),
    );
    this.guardar();
    return actualizado;
  }

  eliminar(id: number): void {
    this.datos.update((lista) => lista.filter((item) => item.id !== id));
    this.guardar();
  }

  eliminarDonde(condicion: (item: T) => boolean): void {
    this.datos.update((lista) => lista.filter((item) => !condicion(item)));
    this.guardar();
  }

  /** Restaura los datos iniciales de la demo. */
  restablecer(): void {
    this.datos.set(structuredClone(this.iniciales));
    this.guardar();
  }

  private siguienteId(): number {
    return this.datos().reduce((max, item) => Math.max(max, item.id), 0) + 1;
  }

  private cargar(): T[] {
    try {
      const guardado = localStorage.getItem(this.clave);
      if (guardado) {
        return JSON.parse(guardado) as T[];
      }
    } catch {
      // Sin acceso a localStorage: se usan los datos iniciales
    }
    return structuredClone(this.iniciales);
  }

  private guardar(): void {
    try {
      localStorage.setItem(this.clave, JSON.stringify(this.datos()));
    } catch {
      // Ignorar: la aplicación sigue funcionando en memoria
    }
  }
}
