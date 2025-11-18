import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  formularioCliente: FormGroup;
  clientes!: ReturnType<ClienteService['getClientes']>;
  mostrarFormulario = false;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService
  ) {
    this.formularioCliente = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required]],
      direccion: ['']
    });
  }

  ngOnInit(): void {
    // Inicializar clientes después de que el servicio esté disponible
    this.clientes = this.clienteService.getClientes();
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.formularioCliente.reset();
    }
  }

  onSubmit(): void {
    if (this.formularioCliente.valid) {
      this.clienteService.agregarCliente(this.formularioCliente.value);
      this.formularioCliente.reset();
      this.mostrarFormulario = false;
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.formularioCliente.controls).forEach(key => {
        this.formularioCliente.get(key)?.markAsTouched();
      });
    }
  }

  eliminarCliente(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clienteService.eliminarCliente(id);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.formularioCliente.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field?.hasError('email') && field?.touched) {
      return 'Email inválido';
    }
    if (field?.hasError('minlength') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      email: 'Email',
      telefono: 'Teléfono',
      direccion: 'Dirección'
    };
    return labels[fieldName] || fieldName;
  }
}

