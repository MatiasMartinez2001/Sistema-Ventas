import { Component, OnInit, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  nombreUsuario!: ReturnType<UsuarioService['getNombreUsuario']>;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    // Efecto para actualizar cuando cambie el nombre
    effect(() => {
      this.nombreUsuario = this.usuarioService.getNombreUsuario();
    });
  }

  ngOnInit(): void {
    // Inicializar el nombre después de que el servicio esté disponible
    this.nombreUsuario = this.usuarioService.getNombreUsuario();
  }

  cambiarNombre(): void {
    this.usuarioService.limpiarNombre();
    this.router.navigate(['/bienvenida']);
  }
}

