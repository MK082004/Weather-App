import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WeatherTempService {
  private temperatureUnitSubject = new BehaviorSubject<string>('C');
  temperatureUnit$ = this.temperatureUnitSubject.asObservable();

  constructor() {}
  updateTemperatureUnit(unit: string) {
    this.temperatureUnitSubject.next(unit);
  }
}
