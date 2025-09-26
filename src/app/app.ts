import { Component, signal, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast';
import { ToastService } from './shared/services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('bank-app');
  @ViewChild('toastRef') toastContainer!: ToastComponent;

  constructor(private toastService: ToastService) {}

  ngAfterViewInit(): void {
    this.toastService.register(this.toastContainer);
  }
}
