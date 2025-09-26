import { Injectable } from '@angular/core';
import { ToastComponent } from '../components/toast/toast';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastContainer!: ToastComponent;

  register(container: ToastComponent) {
    this.toastContainer = container;
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    this.toastContainer.show(message, type);
  }
}
