import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class Button {
  @Input() text: string = 'Botón';
  @Input() type: string = 'button';
  @Input() classes: string = '';
}
