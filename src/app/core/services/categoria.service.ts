import { Injectable } from '@angular/core';

import { CATEGORIAS_INICIALES } from '../data/datos-iniciales';
import { Categoria } from '../models/modelos';
import { RepositorioLocal } from './repositorio-local';

/**
 * Servicio Singleton de categorías del foro.
 */
@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly repo = new RepositorioLocal<Categoria>('agora.categorias', CATEGORIAS_INICIALES);

  readonly categorias = this.repo.todos;

  buscarPorId(id: number): Categoria | undefined {
    return this.repo.buscarPorId(id);
  }

  existeNombre(nombre: string, excluirId?: number): boolean {
    const normalizado = nombre.trim().toLowerCase();
    return this.categorias().some((c) => c.nombre.toLowerCase() === normalizado && c.id !== excluirId);
  }

  crear(datos: Omit<Categoria, 'id'>): Categoria {
    return this.repo.agregar({ ...datos, nombre: datos.nombre.trim() });
  }

  actualizar(id: number, datos: Omit<Categoria, 'id'>): void {
    this.repo.actualizar(id, { ...datos, nombre: datos.nombre.trim() });
  }

  eliminar(id: number): void {
    this.repo.eliminar(id);
  }

  restablecer(): void {
    this.repo.restablecer();
  }
}
