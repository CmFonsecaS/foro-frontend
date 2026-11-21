/**
 * MODELO (patrón MVC): estructuras de datos del Sistema de Foros en Línea.
 * Reflejan las tablas de Oracle (USUARIOS, ROLES, CATEGORIAS, PUBLICACIONES, COMENTARIOS).
 */

export type Rol = 'ADMIN' | 'MODERADOR' | 'USUARIO';
export type EstadoUsuario = 'ACTIVO' | 'INACTIVO';
export type EstadoContenido = 'ACTIVO' | 'BANEADO';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  /** Solo para la demo sin backend: la API real guarda un hash BCrypt. */
  password: string;
  rol: Rol;
  estado: EstadoUsuario;
  fechaCreacion: string;
  bio?: string;
  ciudad?: string;
  fechaNacimiento?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}

export interface Publicacion {
  id: number;
  titulo: string;
  contenido: string;
  idUsuario: number;
  idCategoria: number;
  estado: EstadoContenido;
  fechaCreacion: string;
  fechaEdicion?: string;
  motivoBaneo?: string;
  etiquetas: string[];
  vistas: number;
}

export interface Comentario {
  id: number;
  contenido: string;
  idPublicacion: number;
  idUsuario: number;
  estado: EstadoContenido;
  fechaCreacion: string;
  motivoBaneo?: string;
}

/** Descripción legible de cada rol y sus privilegios. */
export const ROLES: Record<Rol, { nombre: string; descripcion: string; clase: string }> = {
  ADMIN: {
    nombre: 'Administrador',
    descripcion: 'Gestiona usuarios, categorías y modera todo el contenido.',
    clase: 'text-bg-danger',
  },
  MODERADOR: {
    nombre: 'Moderador',
    descripcion: 'Banea o reactiva temas y comentarios que incumplen las normas.',
    clase: 'text-bg-warning',
  },
  USUARIO: {
    nombre: 'Usuario',
    descripcion: 'Publica temas, comenta y administra su propio contenido.',
    clase: 'text-bg-primary',
  },
};
