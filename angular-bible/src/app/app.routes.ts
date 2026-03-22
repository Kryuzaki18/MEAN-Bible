import { Routes } from '@angular/router';
import { Main } from './pages/main/main';

export const routes: Routes = [
  {
    path: 'home',
    component: Main
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
