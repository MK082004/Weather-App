import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WeatherUtilsService {
  constructor() {}

  getSevenDayForecast(data: any): any[] {
    const weatherData = [];
    const uniqueDates = new Set(); 
    
    if (Array.isArray(data.list)) {
      for (let i = 0; i < data.list.length; i++) {
        const date = new Date(data.list[i].dt_txt).toDateString();
        if (!uniqueDates.has(date)) {
          weatherData.push(data.list[i]);
          uniqueDates.add(date);
        }
      }
      while (weatherData.length > 7) {
        weatherData.pop();
      }
    } else {
      if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
          const date = new Date(data[i].dt_txt).toDateString();
          if (!uniqueDates.has(date)) {
            weatherData.push(data[i]);
            uniqueDates.add(date);
          }
        }
        while (weatherData.length > 7) {
          weatherData.pop();
          console.log(weatherData);
        }
      } else if (data?.list && Array.isArray(data.list)) {
        for (let i = 0; i < data.list.length; i++) {
          const date = new Date(data.list[i].dt_txt).toDateString();
          if (!uniqueDates.has(date)) {
            weatherData.push(data.list[i]);
            uniqueDates.add(date);
          }
        }
        while (weatherData.length > 7) {
          weatherData.pop();
        }
      }
    }
    return weatherData;
  }
}


