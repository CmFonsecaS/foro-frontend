import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PluralPipe } from '../../shared/plural.pipe';
import { AuthService } from '../../core/services/auth.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { ForoService } from '../../core/services/foro.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { TarjetaPublicacion } from '../../shared/tarjeta-publicacion';

@Component({
  selector: 'app-inicio',
  imports: [PluralPipe, RouterLink, TarjetaPublicacion],
  template: `
    <!-- HERO -->
    <section class="hero text-white">
      <div class="container py-5">
        <div class="row align-items-center g-4">
          <div class="col-12 col-md-7 col-lg-6">
            <span class="badge rounded-pill bg-acento text-dark mb-3"><i class="bi bi-stars me-1"></i>Comunidad abierta</span>
            <h1 class="display-5 fw-bold">Conversa, aprende y comparte en Ágora</h1>
            <p class="lead opacity-75">
              Foros sobre tecnología, programación, videojuegos, educación, ciencia y mucho más.
              Publica tus temas, comenta y conecta con personas que comparten tus intereses.
            </p>
            <div class="d-flex flex-wrap gap-2">
              @if (auth.autenticado()) {
                <a class="btn btn-acento btn-lg" routerLink="/temas/nuevo"><i class="bi bi-plus-circle me-1"></i>Publicar un tema</a>
              } @else {
                <a class="btn btn-acento btn-lg" routerLink="/registro"><i class="bi bi-person-plus me-1"></i>Únete gratis</a>
              }
              <a class="btn btn-outline-light btn-lg" routerLink="/categorias">Explorar foros</a>
            </div>
          </div>
          <div class="col-12 col-md-5 col-lg-6 text-center">
            <img src="hero.svg" class="img-fluid hero-img" alt="Personas conversando en burbujas de diálogo" width="520" height="380" />
          </div>
        </div>
      </div>
    </section>

    <!-- ESTADÍSTICAS -->
    <section class="container estadisticas-hero">
      <div class="row g-3">
        @for (e of estadisticas(); track e.texto) {
          <div class="col-6 col-md-3">
            <div class="card shadow-sm text-center h-100">
              <div class="card-body">
                <i class="bi fs-3 texto-primario" [class]="e.icono"></i>
                <div class="fs-3 fw-bold">{{ e.valor }}</div>
                <div class="small text-body-secondary">{{ e.texto }}</div>
              </div>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- CATEGORÍAS -->
    <section class="container py-5">
      <div class="d-flex justify-content-between align-items-end mb-3">
        <h2 class="h3 fw-bold mb-0">Categorías</h2>
        <a routerLink="/categorias" class="small">Ver todas <i class="bi bi-arrow-right"></i></a>
      </div>
      <div class="row g-3">
        @for (c of categorias.categorias(); track c.id) {
          <div class="col-12 col-sm-6 col-lg-4">
            <a class="card tarjeta-categoria h-100 text-decoration-none" [routerLink]="['/categorias', c.id]" [style.--color-cat]="c.color">
              <div class="card-body d-flex gap-3 align-items-center">
                <span class="icono-categoria"><i class="bi" [class]="c.icono"></i></span>
                <div>
                  <h3 class="h6 mb-1 text-body-emphasis">{{ c.nombre }}</h3>
                  <p class="small text-body-secondary mb-0">{{ foro.contarPorCategoria(c.id) | plural: 'tema' : 'temas' }}</p>
                </div>
              </div>
            </a>
          </div>
        }
      </div>
    </section>

    <!-- ÚLTIMOS TEMAS -->
    <section class="bg-body-tertiary py-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-end mb-3">
          <h2 class="h3 fw-bold mb-0">Temas recientes</h2>
          <a routerLink="/buscar" class="small">Ver todos <i class="bi bi-arrow-right"></i></a>
        </div>
        <div class="row g-3">
          @for (p of recientes(); track p.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <app-tarjeta-publicacion [publicacion]="p" />
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class Inicio {
  protected readonly auth = inject(AuthService);
  protected readonly categorias = inject(CategoriaService);
  protected readonly foro = inject(ForoService);
  private readonly usuarios = inject(UsuarioService);

  protected readonly recientes = computed(() => this.foro.publicacionesActivas().slice(0, 6));

  protected readonly estadisticas = computed(() => [
    { icono: 'bi-people', valor: this.usuarios.activos(), texto: 'Miembros' },
    { icono: 'bi-grid', valor: this.categorias.categorias().length, texto: 'Categorías' },
    { icono: 'bi-chat-square-text', valor: this.foro.publicacionesActivas().length, texto: 'Temas' },
    { icono: 'bi-chat-dots', valor: this.foro.comentarios().filter((c) => c.estado === 'ACTIVO').length, texto: 'Comentarios' },
  ]);
}
