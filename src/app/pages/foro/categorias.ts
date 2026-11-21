import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PluralPipe } from '../../shared/plural.pipe';
import { CategoriaService } from '../../core/services/categoria.service';
import { ForoService } from '../../core/services/foro.service';

@Component({
  selector: 'app-categorias',
  imports: [PluralPipe, RouterLink],
  template: `
    <section class="encabezado-pagina">
      <div class="container py-4">
        <h1 class="h2 fw-bold mb-1">Categorías del foro</h1>
        <p class="mb-0 opacity-75">Elige un tema y únete a la conversación</p>
      </div>
    </section>

    <section class="container py-4 py-md-5">
      <div class="row g-4">
        @for (c of categorias.categorias(); track c.id) {
          <div class="col-12 col-md-6 col-lg-4">
            <article class="card tarjeta-categoria h-100" [style.--color-cat]="c.color">
              <div class="franja-categoria"></div>
              <div class="card-body d-flex flex-column">
                <div class="d-flex align-items-center gap-3 mb-3">
                  <span class="icono-categoria"><i class="bi" [class]="c.icono"></i></span>
                  <h2 class="h5 mb-0">{{ c.nombre }}</h2>
                </div>
                <p class="text-body-secondary flex-grow-1">{{ c.descripcion }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small text-body-secondary"><i class="bi bi-chat-square-text me-1"></i>{{ foro.contarPorCategoria(c.id) | plural: 'tema' : 'temas' }}</span>
                  <a class="btn btn-sm btn-primario stretched-link" [routerLink]="['/categorias', c.id]">Entrar</a>
                </div>
              </div>
            </article>
          </div>
        }
      </div>
    </section>
  `,
})
export class Categorias {
  protected readonly categorias = inject(CategoriaService);
  protected readonly foro = inject(ForoService);
}
