import { computed, inject, Injectable } from '@angular/core';

import { COMENTARIOS_INICIALES, PUBLICACIONES_INICIALES } from '../data/datos-iniciales';
import { Comentario, EstadoContenido, Publicacion } from '../models/modelos';
import { CategoriaService } from './categoria.service';
import { RepositorioLocal } from './repositorio-local';
import { UsuarioService } from './usuario.service';

/** Publicación con los datos relacionados que necesitan las vistas. */
export interface PublicacionVista extends Publicacion {
  autor: string;
  categoria: string;
  colorCategoria: string;
  iconoCategoria: string;
  cantidadComentarios: number;
}

export interface ComentarioVista extends Comentario {
  autor: string;
  tituloPublicacion: string;
}

export type OrdenPublicaciones = 'recientes' | 'populares' | 'comentados';

/**
 * Servicio Singleton del foro: publicaciones y comentarios.
 * Agrupa la lógica de foro-service (usuarios) y administracion-service (moderación).
 */
@Injectable({ providedIn: 'root' })
export class ForoService {
  private readonly usuarios = inject(UsuarioService);
  private readonly categorias = inject(CategoriaService);

  private readonly publicacionesRepo = new RepositorioLocal<Publicacion>('agora.publicaciones', PUBLICACIONES_INICIALES);
  private readonly comentariosRepo = new RepositorioLocal<Comentario>('agora.comentarios', COMENTARIOS_INICIALES);

  /** Todas las publicaciones enriquecidas (incluye baneadas, para moderación). */
  readonly publicaciones = computed<PublicacionVista[]>(() =>
    this.publicacionesRepo.todos().map((p) => this.enriquecer(p)),
  );

