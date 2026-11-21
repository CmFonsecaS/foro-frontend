import { computed, inject, Injectable, signal } from '@angular/core';

import { Rol, Usuario } from '../models/modelos';
import { UsuarioService } from './usuario.service';

export type ResultadoLogin =
  | { ok: true; usuario: Usuario }
  | { ok: false; motivo: 'credenciales' | 'inactivo' | 'bloqueado' };

interface CodigoRecuperacion {
  email: string;
  codigo: string;
  expira: number;
}

const CLAVE_SESION = 'agora.sesion';
const MAX_INTENTOS = 5;

/**
 * Servicio Singleton de autenticación (simulada en el FrontEnd).
 * Mantiene la sesión del usuario en un signal: navbar, guards y páginas
 * reaccionan automáticamente al iniciar o cerrar sesión (patrón Observer).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usuarioService = inject(UsuarioService);

  private readonly idSesion = signal<number | null>(this.leerSesion());
  private readonly intentosFallidos = new Map<string, number>();
  private recuperacion: CodigoRecuperacion | null = null;

  /** Usuario autenticado (se recalcula si cambia su rol, estado o perfil). */
  readonly usuarioActual = computed<Usuario | null>(() => {
    const id = this.idSesion();
    const usuario = id ? this.usuarioService.usuarios().find((u) => u.id === id) : undefined;
    return usuario && usuario.estado === 'ACTIVO' ? usuario : null;
  });

  readonly autenticado = computed(() => this.usuarioActual() !== null);
  readonly rol = computed<Rol | null>(() => this.usuarioActual()?.rol ?? null);
  readonly esAdmin = computed(() => this.rol() === 'ADMIN');
  readonly puedeModerar = computed(() => this.rol() === 'ADMIN' || this.rol() === 'MODERADOR');

  login(email: string, password: string): ResultadoLogin {
    const clave = email.trim().toLowerCase();

    if ((this.intentosFallidos.get(clave) ?? 0) >= MAX_INTENTOS) {
      return { ok: false, motivo: 'bloqueado' };
    }

    const usuario = this.usuarioService.buscarPorEmail(clave);
    if (!usuario || usuario.password !== password) {
      this.intentosFallidos.set(clave, (this.intentosFallidos.get(clave) ?? 0) + 1);
      return { ok: false, motivo: 'credenciales' };
    }
    if (usuario.estado !== 'ACTIVO') {
      return { ok: false, motivo: 'inactivo' };
    }

    this.intentosFallidos.delete(clave);
    this.idSesion.set(usuario.id);
    this.guardarSesion(usuario.id);
    return { ok: true, usuario };
  }

  logout(): void {
    this.idSesion.set(null);
    this.guardarSesion(null);
  }

  tieneRol(...roles: Rol[]): boolean {
    const rol = this.rol();
    return rol !== null && roles.includes(rol);
  }

  // =====================================================
  // RECUPERAR CONTRASEÑA (SIMULADO)
  // =====================================================

  /** Genera un código de 6 dígitos válido por 10 minutos (simula el envío por correo). */
  solicitarCodigo(email: string): string | null {
    const usuario = this.usuarioService.buscarPorEmail(email);
    if (!usuario) {
      return null;
    }
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    this.recuperacion = { email: usuario.email, codigo, expira: Date.now() + 10 * 60 * 1000 };
    return codigo;
  }

  restablecerPassword(email: string, codigo: string, nuevaPassword: string): 'ok' | 'codigo' | 'expirado' {
    const pendiente = this.recuperacion;
    if (!pendiente || pendiente.email !== email.trim().toLowerCase() || pendiente.codigo !== codigo) {
      return 'codigo';
    }
    if (Date.now() > pendiente.expira) {
      return 'expirado';
    }
    const usuario = this.usuarioService.buscarPorEmail(email);
    if (!usuario) {
      return 'codigo';
    }
    this.usuarioService.cambiarPassword(usuario.id, nuevaPassword);
    this.intentosFallidos.delete(usuario.email);
    this.recuperacion = null;
    return 'ok';
  }

  private leerSesion(): number | null {
    try {
      const valor = localStorage.getItem(CLAVE_SESION);
      return valor ? Number(valor) : null;
    } catch {
      return null;
    }
  }

  private guardarSesion(id: number | null): void {
    try {
      if (id === null) {
        localStorage.removeItem(CLAVE_SESION);
      } else {
        localStorage.setItem(CLAVE_SESION, String(id));
      }
    } catch {
      // Sin almacenamiento: la sesión dura mientras la pestaña esté abierta
    }
  }
}
