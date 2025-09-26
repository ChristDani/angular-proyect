import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  imports: [CommonModule],
})
export class ToastComponent {
  toasts: Toast[] = [];

  show(message: string, type: Toast['type'] = 'info') {
    const toast: Toast = {
      id: Date.now(),
      message,
      type,
    };

    this.toasts.push(toast);

    setTimeout(() => {
      this.toasts = this.toasts.filter(t => t.id !== toast.id);
    }, 3000);
  }
}
