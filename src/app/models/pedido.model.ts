import { PedidoItem } from './pedido-item.model';

export interface Pedido {
  id: string;
  clienteId: string;
  clienteNombre: string;
  items: PedidoItem[];
  total: number;
  fechaCreacion: Date;
}

