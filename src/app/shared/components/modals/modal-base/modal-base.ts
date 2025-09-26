import {
  Component,
  EventEmitter,
  Input,
  Output,
  ContentChild,
  AfterContentInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-base',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-base.html',
  styleUrls: ['./modal-base.css'],
})
export class ModalBaseComponent implements AfterContentInit {
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() centered: boolean = true;
  @Input() scrollable: boolean = false;
  @Input() animation: boolean = true;

  @Output() closeModal = new EventEmitter<void>();
  @Output() beforeClose = new EventEmitter<void>();
  @Output() afterClose = new EventEmitter<void>();
  @Output() afterOpen = new EventEmitter<void>();

  isOpen: boolean = false;
  hasFooterContent: boolean = false;

  @ContentChild('[footer]') footerContent: any;

  ngAfterContentInit() {
    this.hasFooterContent = !!this.footerContent;
  }

  /**
   * Abre el modal
   */
  open(): void {
    this.isOpen = true;
    setTimeout(() => this.afterOpen.emit(), 300);
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.beforeClose.emit();
    this.isOpen = false;
    setTimeout(() => {
      this.closeModal.emit();
      this.afterClose.emit();
    }, 300);
  }

  /**
   * Manejador del botón de cerrar
   */
  onClose(): void {
    this.close();
  }

  /**
   * Evita que los clics dentro del modal se propaguen al backdrop
   */
  onModalClick(event: Event): void {
    event.stopPropagation();
  }
}
