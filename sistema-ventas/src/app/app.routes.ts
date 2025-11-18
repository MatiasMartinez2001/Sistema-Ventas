import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { ReportesComponent } from './pages/reportes/reportes.component';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { usuarioGuard } from './guards/usuario.guard';

export const routes: Routes = [
  { path: 'bienvenida', component: BienvenidaComponent },
  { path: 'login', redirectTo: '/bienvenida', pathMatch: 'full' },
  { path: '', component: HomeComponent, canActivate: [usuarioGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [usuarioGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [usuarioGuard] },
  { path: 'pedidos', component: PedidosComponent, canActivate: [usuarioGuard] },
  { path: 'reportes', component: ReportesComponent, canActivate: [usuarioGuard] },
  { path: '**', redirectTo: '' }
];
