import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicacionVista } from '../core/services/foro.service';

@Component({
  selector: 'app-tarjeta-publicacion',
  imports: [RouterLink, DatePipe],
  template: `
    @let p = publicacion();
    <article class="card tarjeta-tema h-100" [style.--color-cat]="p.colorCategoria">
      <div class="card-body d-flex flex-column">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
          <a class="badge rounded-pill insignia-categoria text-decoration-none" [routerLink]="['/categorias', p.idCategoria]">
            <i class="bi me-1" [class]="p.iconoCategoria"></i>{{ p.categoria }}
          </a>
          @if (p.estado === 'BANEADO') {
            <span class="badge text-bg-danger"><i class="bi bi-slash-circle me-1"></i>Baneado</span>
          }
        </div>
        <h3 class="h5 card-title mb-2">
          <a class="stretched-link link-body-emphasis text-decoration-none" [routerLink]="['/temas', p.id]">{{ p.titulo }}</a>
        </h3>
        <p class="card-text text-body-secondary texto-recortado flex-grow-1">{{ p.contenido }}</p>
        <div class="d-flex flex-wrap gap-1 mb-2">
          @for (e of p.etiquetas; track e) {
            <span class="badge text-bg-light border">#{{ e }}</span>
          }
        </div>
        <div class="d-flex flex-wrap justify-content-between align-items-center small text-body-secondary gap-2">
          <span><i class="bi bi-person-circle me-1"></i>{{ p.autor }} · {{ p.fechaCreacion | date: 'd MMM y' }}</span>
          <span>
            <i class="bi bi-eye me-1"></i>{{ p.vistas }}
            <i class="bi bi-chat-dots ms-2 me-1"></i>{{ p.cantidadComentarios }}
          </span>
        </div>
      </div>
    </article>
  `,
})
export class TarjetaPublicacion {
  readonly publicacion = input.required<PublicacionVista>();
}
