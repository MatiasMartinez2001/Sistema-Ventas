import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  formularioLogin: FormGroup;
  mostrarRegistro = false;
  errorMensaje = '';
  exitoMensaje = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formularioLogin = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al home
    if (this.authService.estaAutenticado()) {
      this.router.navigate(['/']);
    }
  }

  onSubmit(): void {
    if (this.formularioLogin.valid) {
      const { username, password } = this.formularioLogin.value;
      
      if (this.mostrarRegistro) {
        // Registrar nuevo usuario
        this.registrarUsuario(username, password);
      } else {
        // Iniciar sesión
        this.iniciarSesion(username, password);
      }
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.formularioLogin.controls).forEach(key => {
        this.formularioLogin.get(key)?.markAsTouched();
      });
    }
  }

  iniciarSesion(username: string, password: string): void {
    this.errorMensaje = '';
    this.exitoMensaje = '';

    if (this.authService.login(username, password)) {
      this.router.navigate(['/']);
    } else {
      this.errorMensaje = 'Usuario o contraseña incorrectos';
    }
  }

  registrarUsuario(username: string, password: string): void {
    this.errorMensaje = '';
    this.exitoMensaje = '';

    // Para simplificar, usaremos el username como email y nombre
    const email = `${username}@sistema-ventas.com`;
    const nombre = username.charAt(0).toUpperCase() + username.slice(1);

    if (this.authService.registrarUsuario(username, email, nombre, password)) {
      this.exitoMensaje = 'Usuario registrado exitosamente. Ahora puedes iniciar sesión.';
      this.mostrarRegistro = false;
      this.formularioLogin.reset();
    } else {
      this.errorMensaje = 'El usuario o email ya existe';
    }
  }

  toggleModo(): void {
    this.mostrarRegistro = !this.mostrarRegistro;
    this.errorMensaje = '';
    this.exitoMensaje = '';
    this.formularioLogin.reset();
  }

  getFieldError(fieldName: string): string {
    const field = this.formularioLogin.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field?.hasError('minlength') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Usuario',
      password: 'Contraseña'
    };
    return labels[fieldName] || fieldName;
  }
}

