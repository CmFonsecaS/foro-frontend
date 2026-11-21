import { Pipe, PipeTransform } from '@angular/core';

/** Muestra "1 tema" / "3 temas". Uso: {{ n | plural: 'tema' : 'temas' }} */
@Pipe({ name: 'plural' })
export class PluralPipe implements PipeTransform {
  transform(cantidad: number, singular: string, plural: string): string {
    return `${cantidad} ${cantidad === 1 ? singular : plural}`;
  }
}
