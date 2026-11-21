import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="pie mt-auto pt-5 pb-4">
      <div class="container">
        <div class="row g-4">
          <div class="col-12 col-md-6 col-lg-5">
            <div class="d-flex align-items-center gap-2 mb-2">
              <img src="logo.svg" alt="" width="32" height="32" />
              <span class="fw-bold fs-5 text-white">Ágora</span>
            </div>
            <p class="small mb-0">
              Comunidad de foros en línea para conversar, aprender y compartir con respeto.
              Proyecto académico de Desarrollo Full Stack III · Duoc UC.
            </p>
          </div>
          <div class="col-6 col-md-3 col-lg-3 offset-lg-1">
            <h2 class="h6 text-white">Explorar</h2>
            <ul class="list-unstyled small mb-0">
              <li><a routerLink="/categorias">Categorías</a></li>
              <li><a routerLink="/buscar">Buscar temas</a></li>
              <li><a routerLink="/normas">Normas del foro</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-3 col-lg-3">
            <h2 class="h6 text-white">Tu cuenta</h2>
            <ul class="list-unstyled small mb-0">
              <li><a routerLink="/registro">Crear cuenta</a></li>
              <li><a routerLink="/login">Iniciar sesión</a></li>
              <li><a routerLink="/recuperar">Recuperar contraseña</a></li>
            </ul>
          </div>
        </div>
        <hr class="border-secondary my-4" />
        <p class="small text-center mb-0">© {{ anio }} Ágora · Sistema de Foros en Línea</p>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly anio = new Date().getFullYear();
}
