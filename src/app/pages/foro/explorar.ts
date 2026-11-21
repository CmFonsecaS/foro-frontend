import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { ForoService, OrdenPublicaciones } from '../../core/services/foro.service';
import { TarjetaPublicacion } from '../../shared/tarjeta-publicacion';

const POR_PAGINA = 6;

/**
 * Búsqueda y visualización de temas. Se usa en /buscar y en /categorias/:id.
 */
@Component({
  selector: 'app-explorar',
  imports: [FormsModule, RouterLink, TarjetaPublicacion],
  template: `
    <section class="encabezado-pagina" [style.--color-cat]="categoria()?.color">
      <div class="container py-4">
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb mb-2">
            <li class="breadcrumb-item"><a routerLink="/">Inicio</a></li>
            @if (categoria(); as c) {
              <li class="breadcrumb-item"><a routerLink="/categorias">Categorías</a></li>
              <li class="breadcrumb-item active" aria-current="page">{{ c.nombre }}</li>
            } @else {
              <li class="breadcrumb-item active" aria-current="page">Buscar</li>
            }
          </ol>
        </nav>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h1 class="h2 fw-bold mb-1">
              @if (categoria(); as c) { <i class="bi me-2" [class]="c.icono"></i>{{ c.nombre }} } @else { Buscar temas }
            </h1>
            <p class="mb-0 opacity-75">{{ categoria()?.descripcion ?? 'Encuentra conversaciones por palabra clave, etiqueta o categoría' }}</p>
          </div>
          @if (auth.autenticado()) {
            <a class="btn btn-acento" routerLink="/temas/nuevo" [queryParams]="categoria() ? { categoria: categoria()!.id } : {}">
              <i class="bi bi-plus-circle me-1"></i>Nuevo tema
            </a>
          }
        </div>
      </div>
    </section>

    <section class="container py-4">
      <!-- Filtros -->
      <form class="card shadow-sm mb-4" role="search" (ngSubmit)="aplicarBusqueda()">
        <div class="card-body row g-2 align-items-end">
          <div class="col-12 col-md-5">
            <label for="texto" class="form-label small mb-1">Palabra clave</label>
            <input id="texto" name="texto" type="search" class="form-control" placeholder="Ej.: java, docker, series"
              maxlength="60" [(ngModel)]="texto" />
          </div>
          <div class="col-6 col-md-3">
            <label for="categoria" class="form-label small mb-1">Categoría</label>
            <select id="categoria" name="categoria" class="form-select" [ngModel]="idCategoria()" (ngModelChange)="cambiarCategoria($event)">
              <option [ngValue]="null">Todas</option>
              @for (c of categorias.categorias(); track c.id) {
                <option [ngValue]="c.id">{{ c.nombre }}</option>
              }
            </select>
          </div>
          <div class="col-6 col-md-2">
            <label for="orden" class="form-label small mb-1">Ordenar por</label>
            <select id="orden" name="orden" class="form-select" [ngModel]="orden()" (ngModelChange)="orden.set($event); pagina.set(1)">
              <option value="recientes">Recientes</option>
              <option value="populares">Más vistos</option>
              <option value="comentados">Más comentados</option>
            </select>
          </div>
          <div class="col-12 col-md-2 d-grid">
            <button type="submit" class="btn btn-primario"><i class="bi bi-search me-1"></i>Buscar</button>
          </div>
        </div>
      </form>

      <p class="text-body-secondary small" aria-live="polite">
        {{ resultados().length }} {{ resultados().length === 1 ? 'tema encontrado' : 'temas encontrados' }}
        @if (busqueda()) { para "<strong>{{ busqueda() }}</strong>" }
      </p>

      @if (paginados().length) {
        <div class="row g-3">
          @for (p of paginados(); track p.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <app-tarjeta-publicacion [publicacion]="p" />
            </div>
          }
        </div>

        @if (totalPaginas() > 1) {
          <nav class="mt-4" aria-label="Paginación de temas">
            <ul class="pagination justify-content-center flex-wrap">
              <li class="page-item" [class.disabled]="pagina() === 1">
                <button class="page-link" type="button" (click)="pagina.set(pagina() - 1)" aria-label="Anterior">&laquo;</button>
              </li>
              @for (n of paginas(); track n) {
                <li class="page-item" [class.active]="n === pagina()">
                  <button class="page-link" type="button" (click)="pagina.set(n)">{{ n }}</button>
                </li>
              }
              <li class="page-item" [class.disabled]="pagina() === totalPaginas()">
                <button class="page-link" type="button" (click)="pagina.set(pagina() + 1)" aria-label="Siguiente">&raquo;</button>
              </li>
            </ul>
          </nav>
        }
      } @else {
        <div class="estado-vacio text-center py-5">
          <img src="vacio.svg" alt="" width="180" height="140" class="mb-3" />
          <h2 class="h5">No encontramos temas</h2>
          <p class="text-body-secondary">Prueba con otra palabra clave o categoría.</p>
          @if (auth.autenticado()) {
            <a class="btn btn-primario" routerLink="/temas/nuevo">Sé el primero en publicar</a>
          }
        </div>
      }
    </section>
  `,
})
export class Explorar {
  protected readonly auth = inject(AuthService);
  protected readonly categorias = inject(CategoriaService);
  private readonly foro = inject(ForoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly params = toSignal(this.route.paramMap);
  private readonly query = toSignal(this.route.queryParamMap);

  protected texto = '';
  protected readonly orden = signal<OrdenPublicaciones>('recientes');
  protected readonly pagina = signal(1);

  /** Categoría desde la ruta /categorias/:id o desde ?cat= */
  protected readonly idCategoria = computed<number | null>(() => {
    const valor = this.params()?.get('id') ?? this.query()?.get('cat');
    const id = Number(valor);
    return valor && Number.isInteger(id) ? id : null;
  });

  protected readonly categoria = computed(() => {
    const id = this.idCategoria();
    return id === null || !this.params()?.get('id') ? undefined : this.categorias.buscarPorId(id);
  });

  protected readonly busqueda = computed(() => this.query()?.get('q') ?? '');

  protected readonly resultados = computed(() =>
    this.foro.buscar(this.busqueda(), this.idCategoria(), this.orden()),
  );

  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.resultados().length / POR_PAGINA)));
  protected readonly paginas = computed(() => Array.from({ length: this.totalPaginas() }, (_, i) => i + 1));
  protected readonly paginados = computed(() => {
    const inicio = (Math.min(this.pagina(), this.totalPaginas()) - 1) * POR_PAGINA;
    return this.resultados().slice(inicio, inicio + POR_PAGINA);
  });

  constructor() {
    this.texto = this.route.snapshot.queryParamMap.get('q') ?? '';
  }

  protected aplicarBusqueda(): void {
    this.pagina.set(1);
    const q = this.texto.trim();
    this.router.navigate([], { relativeTo: this.route, queryParams: { q: q || null }, queryParamsHandling: 'merge' });
  }

  protected cambiarCategoria(id: number | null): void {
    this.pagina.set(1);
    const q = this.texto.trim() || null;
    if (id === null) {
      this.router.navigate(['/buscar'], { queryParams: { q } });
    } else {
      this.router.navigate(['/categorias', id], { queryParams: { q } });
    }
  }
}
