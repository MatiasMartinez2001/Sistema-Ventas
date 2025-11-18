import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import { ProductoService } from '../../services/producto.service';
import { PedidoService } from '../../services/pedido.service';
import { Cliente } from '../../models/cliente.model';
import { Producto } from '../../models/producto.model';
import { PedidoItem } from '../../models/pedido-item.model';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.css'
})
export class PedidosComponent implements OnInit {
  formularioPedido: FormGroup;
  clientes!: ReturnType<ClienteService['getClientes']>;
  productos!: ReturnType<ProductoService['getProductos']>;
  pedidos!: ReturnType<PedidoService['getPedidos']>;
  
  carrito: PedidoItem[] = [];
  clienteSeleccionado: Cliente | null = null;
  mostrarListaPedidos = false;

  // Calcular total del carrito
  totalCarrito = computed(() => {
    return this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
  });

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private pedidoService: PedidoService
  ) {
    this.formularioPedido = this.fb.group({
      clienteId: ['', Validators.required],
      productoId: ['', Validators.required],
      cantidad: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.clientes = this.clienteService.getClientes();
    this.productos = this.productoService.getProductos();
    this.pedidos = this.pedidoService.getPedidos();
    
    // Debug: verificar que los servicios estén funcionando
    console.log('Clientes cargados:', this.clientes().length);
    console.log('Productos cargados:', this.productos().length);
    console.log('Pedidos cargados:', this.pedidos().length);
  }

  seleccionarCliente(): void {
    const clienteId = this.formularioPedido.get('clienteId')?.value;
    if (clienteId) {
      const clientesList = this.clientes();
      this.clienteSeleccionado = clientesList.find(c => c.id === clienteId) || null;
    } else {
      this.clienteSeleccionado = null;
    }
  }

  agregarAlCarrito(): void {
    const productoId = this.formularioPedido.get('productoId')?.value;
    const cantidad = this.formularioPedido.get('cantidad')?.value;

    if (!productoId || !cantidad || cantidad < 1) {
      return;
    }

    const productosList = this.productos();
    const producto = productosList.find(p => p.id === productoId);

    if (!producto) {
      return;
    }

    // Verificar si el producto ya está en el carrito
    const itemExistente = this.carrito.find(item => item.productoId === productoId);

    if (itemExistente) {
      // Si ya existe, actualizar la cantidad
      itemExistente.cantidad += cantidad;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precioUnitario;
    } else {
      // Si no existe, agregar nuevo item
      const nuevoItem: PedidoItem = {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: producto.precio,
        subtotal: producto.precio * cantidad
      };
      this.carrito.push(nuevoItem);
    }

    // Resetear el formulario de producto
    this.formularioPedido.patchValue({
      productoId: '',
      cantidad: 1
    });
  }

  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
  }

  actualizarCantidad(item: PedidoItem, nuevaCantidad: number): void {
    if (nuevaCantidad < 1) {
      return;
    }
    item.cantidad = nuevaCantidad;
    item.subtotal = item.cantidad * item.precioUnitario;
  }

  crearPedido(): void {
    if (!this.clienteSeleccionado || this.carrito.length === 0) {
      alert('Debes seleccionar un cliente y agregar al menos un producto al carrito');
      return;
    }

    this.pedidoService.agregarPedido({
      clienteId: this.clienteSeleccionado.id,
      clienteNombre: this.clienteSeleccionado.nombre,
      items: [...this.carrito],
      total: this.totalCarrito()
    });

    // Limpiar el carrito y resetear formulario
    this.carrito = [];
    this.clienteSeleccionado = null;
    this.formularioPedido.reset();
    this.mostrarListaPedidos = true;
    
    alert('Pedido creado exitosamente');
  }

  eliminarPedido(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      this.pedidoService.eliminarPedido(id);
    }
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  }

  obtenerProductoPorId(productoId: string): Producto | undefined {
    const productosList = this.productos();
    return productosList.find(p => p.id === productoId);
  }
}
