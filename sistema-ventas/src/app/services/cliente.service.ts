import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Cliente } from '../models/cliente.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly STORAGE_KEY = 'sistema_ventas_clientes';
  private clientes = signal<Cliente[]>([]);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarClientes();
    }
  }

  // Obtener todos los clientes
  getClientes() {
    return this.clientes.asReadonly();
  }

  // Agregar un nuevo cliente
  agregarCliente(cliente: Omit<Cliente, 'id' | 'fechaCreacion'>): void {
    const nuevoCliente: Cliente = {
      ...cliente,
      id: this.generarId(),
      fechaCreacion: new Date()
    };

    const clientesActuales = this.clientes();
    this.clientes.set([...clientesActuales, nuevoCliente]);
    this.guardarEnLocalStorage();
  }

  // Eliminar un cliente
  eliminarCliente(id: string): void {
    const clientesActuales = this.clientes();
    this.clientes.set(clientesActuales.filter(c => c.id !== id));
    this.guardarEnLocalStorage();
  }

  // Cargar clientes desde LocalStorage
  private cargarClientes(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const datos = localStorage.getItem(this.STORAGE_KEY);
      if (datos) {
        const clientes = JSON.parse(datos);
        // Convertir fechas de string a Date
        const clientesConFechas = clientes.map((c: any) => ({
          ...c,
          fechaCreacion: new Date(c.fechaCreacion)
        }));
        this.clientes.set(clientesConFechas);
      }
    } catch (error) {
      console.error('Error al cargar clientes desde LocalStorage:', error);
      this.clientes.set([]);
    }
  }

  // Guardar clientes en LocalStorage
  private guardarEnLocalStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.clientes()));
    } catch (error) {
      console.error('Error al guardar clientes en LocalStorage:', error);
    }
  }

  // Generar ID único
  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

