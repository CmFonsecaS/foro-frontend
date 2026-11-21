import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './layout/footer';
import { Navbar } from './layout/navbar';
import { ModalConfirmacion } from './shared/modal-confirmacion';
import { Toasts } from './shared/toasts';

/**
 * Componente raíz (layout principal): barra de navegación, contenido por ruta,
 * pie de página, notificaciones y modal de confirmación global.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Toasts, ModalConfirmacion],
  templateUrl: './app.html',
})
export class App {}
