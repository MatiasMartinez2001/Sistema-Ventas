import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';
import { ItemPedido, Pedido } from '../../models/pedido.model';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit {
  clientes!: ReturnType<ClienteService['getClientes']>;
  productos!: ReturnType<ProductoService['getProductos']>;
  pedidos!: ReturnType<PedidoService['getPedidos']>;

  clienteSeleccionado: Cliente | null = null;
  carrito: ItemPedido[] = [];
  mostrarFormulario = false;
  mostrarHistorial = false;
  pedidoSeleccionado: Pedido | null = null;
  mostrarDetalles = false;
  categoriaFiltro: string = '';
  productosFiltrados = signal<Producto[]>([]);

  constructor(
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Inicializar los signals después de que los servicios estén disponibles
    this.clientes = this.clienteService.getClientes();
    this.productos = this.productoService.getProductos();
    this.pedidos = this.pedidoService.getPedidos();
    
    // Actualizar productos filtrados cuando cambien los productos
    // Usar setTimeout para asegurar que se ejecute después del ciclo de detección
    setTimeout(() => {
      this.productosFiltrados.set(this.productos());
      // Forzar detección de cambios para asegurar que los botones se muestren
      this.cdr.detectChanges();
    }, 0);
  }

  seleccionarCliente(cliente: Cliente): void {
    this.clienteSeleccionado = cliente;
  }

  agregarAlCarrito(producto: Producto): void {
    // Verificar si el producto ya está en el carrito
    const itemExistente = this.carrito.find(item => item.producto.id === producto.id);
    
    if (itemExistente) {
      // Si ya existe, aumentar la cantidad
      if (itemExistente.cantidad < producto.stock) {
        itemExistente.cantidad++;
        itemExistente.subtotal = itemExistente.cantidad * itemExistente.producto.precio;
      } else {
        alert(`No hay suficiente stock. Stock disponible: ${producto.stock}`);
      }
    } else {
      // Si no existe, agregarlo al carrito
      if (producto.stock > 0) {
        const nuevoItem: ItemPedido = {
          producto: producto,
          cantidad: 1,
          subtotal: producto.precio
        };
        this.carrito.push(nuevoItem);
        // Efecto visual: scroll suave al carrito
        setTimeout(() => {
          const carritoElement = document.querySelector('.carrito-section');
          if (carritoElement) {
            carritoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }, 100);
      } else {
        alert('Este producto no tiene stock disponible');
      }
    }
  }

  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
  }

  actualizarCantidad(item: ItemPedido, nuevaCantidad: number): void {
    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito(this.carrito.indexOf(item));
      return;
    }
    
    if (nuevaCantidad > item.producto.stock) {
      alert(`No hay suficiente stock. Stock disponible: ${item.producto.stock}`);
      item.cantidad = item.producto.stock;
    } else {
      item.cantidad = nuevaCantidad;
    }
    
    item.subtotal = item.cantidad * item.producto.precio;
  }

  calcularTotal(): number {
    return this.carrito.reduce((total, item) => total + item.subtotal, 0);
  }

  crearPedido(): void {
    if (!this.clienteSeleccionado) {
      alert('Por favor, selecciona un cliente');
      return;
    }

    if (this.carrito.length === 0) {
      alert('El carrito está vacío. Agrega productos antes de crear el pedido');
      return;
    }

    const nuevoPedido: Omit<Pedido, 'id' | 'fechaCreacion'> = {
      cliente: this.clienteSeleccionado,
      items: [...this.carrito],
      total: this.calcularTotal(),
      estado: 'Pendiente'
    };

    this.pedidoService.agregarPedido(nuevoPedido);
    
    // Limpiar el carrito y resetear
    this.carrito = [];
    this.clienteSeleccionado = null;
    this.mostrarFormulario = false;
    
    alert('Pedido creado exitosamente');
  }

  eliminarPedido(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      this.pedidoService.eliminarPedido(id);
    }
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.carrito = [];
      this.clienteSeleccionado = null;
    }
  }

  toggleHistorial(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  obtenerNombreCliente(cliente: Cliente): string {
    return cliente.nombre;
  }

  obtenerCantidadItems(pedido: Pedido): number {
    return pedido.items.reduce((total, item) => total + item.cantidad, 0);
  }

  verDetalles(pedido: Pedido): void {
    this.pedidoSeleccionado = pedido;
    this.mostrarDetalles = true;
  }

  cerrarDetalles(): void {
    this.mostrarDetalles = false;
    this.pedidoSeleccionado = null;
  }

  filtrarProductos(): void {
    if (!this.categoriaFiltro) {
      this.productosFiltrados.set(this.productos());
    } else {
      const filtrados = this.productos().filter(p => p.categoria === this.categoriaFiltro);
      this.productosFiltrados.set(filtrados);
    }
  }

  obtenerIconoProducto(categoria: string): string {
    const iconos: { [key: string]: string } = {
      'Maquillaje': '💄',
      'Cuidado de la Piel': '🧴',
      'Fragancias': '🌸',
      'Accesorios': '✨'
    };
    return iconos[categoria] || '🛍️';
  }
}
