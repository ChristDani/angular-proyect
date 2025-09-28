import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transactionDateTime',
  standalone: true
})
export class TransactionDateTimePipe implements PipeTransform {
  
  private months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  transform(value: string | Date): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const isToday = this.isToday(date, now);
    const isYesterday = this.isYesterday(date, now);

    if (isToday) {
      // Si es hoy, mostrar solo la hora
      return this.formatTime(date);
    } else if (isYesterday) {
      // Si es ayer, mostrar "Ayer HH:mm"
      return `Ayer ${this.formatTime(date)}`;
    } else {
      // Si es otro día, mostrar "DD mes HH:mm"
      const day = date.getDate();
      const month = this.months[date.getMonth()];
      const time = this.formatTime(date);
      return `${day} ${month} ${time}`;
    }
  }

  private isToday(date: Date, now: Date): boolean {
    return date.getDate() === now.getDate() &&
           date.getMonth() === now.getMonth() &&
           date.getFullYear() === now.getFullYear();
  }

  private isYesterday(date: Date, now: Date): boolean {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    return date.getDate() === yesterday.getDate() &&
           date.getMonth() === yesterday.getMonth() &&
           date.getFullYear() === yesterday.getFullYear();
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}