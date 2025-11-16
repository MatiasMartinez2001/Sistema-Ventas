import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="d-flex flex-column min-vh-100" style="background-color: #f0f0f0;">
      <!-- SISTEMA DE VENTAS - NAMECKSOFT Y BIGGETE -->
      <app-navbar></app-navbar>
      <main class="flex-grow-1">
        <router-outlet />
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sistema-ventas');
}

