import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css'
})
export class BienvenidaComponent implements OnInit {
  formularioNombre: FormGroup;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private router: Router
  ) {
    this.formularioNombre = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // Si ya tiene un nombre guardado, redirigir al home
    if (this.usuarioService.tieneNombre()) {
      this.router.navigate(['/'], { replaceUrl: true });
    }
  }

  onSubmit(): void {
    if (this.formularioNombre.valid) {
      const nombre = this.formularioNombre.value.nombre.trim();
      this.usuarioService.setNombreUsuario(nombre);
      this.router.navigate(['/']);
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.formularioNombre.controls).forEach(key => {
        this.formularioNombre.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.formularioNombre.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return 'El nombre es requerido';
    }
    if (field?.hasError('minlength') && field?.touched) {
      return 'El nombre debe tener al menos 2 caracteres';
    }
    return '';
  }
}

