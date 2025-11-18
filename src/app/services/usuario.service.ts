import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly STORAGE_KEY = 'sistema_ventas_nombre_usuario';
  private nombreUsuario = signal<string | null>(null);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarNombreUsuario();
    }
  }

  // Obtener nombre del usuario
  getNombreUsuario() {
    return this.nombreUsuario.asReadonly();
  }

  // Establecer nombre del usuario
  setNombreUsuario(nombre: string): void {
    this.nombreUsuario.set(nombre);
    if (isPlatformBrowser(this.platformId)) {
      try {
        localStorage.setItem(this.STORAGE_KEY, nombre);
      } catch (error) {
        console.error('Error al guardar nombre de usuario:', error);
      }
    }
  }

  // Verificar si hay un nombre guardado
  tieneNombre(): boolean {
    return this.nombreUsuario() !== null && this.nombreUsuario()!.trim() !== '';
  }

  // Cargar nombre desde LocalStorage
  private cargarNombreUsuario(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      // Limpiar datos antiguos del sistema de login si existen
      const oldAuthKey = 'sistema_ventas_usuario_actual';
      if (localStorage.getItem(oldAuthKey)) {
        localStorage.removeItem(oldAuthKey);
      }
      
      const nombre = localStorage.getItem(this.STORAGE_KEY);
      if (nombre && nombre.trim() !== '') {
        this.nombreUsuario.set(nombre.trim());
      }
    } catch (error) {
      console.error('Error al cargar nombre de usuario:', error);
    }
  }

  // Limpiar nombre (opcional, para logout)
  limpiarNombre(): void {
    this.nombreUsuario.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

