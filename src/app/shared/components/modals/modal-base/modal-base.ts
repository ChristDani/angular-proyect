import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { IButtonsInFooter } from '../../../interfaces/modal-base.interfaces';

@Component({
  selector: 'app-modal-base',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-base.html',
  styleUrls: ['./modal-base.css'],
})
export class ModalBaseComponent {
  @Input() title: string = '';
  @Input() withHeader?: boolean = true;
  @Input() withFooter?: boolean = true;
  @Input() buttonsInFooter?: IButtonsInFooter | null = null;

  @Output() closeModal = new EventEmitter<void>();

  isOpen: boolean = false;

  /**
   * Abre el modal
   */
  open(): void {
    this.isOpen = true;
  }

  /**
   * Cierra el modal
   */
  close(): void {
    this.isOpen = false;
    this.closeModal.emit();
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
