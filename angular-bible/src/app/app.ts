import { Component } from '@angular/core';
import { Main } from './pages/main/main';

// PrimeNG Modules
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [Main, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
}
