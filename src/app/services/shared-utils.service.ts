import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SharedUtilsService {
  constructor() {}

  convertUnixTimestampToTime(unixTimestamp: number): string {
    const date = new Date(unixTimestamp * 1000); 
    const originalHours = date.getHours();
    const minutes = date.getMinutes();
    let amPm = 'AM';

    // Convert to 12-hour format and determine AM/PM
    let hours = originalHours;
    if (hours >= 12) {
      amPm = 'PM';
      if (hours > 12) {
        hours -= 12;
      }
    }

    return `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${amPm}`;
  }
}