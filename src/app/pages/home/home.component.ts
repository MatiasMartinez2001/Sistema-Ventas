import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  nombreUsuario!: ReturnType<UsuarioService['getNombreUsuario']>;

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    // Inicializar el nombre después de que el servicio esté disponible
    this.nombreUsuario = this.usuarioService.getNombreUsuario();
  }
}

