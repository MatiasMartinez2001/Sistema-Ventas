import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { UsuarioService } from '../services/usuario.service';

export const usuarioGuard: CanActivateFn = (route, state) => {
  const usuarioService = inject(UsuarioService);
  const router = inject(Router);

  // Verificar si tiene nombre
  if (usuarioService.tieneNombre()) {
    return true;
  }

  // Redirigir a bienvenida si no tiene nombre
  router.navigate(['/bienvenida'], { replaceUrl: true });
  return false;
};

