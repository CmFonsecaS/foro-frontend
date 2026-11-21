import { computed, Injectable } from '@angular/core';

import { USUARIOS_INICIALES } from '../data/datos-iniciales';
import { EstadoUsuario, Rol, Usuario } from '../models/modelos';
import { RepositorioLocal } from './repositorio-local';

/**
 * Servicio Singleton que administra la colección de usuarios.
 * Equivale en el FrontEnd al microservicio usuarios-service.
 */
@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly repo = new RepositorioLocal<Usuario>('agora.usuarios', USUARIOS_INICIALES);

  readonly usuarios = this.repo.todos;
  readonly activos = computed(() => this.usuarios().filter((u) => u.estado === 'ACTIVO').length);

  buscarPorId(id: number): Usuario | undefined {
    return this.repo.buscarPorId(id);
  }

  buscarPorEmail(email: string): Usuario | undefined {
    const normalizado = email.trim().toLowerCase();
    return this.usuarios().find((u) => u.email === normalizado);
  }

  existeEmail(email: string, excluirId?: number): boolean {
    const usuario = this.buscarPorEmail(email);
    return !!usuario && usuario.id !== excluirId;
  }

  nombreDe(id: number): string {
    return this.buscarPorId(id)?.nombre ?? 'Usuario eliminado';
  }

  registrar(datos: Pick<Usuario, 'nombre' | 'email' | 'password' | 'fechaNacimiento' | 'ciudad'>): Usuario {
    return this.repo.agregar({
      ...datos,
      nombre: datos.nombre.trim(),
      email: datos.email.trim().toLowerCase(),
      rol: 'USUARIO',
      estado: 'ACTIVO',
      fechaCreacion: new Date().toISOString(),
    });
  }

  actualizarPerfil(id: number, cambios: Partial<Pick<Usuario, 'nombre' | 'email' | 'bio' | 'ciudad' | 'fechaNacimiento'>>): Usuario | undefined {
    const limpio = { ...cambios };
    if (limpio.email) {
      limpio.email = limpio.email.trim().toLowerCase();
    }
    return this.repo.actualizar(id, limpio);
  }

  cambiarPassword(id: number, password: string): void {
    this.repo.actualizar(id, { password });
  }

  cambiarRol(id: number, rol: Rol): void {
    this.repo.actualizar(id, { rol });
  }

  cambiarEstado(id: number, estado: EstadoUsuario): void {
    this.repo.actualizar(id, { estado });
  }

  eliminar(id: number): void {
    this.repo.eliminar(id);
  }

  restablecer(): void {
    this.repo.restablecer();
  }
}
