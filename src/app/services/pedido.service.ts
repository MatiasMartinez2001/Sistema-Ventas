import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Pedido } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly STORAGE_KEY = 'sistema_ventas_pedidos';
  private pedidos = signal<Pedido[]>([]);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarPedidos();
    }
  }

  // Obtener todos los pedidos
  getPedidos() {
    return this.pedidos.asReadonly();
  }

  // Agregar un nuevo pedido
  agregarPedido(pedido: Omit<Pedido, 'id' | 'fechaCreacion'>): void {
    const nuevoPedido: Pedido = {
      ...pedido,
      id: this.generarId(),
      fechaCreacion: new Date()
    };

    const pedidosActuales = this.pedidos();
    this.pedidos.set([...pedidosActuales, nuevoPedido]);
    this.guardarEnLocalStorage();
  }

  // Eliminar un pedido
  eliminarPedido(id: string): void {
    const pedidosActuales = this.pedidos();
    this.pedidos.set(pedidosActuales.filter(p => p.id !== id));
    this.guardarEnLocalStorage();
  }

  // Cargar pedidos desde LocalStorage
  private cargarPedidos(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const datos = localStorage.getItem(this.STORAGE_KEY);
      if (datos) {
        const pedidos = JSON.parse(datos);
        // Convertir fechas de string a Date
        const pedidosConFechas = pedidos.map((p: any) => ({
          ...p,
          fechaCreacion: new Date(p.fechaCreacion)
        }));
        this.pedidos.set(pedidosConFechas);
      }
    } catch (error) {
      console.error('Error al cargar pedidos desde LocalStorage:', error);
      this.pedidos.set([]);
    }
  }

  // Guardar pedidos en LocalStorage
  private guardarEnLocalStorage(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.pedidos()));
    } catch (error) {
      console.error('Error al guardar pedidos en LocalStorage:', error);
    }
  }

  // Generar ID único
  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

