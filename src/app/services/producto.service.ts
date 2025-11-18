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
        // Verificar si hay productos (si hay, usarlos; si no, inicializar)
        if (productosConFechas.length > 0) {
          this.productos.set(productosConFechas);
        } else {
          this.inicializarProductosCosmeticos();
        }
      } else {
        // Si no hay productos, inicializar con productos cosméticos de ejemplo
        this.inicializarProductosCosmeticos();
      }
    } catch (error) {
      console.error('Error al cargar productos desde LocalStorage:', error);
      this.inicializarProductosCosmeticos();
    }
  }

  // Método público para reinicializar productos (útil para limpiar y empezar de nuevo)
  reinicializarProductos(): void {
    this.inicializarProductosCosmeticos();
  }

  // Inicializar productos cosméticos de ejemplo
  private inicializarProductosCosmeticos(): void {
    const productosCosmeticos: Producto[] = [
      {
        id: this.generarId(),
        nombre: 'Base de Maquillaje Líquida',
        descripcion: 'Base de maquillaje de larga duración con acabado natural. Ideal para todo tipo de piel.',
        precio: 12500,
        stock: 45,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Labial Mate Premium',
        descripcion: 'Labial de larga duración con acabado mate. Disponible en múltiples tonos.',
        precio: 8500,
        stock: 60,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Crema Hidratante Facial',
        descripcion: 'Crema hidratante con ácido hialurónico. Nutre y revitaliza la piel del rostro.',
        precio: 9800,
        stock: 35,
        categoria: 'Cuidado de la Piel',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Máscara de Pestañas Volumizadora',
        descripcion: 'Máscara que proporciona volumen y longitud a las pestañas. Resistente al agua.',
        precio: 7200,
        stock: 50,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Paleta de Sombras',
        descripcion: 'Paleta con 12 tonos de sombras para ojos. Alta pigmentación y fácil difuminado.',
        precio: 15200,
        stock: 28,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Perfume Eau de Parfum',
        descripcion: 'Fragancia elegante y duradera. Notas florales y amaderadas.',
        precio: 18900,
        stock: 22,
        categoria: 'Fragancias',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Sérum Anti-Edad',
        descripcion: 'Sérum con vitamina C y retinol. Reduce arrugas y manchas de la piel.',
        precio: 16500,
        stock: 30,
        categoria: 'Cuidado de la Piel',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Delineador de Ojos Líquido',
        descripcion: 'Delineador de punta fina para trazos precisos. Resistente al agua y al smudge.',
        precio: 6800,
        stock: 42,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Corrector de Alta Cobertura',
        descripcion: 'Corrector cremoso de alta cobertura. Ideal para ocultar imperfecciones y ojeras.',
        precio: 9200,
        stock: 38,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Rubor en Polvo',
        descripcion: 'Rubor con acabado natural y duradero. Disponible en tonos rosados y melocotón.',
        precio: 7500,
        stock: 52,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Iluminador Líquido',
        descripcion: 'Iluminador que proporciona un brillo natural. Perfecto para resaltar pómulos y nariz.',
        precio: 8800,
        stock: 40,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Polvo Compacto',
        descripcion: 'Polvo compacto para fijar el maquillaje. Controla el brillo y prolonga la duración.',
        precio: 10200,
        stock: 33,
        categoria: 'Maquillaje',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Limpiador Facial',
        descripcion: 'Limpiador facial suave que elimina impurezas sin resecar la piel.',
        precio: 6500,
        stock: 48,
        categoria: 'Cuidado de la Piel',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Tónico Facial',
        descripcion: 'Tónico que equilibra el pH de la piel y prepara para la hidratación.',
        precio: 7200,
        stock: 41,
        categoria: 'Cuidado de la Piel',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Mascarilla Facial',
        descripcion: 'Mascarilla purificante con arcilla. Limpia profundamente los poros.',
        precio: 8900,
        stock: 29,
        categoria: 'Cuidado de la Piel',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Protector Solar FPS 50',
        descripcion: 'Protector solar de alta protección. No graso y de rápida absorción.',
        precio: 11200,
        stock: 36,
        categoria: 'Cuidado de la Piel',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Perfume Eau de Toilette',
        descripcion: 'Fragancia fresca y ligera. Perfecta para uso diario.',
        precio: 14500,
        stock: 25,
        categoria: 'Fragancias',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Agua de Colonia',
        descripcion: 'Colonia refrescante con notas cítricas. Ideal para el verano.',
        precio: 9800,
        stock: 31,
        categoria: 'Fragancias',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Bálsamo Labial',
        descripcion: 'Bálsamo hidratante para labios. Con manteca de karité y vitamina E.',
        precio: 4500,
        stock: 65,
        categoria: 'Cuidado de la Piel',
        fechaCreacion: new Date()
      },
      {
        id: this.generarId(),
        nombre: 'Cepillo de Maquillaje',
        descripcion: 'Set de 5 pinceles profesionales para aplicación de maquillaje.',
        precio: 12800,
        stock: 27,
        categoria: 'Accesorios',
        fechaCreacion: new Date()
      }
    ];

    this.productos.set(productosCosmeticos);
    this.guardarEnLocalStorage();
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

