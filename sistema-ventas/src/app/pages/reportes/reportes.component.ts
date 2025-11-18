import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { Pedido } from '../../models/pedido.model';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';

interface EstadisticasVentas {
  totalIngresos: number;
  totalPedidos: number;
  promedioPedido: number;
  totalItemsVendidos: number;
}

interface ProductoVendido {
  producto: Producto;
  cantidadVendida: number;
  ingresosGenerados: number;
}

interface ClienteActivo {
  cliente: Cliente;
  cantidadPedidos: number;
  totalGastado: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css'
})
export class ReportesComponent implements OnInit {
  pedidos!: ReturnType<PedidoService['getPedidos']>;
  clientes!: ReturnType<ClienteService['getClientes']>;
  productos!: ReturnType<ProductoService['getProductos']>;

  estadisticas: EstadisticasVentas = {
    totalIngresos: 0,
    totalPedidos: 0,
    promedioPedido: 0,
    totalItemsVendidos: 0
  };

  productosMasVendidos: ProductoVendido[] = [];
  clientesMasActivos: ClienteActivo[] = [];

  fechaInicio: string = '';
  fechaFin: string = '';
  pedidosFiltrados: Pedido[] = [];

  constructor(
    private pedidoService: PedidoService,
    private clienteService: ClienteService,
    private productoService: ProductoService
  ) {}

  ngOnInit(): void {
    this.pedidos = this.pedidoService.getPedidos();
    this.clientes = this.clienteService.getClientes();
    this.productos = this.productoService.getProductos();

    // Inicializar fechas (últimos 30 días)
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);

    this.fechaFin = fechaFin.toISOString().split('T')[0];
    this.fechaInicio = fechaInicio.toISOString().split('T')[0];

    this.calcularReportes();
  }

  calcularReportes(): void {
    const todosLosPedidos = this.pedidos();
    
    // Filtrar pedidos por fecha si hay filtros
    if (this.fechaInicio && this.fechaFin) {
      this.pedidosFiltrados = todosLosPedidos.filter(pedido => {
        const fechaPedido = new Date(pedido.fechaCreacion);
        const inicio = new Date(this.fechaInicio);
        const fin = new Date(this.fechaFin);
        fin.setHours(23, 59, 59, 999); // Incluir todo el día final
        
        return fechaPedido >= inicio && fechaPedido <= fin;
      });
    } else {
      this.pedidosFiltrados = todosLosPedidos;
    }

    this.calcularEstadisticas();
    this.calcularProductosMasVendidos();
    this.calcularClientesMasActivos();
  }

  calcularEstadisticas(): void {
    const pedidos = this.pedidosFiltrados;
    
    this.estadisticas.totalPedidos = pedidos.length;
    this.estadisticas.totalIngresos = pedidos.reduce((total, pedido) => total + pedido.total, 0);
    this.estadisticas.promedioPedido = pedidos.length > 0 
      ? this.estadisticas.totalIngresos / pedidos.length 
      : 0;
    this.estadisticas.totalItemsVendidos = pedidos.reduce((total, pedido) => {
      return total + pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
    }, 0);
  }

  calcularProductosMasVendidos(): void {
    const productosMap = new Map<string, { producto: Producto; cantidad: number; ingresos: number }>();

    this.pedidosFiltrados.forEach(pedido => {
      pedido.items.forEach(item => {
        const productoId = item.producto.id;
        const existente = productosMap.get(productoId);

        if (existente) {
          existente.cantidad += item.cantidad;
          existente.ingresos += item.subtotal;
        } else {
          productosMap.set(productoId, {
            producto: item.producto,
            cantidad: item.cantidad,
            ingresos: item.subtotal
          });
        }
      });
    });

    this.productosMasVendidos = Array.from(productosMap.values())
      .map(item => ({
        producto: item.producto,
        cantidadVendida: item.cantidad,
        ingresosGenerados: item.ingresos
      }))
      .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
      .slice(0, 10); // Top 10
  }

  calcularClientesMasActivos(): void {
    const clientesMap = new Map<string, { cliente: Cliente; pedidos: number; total: number }>();

    this.pedidosFiltrados.forEach(pedido => {
      const clienteId = pedido.cliente.id;
      const existente = clientesMap.get(clienteId);

      if (existente) {
        existente.pedidos++;
        existente.total += pedido.total;
      } else {
        clientesMap.set(clienteId, {
          cliente: pedido.cliente,
          pedidos: 1,
          total: pedido.total
        });
      }
    });

    this.clientesMasActivos = Array.from(clientesMap.values())
      .map(item => ({
        cliente: item.cliente,
        cantidadPedidos: item.pedidos,
        totalGastado: item.total
      }))
      .sort((a, b) => b.totalGastado - a.totalGastado)
      .slice(0, 10); // Top 10
  }

  aplicarFiltros(): void {
    this.calcularReportes();
  }

  limpiarFiltros(): void {
    const fechaFin = new Date();
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - 30);

    this.fechaFin = fechaFin.toISOString().split('T')[0];
    this.fechaInicio = fechaInicio.toISOString().split('T')[0];
    this.calcularReportes();
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  formatearFecha(fecha: Date): string {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(fecha));
  }

  obtenerEstadosUnicos(): string[] {
    const estados = new Set<string>();
    this.pedidosFiltrados.forEach(pedido => {
      estados.add(pedido.estado || 'Pendiente');
    });
    return Array.from(estados);
  }

  contarPedidosPorEstado(estado: string): number {
    return this.pedidosFiltrados.filter(p => (p.estado || 'Pendiente') === estado).length;
  }

  obtenerVentasPorDia(): Array<{ fecha: string; cantidadPedidos: number; totalIngresos: number; itemsVendidos: number }> {
    const ventasPorDia = new Map<string, { cantidadPedidos: number; totalIngresos: number; itemsVendidos: number }>();

    this.pedidosFiltrados.forEach(pedido => {
      const fecha = new Date(pedido.fechaCreacion);
      const fechaStr = fecha.toLocaleDateString('es-AR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      });

      const existente = ventasPorDia.get(fechaStr);
      const itemsVendidos = pedido.items.reduce((sum, item) => sum + item.cantidad, 0);

      if (existente) {
        existente.cantidadPedidos++;
        existente.totalIngresos += pedido.total;
        existente.itemsVendidos += itemsVendidos;
      } else {
        ventasPorDia.set(fechaStr, {
          cantidadPedidos: 1,
          totalIngresos: pedido.total,
          itemsVendidos: itemsVendidos
        });
      }
    });

    return Array.from(ventasPorDia.entries())
      .map(([fecha, datos]) => ({ fecha, ...datos }))
      .sort((a, b) => {
        const fechaA = new Date(a.fecha.split('/').reverse().join('-'));
        const fechaB = new Date(b.fecha.split('/').reverse().join('-'));
        return fechaB.getTime() - fechaA.getTime();
      });
  }
}
