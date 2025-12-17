import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'leadingZero',
  standalone: true
})
export class LeadingZeroPipe implements PipeTransform {
  transform(value: number | string): string {
    const num = Number(value);
    return num.toString().padStart(2, '0');
  }
}
