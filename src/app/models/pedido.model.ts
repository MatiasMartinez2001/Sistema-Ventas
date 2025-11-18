import { Cliente } from './cliente.model';
import { Producto } from './producto.model';

export interface ItemPedido {
  producto: Producto;
  cantidad: number;
  subtotal: number;
}

export interface Pedido {
  id: string;
  cliente: Cliente;
  items: ItemPedido[];
  total: number;
  fechaCreacion: Date;
  estado?: string;
}

