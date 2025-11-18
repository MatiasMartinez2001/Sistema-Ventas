import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface Usuario {
  id: string;
  username: string;
  email: string;
  nombre: string;
  fechaCreacion: Date;
}

interface UsuarioConPassword extends Usuario {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'sistema_ventas_usuario_actual';
  private readonly USUARIOS_KEY = 'sistema_ventas_usuarios';
  private readonly PASSWORDS_KEY = 'sistema_ventas_passwords';
  private usuarioActual = signal<Usuario | null>(null);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.cargarUsuarioActual();
      this.inicializarPasswordsPorDefecto();
    }
  }

  // Inicializar contraseñas por defecto si no existen
  private inicializarPasswordsPorDefecto(): void {
    const passwords = this.obtenerPasswords();
    let necesitaGuardar = false;

    // Asegurar que las contraseñas por defecto existan
    if (!passwords['1']) {
      passwords['1'] = 'admin123';
      necesitaGuardar = true;
    }
    if (!passwords['2']) {
      passwords['2'] = 'admin123';
      necesitaGuardar = true;
    }

    if (necesitaGuardar) {
      try {
        localStorage.setItem(this.PASSWORDS_KEY, JSON.stringify(passwords));
      } catch (error) {
        console.error('Error al inicializar contraseñas por defecto:', error);
      }
    }
  }

  // Obtener usuario actual
  getUsuarioActual() {
    return this.usuarioActual.asReadonly();
  }

  // Verificar si el usuario está autenticado
  estaAutenticado(): boolean {
    return this.usuarioActual() !== null;
  }

  // Iniciar sesión
  login(username: string, password: string): boolean {
    const usuarios = this.obtenerUsuarios();
    const usuario = usuarios.find(u => u.username === username);

    if (!usuario) {
      return false;
    }

    // Obtener contraseña guardada
    const passwords = this.obtenerPasswords();
    const passwordGuardada = passwords[usuario.id];

    // Validar contraseña
    // En producción, esto debería usar hash de contraseñas
    if (passwordGuardada && password === passwordGuardada) {
      this.usuarioActual.set(usuario);
      this.guardarUsuarioActual(usuario);
      return true;
    }

    return false;
  }

  // Cerrar sesión
  logout(): void {
    this.usuarioActual.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.router.navigate(['/login']);
  }

  // Registrar nuevo usuario (opcional)
  registrarUsuario(username: string, email: string, nombre: string, password: string): boolean {
    const usuarios = this.obtenerUsuarios();
    
    // Verificar si el usuario ya existe
    if (usuarios.some(u => u.username === username || u.email === email)) {
      return false;
    }

    const nuevoUsuario: Usuario = {
      id: this.generarId(),
      username,
      email,
      nombre,
      fechaCreacion: new Date()
    };

    usuarios.push(nuevoUsuario);
    this.guardarUsuarios(usuarios);
    
    // Guardar la contraseña
    // En producción, esto debería guardar un hash de la contraseña
    this.guardarPassword(nuevoUsuario.id, password);
    
    return true;
  }

  // Obtener usuarios guardados
  private obtenerUsuarios(): Usuario[] {
    if (!isPlatformBrowser(this.platformId)) {
      return this.getUsuariosPorDefecto();
    }

    const usuariosPorDefecto = this.getUsuariosPorDefecto();
    let usuarios: Usuario[] = [];

    try {
      const datos = localStorage.getItem(this.USUARIOS_KEY);
      if (datos) {
        usuarios = JSON.parse(datos).map((u: any) => ({
          ...u,
          fechaCreacion: new Date(u.fechaCreacion)
        }));
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }

    // Combinar usuarios por defecto con usuarios registrados
    // Evitar duplicados
    const usuariosCombinados = [...usuariosPorDefecto];
    usuarios.forEach(usuario => {
      if (!usuariosCombinados.some(u => u.id === usuario.id || u.username === usuario.username)) {
        usuariosCombinados.push(usuario);
      }
    });

    // Guardar la lista combinada
    if (usuariosCombinados.length > usuariosPorDefecto.length) {
      this.guardarUsuarios(usuariosCombinados);
    }

    return usuariosCombinados;
  }

  // Obtener todos los usuarios (método público para administración)
  obtenerTodosLosUsuarios(): Usuario[] {
    return this.obtenerUsuarios();
  }

  // Restablecer contraseña de un usuario
  restablecerPassword(username: string, nuevaPassword: string): boolean {
    const usuarios = this.obtenerUsuarios();
    const usuario = usuarios.find(u => u.username === username);

    if (!usuario) {
      return false;
    }

    this.guardarPassword(usuario.id, nuevaPassword);
    return true;
  }

  // Verificar si un usuario existe
  existeUsuario(username: string): boolean {
    const usuarios = this.obtenerUsuarios();
    return usuarios.some(u => u.username === username);
  }

  // Usuarios por defecto
  private getUsuariosPorDefecto(): Usuario[] {
    const usuarios = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@sistema-ventas.com',
        nombre: 'Administrador',
        fechaCreacion: new Date()
      },
      {
        id: '2',
        username: 'vendedor',
        email: 'vendedor@sistema-ventas.com',
        nombre: 'Vendedor',
        fechaCreacion: new Date()
      }
    ];
    
    // Guardar contraseñas por defecto
    this.guardarPassword('1', 'admin123');
    this.guardarPassword('2', 'admin123');
    
    return usuarios;
  }

  // Obtener contraseñas guardadas
  private obtenerPasswords(): { [key: string]: string } {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }

    try {
      const datos = localStorage.getItem(this.PASSWORDS_KEY);
      if (datos) {
        return JSON.parse(datos);
      }
    } catch (error) {
      console.error('Error al cargar contraseñas:', error);
    }

    return {};
  }

  // Guardar contraseña
  private guardarPassword(usuarioId: string, password: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const passwords = this.obtenerPasswords();
      passwords[usuarioId] = password;
      localStorage.setItem(this.PASSWORDS_KEY, JSON.stringify(passwords));
    } catch (error) {
      console.error('Error al guardar contraseña:', error);
    }
  }

  // Guardar usuarios
  private guardarUsuarios(usuarios: Usuario[]): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(this.USUARIOS_KEY, JSON.stringify(usuarios));
    } catch (error) {
      console.error('Error al guardar usuarios:', error);
    }
  }

  // Cargar usuario actual desde LocalStorage
  private cargarUsuarioActual(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const datos = localStorage.getItem(this.STORAGE_KEY);
      if (datos) {
        const usuario = JSON.parse(datos);
        this.usuarioActual.set({
          ...usuario,
          fechaCreacion: new Date(usuario.fechaCreacion)
        });
      }
    } catch (error) {
      console.error('Error al cargar usuario actual:', error);
    }
  }

  // Guardar usuario actual en LocalStorage
  private guardarUsuarioActual(usuario: Usuario): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
    } catch (error) {
      console.error('Error al guardar usuario actual:', error);
    }
  }

  // Generar ID único
  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

