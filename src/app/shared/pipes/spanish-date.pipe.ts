import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spanishDate',
  standalone: true
})
export class SpanishDatePipe implements PipeTransform {
  
  private months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  transform(value: string | Date, format: string = 'd MMMM'): string {
    if (!value) return '';
    
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) {
      return '';
    }

    const day = date.getDate();
    const month = this.months[date.getMonth()];
    const year = date.getFullYear();

    switch (format) {
      case 'd MMMM':
        return `${day} ${month}`;
      case 'd MMMM yyyy':
        return `${day} ${month} ${year}`;
      default:
        return `${day} ${month}`;
    }
  }
}