import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ROLES } from '../../core/models/modelos';

@Component({
  selector: 'app-normas',
  imports: [RouterLink],
  template: `
    <section class="encabezado-pagina">
      <div class="container py-4">
        <h1 class="h2 fw-bold mb-1">Normas de la comunidad</h1>
        <p class="mb-0 opacity-75">Para que Ágora siga siendo un lugar seguro y útil para todos</p>
      </div>
    </section>

    <section class="container py-4 py-md-5">
      <div class="row g-4">
        <div class="col-12 col-lg-7">
          <div class="row g-3">
            @for (n of normas; track n.titulo; let i = $index) {
              <div class="col-12 col-md-6 col-lg-12 col-xl-6">
                <div class="card h-100 shadow-sm">
                  <div class="card-body">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <span class="icono-circular icono-sm"><i class="bi" [class]="n.icono"></i></span>
                      <h2 class="h6 mb-0">{{ i + 1 }}. {{ n.titulo }}</h2>
                    </div>
                    <p class="small text-body-secondary mb-0">{{ n.texto }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
        <div class="col-12 col-lg-5">
          <div class="card shadow-sm mb-3">
            <div class="card-body">
              <h2 class="h5 fw-bold"><i class="bi bi-people me-2"></i>Roles de la comunidad</h2>
              <ul class="list-unstyled mb-0">
                @for (r of roles; track r.clave) {
                  <li class="mb-3">
                    <span class="badge mb-1" [class]="r.clase">{{ r.nombre }}</span>
                    <div class="small">{{ r.descripcion }}</div>
                  </li>
                }
              </ul>
            </div>
          </div>
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-1"></i>
            El contenido que incumpla estas normas puede ser <strong>baneado</strong> por un moderador o administrador.
            Las cuentas reincidentes pueden ser desactivadas.
          </div>
          <a class="btn btn-primario w-100" routerLink="/registro">Acepto, quiero participar</a>
        </div>
      </div>
    </section>
  `,
})
export class Normas {
  protected readonly normas = [
    { icono: 'bi-heart', titulo: 'Respeto ante todo', texto: 'No se permiten insultos, acoso, discriminación ni lenguaje ofensivo.' },
    { icono: 'bi-megaphone', titulo: 'Nada de spam', texto: 'Prohibida la publicidad no autorizada, cadenas y enlaces sospechosos.' },
    { icono: 'bi-bullseye', titulo: 'Publica en la categoría correcta', texto: 'Elige la categoría que mejor describe tu tema para que otros lo encuentren.' },
    { icono: 'bi-search', titulo: 'Busca antes de publicar', texto: 'Revisa si ya existe un tema similar para no duplicar conversaciones.' },
    { icono: 'bi-shield-lock', titulo: 'Protege tus datos', texto: 'No compartas contraseñas, direcciones ni datos personales de terceros.' },
    { icono: 'bi-c-circle', titulo: 'Respeta la propiedad intelectual', texto: 'Cita las fuentes y no publiques contenido pirata.' },
  ];

  protected readonly roles = Object.entries(ROLES).map(([clave, r]) => ({ clave, ...r }));
}