  /** Publicaciones visibles en el foro (solo activas). */
  readonly publicacionesActivas = computed(() =>
    this.publicaciones()
      .filter((p) => p.estado === 'ACTIVO')
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion)),
  );

  readonly comentarios = computed<ComentarioVista[]>(() =>
    this.comentariosRepo.todos().map((c) => ({
      ...c,
      autor: this.usuarios.nombreDe(c.idUsuario),
      tituloPublicacion: this.publicacionesRepo.buscarPorId(c.idPublicacion)?.titulo ?? '—',
    })),
  );

  readonly estadisticas = computed(() => {
    const publicaciones = this.publicacionesRepo.todos();
    const comentarios = this.comentariosRepo.todos();
    return {
      publicaciones: publicaciones.length,
      publicacionesBaneadas: publicaciones.filter((p) => p.estado === 'BANEADO').length,
      comentarios: comentarios.length,
      comentariosBaneados: comentarios.filter((c) => c.estado === 'BANEADO').length,
    };
  });

  // =====================================================
  // BÚSQUEDA Y VISUALIZACIÓN
  // =====================================================

  buscar(texto: string, idCategoria: number | null, orden: OrdenPublicaciones = 'recientes'): PublicacionVista[] {
    const termino = texto.trim().toLowerCase();
    const resultado = this.publicacionesActivas().filter(
      (p) =>
        (idCategoria === null || p.idCategoria === idCategoria) &&
        (termino === '' ||
          p.titulo.toLowerCase().includes(termino) ||
          p.contenido.toLowerCase().includes(termino) ||
          p.etiquetas.some((e) => e.toLowerCase().includes(termino))),
    );
    return this.ordenar(resultado, orden);
  }

  obtener(id: number): PublicacionVista | undefined {
    return this.publicaciones().find((p) => p.id === id);
  }

  comentariosDe(idPublicacion: number, incluirBaneados = false): ComentarioVista[] {
    return this.comentarios()
      .filter((c) => c.idPublicacion === idPublicacion && (incluirBaneados || c.estado === 'ACTIVO'))
      .sort((a, b) => a.fechaCreacion.localeCompare(b.fechaCreacion));
  }

  publicacionesDe(idUsuario: number): PublicacionVista[] {
    return this.publicaciones()
      .filter((p) => p.idUsuario === idUsuario)
      .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
  }

  contarPorCategoria(idCategoria: number): number {
    return this.publicacionesActivas().filter((p) => p.idCategoria === idCategoria).length;
  }

  registrarVista(id: number): void {
    const publicacion = this.publicacionesRepo.buscarPorId(id);
    if (publicacion) {
      this.publicacionesRepo.actualizar(id, { vistas: publicacion.vistas + 1 });
    }
  }

  // =====================================================
  // PUBLICAR Y COMENTAR (USUARIOS)
  // =====================================================

  publicar(datos: Pick<Publicacion, 'titulo' | 'contenido' | 'idCategoria' | 'etiquetas'>, idUsuario: number): Publicacion {
    return this.publicacionesRepo.agregar({
      ...datos,
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      idUsuario,
      estado: 'ACTIVO',
      fechaCreacion: new Date().toISOString(),
      vistas: 0,
    });
  }

  editar(id: number, datos: Pick<Publicacion, 'titulo' | 'contenido' | 'idCategoria' | 'etiquetas'>): void {
    this.publicacionesRepo.actualizar(id, {
      ...datos,
      titulo: datos.titulo.trim(),
      contenido: datos.contenido.trim(),
      fechaEdicion: new Date().toISOString(),
    });
  }

  eliminarPublicacion(id: number): void {
    this.comentariosRepo.eliminarDonde((c) => c.idPublicacion === id);
    this.publicacionesRepo.eliminar(id);
  }

  comentar(idPublicacion: number, contenido: string, idUsuario: number): Comentario {
    return this.comentariosRepo.agregar({
      contenido: contenido.trim(),
      idPublicacion,
      idUsuario,
      estado: 'ACTIVO',
      fechaCreacion: new Date().toISOString(),
    });
  }

  eliminarComentario(id: number): void {
    this.comentariosRepo.eliminar(id);
  }

  // =====================================================
  // MODERACIÓN (ADMIN Y MODERADOR)
  // =====================================================

  moderarPublicacion(id: number, estado: EstadoContenido, motivo?: string): void {
    this.publicacionesRepo.actualizar(id, { estado, motivoBaneo: estado === 'BANEADO' ? motivo : undefined });
  }

  moderarComentario(id: number, estado: EstadoContenido, motivo?: string): void {
    this.comentariosRepo.actualizar(id, { estado, motivoBaneo: estado === 'BANEADO' ? motivo : undefined });
  }

  tienePublicaciones(idCategoria: number): boolean {
    return this.publicacionesRepo.todos().some((p) => p.idCategoria === idCategoria);
  }

  tieneContenido(idUsuario: number): boolean {
    return (
      this.publicacionesRepo.todos().some((p) => p.idUsuario === idUsuario) ||
      this.comentariosRepo.todos().some((c) => c.idUsuario === idUsuario)
    );
  }

  restablecer(): void {
    this.publicacionesRepo.restablecer();
    this.comentariosRepo.restablecer();
  }

  private enriquecer(p: Publicacion): PublicacionVista {
    const categoria = this.categorias.buscarPorId(p.idCategoria);
    return {
      ...p,
      autor: this.usuarios.nombreDe(p.idUsuario),
      categoria: categoria?.nombre ?? 'Sin categoría',
      colorCategoria: categoria?.color ?? '#64748b',
      iconoCategoria: categoria?.icono ?? 'bi-tag',
      cantidadComentarios: this.comentariosRepo
        .todos()
        .filter((c) => c.idPublicacion === p.id && c.estado === 'ACTIVO').length,
    };
  }

  private ordenar(lista: PublicacionVista[], orden: OrdenPublicaciones): PublicacionVista[] {
    const copia = [...lista];
    switch (orden) {
      case 'populares':
        return copia.sort((a, b) => b.vistas - a.vistas);
      case 'comentados':
        return copia.sort((a, b) => b.cantidadComentarios - a.cantidadComentarios);
      default:
        return copia.sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
    }
  }
}
