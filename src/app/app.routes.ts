import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { ReportesComponent } from './pages/reportes/reportes.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'clientes', component: ClientesComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'pedidos', component: PedidosComponent },
  { path: 'reportes', component: ReportesComponent },
  { path: '**', redirectTo: '' }
];
