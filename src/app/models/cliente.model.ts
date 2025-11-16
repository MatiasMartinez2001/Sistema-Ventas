export interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion?: string;
  fechaCreacion: Date;
}

