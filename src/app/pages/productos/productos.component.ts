import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  formularioProducto: FormGroup;
  productos!: ReturnType<ProductoService['getProductos']>;
  mostrarFormulario = false;

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService
  ) {
    this.formularioProducto = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.min(0.01)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      categoria: ['']
    });
  }

  ngOnInit(): void {
    // Inicializar productos después de que el servicio esté disponible
    this.productos = this.productoService.getProductos();
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.formularioProducto.reset();
    }
  }

  onSubmit(): void {
    if (this.formularioProducto.valid) {
      const valores = this.formularioProducto.value;
      // Convertir precio y stock a números
      const producto = {
        ...valores,
        precio: parseFloat(valores.precio),
        stock: parseInt(valores.stock)
      };
      this.productoService.agregarProducto(producto);
      this.formularioProducto.reset();
      this.mostrarFormulario = false;
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.formularioProducto.controls).forEach(key => {
        this.formularioProducto.get(key)?.markAsTouched();
      });
    }
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      this.productoService.eliminarProducto(id);
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.formularioProducto.get(fieldName);
    if (field?.hasError('required') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }
    if (field?.hasError('min') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} debe ser mayor a ${field.errors?.['min'].min}`;
    }
    if (field?.hasError('minlength') && field?.touched) {
      return `${this.getFieldLabel(fieldName)} debe tener al menos ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nombre: 'Nombre',
      descripcion: 'Descripción',
      precio: 'Precio',
      stock: 'Stock',
      categoria: 'Categoría'
    };
    return labels[fieldName] || fieldName;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }
}

