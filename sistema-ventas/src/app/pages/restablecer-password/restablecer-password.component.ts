import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restablecer-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './restablecer-password.component.html',
  styleUrl: './restablecer-password.component.css'
})
export class RestablecerPasswordComponent implements OnInit {
  formularioRestablecer: FormGroup;
  errorMensaje = '';
  exitoMensaje = '';
  mostrarListaUsuarios = false;
  usuarios: any[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formularioRestablecer = this.fb.group({
      username: ['', [Validators.required]],
      nuevaPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('nuevaPassword');
    const confirmPassword = form.get('confirmarPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else if (confirmPassword) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  cargarUsuarios(): void {
    this.usuarios = this.authService.obtenerTodosLosUsuarios();
  }

  onSubmit(): void {
    if (this.formularioRestablecer.valid) {
      const { username, nuevaPassword } = this.formularioRestablecer.value;
      
      this.errorMensaje = '';
      this.exitoMensaje = '';

      if (!this.authService.existeUsuario(username)) {
        this.errorMensaje = 'El usuario no existe';
        return;
      }

      if (this.authService.restablecerPassword(username, nuevaPassword)) {
        this.exitoMensaje = `Contraseña restablecida exitosamente para el usuario "${username}"`;
        this.formularioRestablecer.reset();
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.errorMensaje = 'Error al restablecer la contraseña';
      }
    } else {
      Object.keys(this.formularioRestablecer.controls).forEach(key => {
        this.formularioRestablecer.get(key)?.markAsTouched();
      });
    }
  }

  seleccionarUsuario(username: string): void {
    this.formularioRestablecer.patchValue({ username });
    this.mostrarListaUsuarios = false;
  }

  getFieldError(fieldName: string): string {
    const field = this.formularioRestablecer.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field?.hasError('minlength') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    if (field?.hasError('passwordMismatch') && field?.touched) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Usuario',
      nuevaPassword: 'Nueva Contraseña',
      confirmarPassword: 'Confirmar Contraseña'
    };
    return labels[fieldName] || fieldName;
  }
}

