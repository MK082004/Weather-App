import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  constructor(private http: HttpClient) { }

  getWeatherForecast(): Observable<any> {
    return new Observable((observer) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          observer.next(position);
        },
        (error) => {
          observer.next(error);
        }
      );
    }).pipe(
      map((value: any) => {
        return new HttpParams()
          .set('lon', value.coords.longitude.toString())
          .set('lat', value.coords.latitude.toString())
          .set('units', 'metric')
          .set('appid', '1e13b63d2c5a4221d55f867fd48bef78');
      }),
      switchMap((values) => {
        return this.http.get('https://api.openweathermap.org/data/2.5/forecast', { params: values });
      })
    );
  }

  getWeatherByCountry(country: string): Observable<any> {
    const params = new HttpParams()
      .set('q', country)
      .set('units', 'metric')
      .set('appid', '1e13b63d2c5a4221d55f867fd48bef78');
    return this.http.get('https://api.openweathermap.org/data/2.5/forecast', { params })
      .pipe(
        catchError(error => {
          console.error('API Error:', error);
          throw error;
        })
      );
  }

  getTimeByCountry(country: string): string {
    return moment.tz(country).format('YYYY-MM-DD HH:mm:ss');
  }
}
