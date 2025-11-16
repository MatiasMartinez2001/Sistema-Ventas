import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly STORAGE_KEY = 'sistema_ventas_productos';
  private productos = signal<Producto[]>([]);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarProductos();
    }
  }

  // Obtener todos los productos
  getProductos() {
    return this.productos.asReadonly();
  }

  // Agregar un nuevo producto
  agregarProducto(producto: Omit<Producto, 'id' | 'fechaCreacion'>): void {
    const nuevoProducto: Producto = {
      ...producto,
      id: this.generarId(),
      fechaCreacion: new Date()
    };

    const productosActuales = this.productos();
    this.productos.set([...productosActuales, nuevoProducto]);
    this.guardarEnLocalStorage();
  }

  // Eliminar un producto
  eliminarProducto(id: string): void {
    const productosActuales = this.productos();
    this.productos.set(productosActuales.filter(p => p.id !== id));
    this.guardarEnLocalStorage();
  }

  // Cargar productos desde LocalStorage
  private cargarProductos(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const datos = localStorage.getItem(this.STORAGE_KEY);
      if (datos) {
        const productos = JSON.parse(datos);
        // Convertir fechas de string a Date
        const productosConFechas = productos.map((p: any) => ({
          ...p,
          fechaCreacion: new Date(p.fechaCreacion)
        }));
        this.productos.set(productosConFechas);
      }
    } catch (error) {
      console.error('Error al cargar productos desde LocalStorage:', error);
      this.productos.set([]);
    }
  }

  // Guardar productos en LocalStorage
  private guardarEnLocalStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.productos()));
    } catch (error) {
      console.error('Error al guardar productos en LocalStorage:', error);
    }
  }

  // Generar ID único
  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

