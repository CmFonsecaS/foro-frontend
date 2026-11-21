import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrado',
  imports: [RouterLink],
  template: `
    <section class="container py-5 text-center">
      <img src="vacio.svg" alt="" width="220" height="170" class="mb-3" />
      <h1 class="display-5 fw-bold">404</h1>
      <p class="lead text-body-secondary">La página que buscas no existe o fue movida.</p>
      <a routerLink="/" class="btn btn-primario"><i class="bi bi-house-door me-1"></i>Volver al inicio</a>
    </section>
  `,
})
export class NoEncontrado {}
