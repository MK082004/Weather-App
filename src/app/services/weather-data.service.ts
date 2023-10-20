import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherDataService {
  private weatherDataSubject = new BehaviorSubject<any>(null);
  weatherData$ = this.weatherDataSubject.asObservable();

  updateWeatherData(data: any) {
    this.weatherDataSubject.next(data);
  }

  private temperatureUnitSubject = new BehaviorSubject<string>('metric');
  temperatureUnit$ = this.temperatureUnitSubject.asObservable();

  setTemperatureUnit(unit: string) {
    this.temperatureUnitSubject.next(unit);
  }
}
