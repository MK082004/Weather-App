import { Component, OnInit, Input } from '@angular/core';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons';
import { faArrowCircleDown } from '@fortawesome/free-solid-svg-icons';
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons';
import { faFaceFlushed } from '@fortawesome/free-solid-svg-icons';
import { faThumbsDown } from '@fortawesome/free-solid-svg-icons';
import { faWind } from '@fortawesome/free-solid-svg-icons'
import { WeatherService } from '../services/weather.service';
import { WeatherDataService } from '../services/weather-data.service';
import { WeatherUtilsService } from '../services/weather-utils.service';
import { SharedUtilsService } from '../services/shared-utils.service';
import { WeatherTempService } from '../services/Weather.Temp.Service';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'app-right-container',
  templateUrl: './right-container.component.html',
  styleUrls: ['./right-container.component.css']
})

export class RightContainerComponent implements OnInit {
  weatherData: any = [];
  timeline: any = [];
  weatherNow: any;
  currentTime = new Date();
  location: any;
  sunriseTime: string = '';
  sunsetTime: string = '';
  windSpeed: number = 0;
  visibilityKm: number = 0;
  @Input() populationPercentage: number = 0; 
  

  constructor(
    private weatherService: WeatherService,
    private weatherDataService: WeatherDataService,
    private weatherUtilsService: WeatherUtilsService,
    private sharedUtilsService: SharedUtilsService,
    private weatherTempService: WeatherTempService
  ) { }

  // Font icons variables for right container
  faLocationDot: any = faLocationDot;
  faArrowCircleUp: any = faArrowCircleUp;
  faArrowCircleDown: any = faArrowCircleDown;
  faThumbsUp: any = faThumbsUp;
  faFaceFlushed: any = faFaceFlushed;
  faThumbsDown: any = faThumbsDown;
  faWind:any = faWind;

  // Variables for controlling tab values & states
  today: boolean = false;
  week: boolean = true;
  celsius: boolean = true;
  fahrenheit: boolean = false;
  selectedUnit: string = 'C';
  selectedUnitTemp: 'Celsius' | 'Fahrenheit' = 'Celsius';
  message: string = '';

  // Function to determine the message based on the percentage
  determineMessage(percentage: number): string {
    if (percentage >= 80) {
      return 'Good';
    } else if (percentage >= 60) {
      return 'Average';
    } else {
      return 'Normal';
    }
  }

  // Define humidity ranges and messages
  humidityRanges = [
    { min: 0, max: 40, message: 'Low Humidity' },
    { min: 41, max: 70, message: 'Moderate Humidity' },
    { min: 71, max: 100, message: 'High Humidity' }
  ];

  // Function to determine the message based on humidity
  determineHumidityMessage(humidity: number): string {
    for (const range of this.humidityRanges) {
      if (humidity >= range.min && humidity <= range.max) {
        return range.message;
      }
    }
    return '';
  }

  ngOnInit(): void {
    this.weatherService.getWeatherForecast().subscribe((data: any) => {
      this.getTodayForecast(data);
      const visibilityMeters = data.list[0].visibility;
      this.visibilityKm = visibilityMeters / 1000;
      this.message = this.determineMessage(visibilityMeters);

      const sunriseTimestamp = data.city && data.city.sunrise;
      const sunsetTimestamp = data.city && data.city.sunset;

      if (sunriseTimestamp && sunsetTimestamp) {
        this.sunriseTime = this.sharedUtilsService.convertUnixTimestampToTime(sunriseTimestamp);
        this.sunsetTime = this.sharedUtilsService.convertUnixTimestampToTime(sunsetTimestamp);
      }
    });

    // Check if a country has been specified in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const country = urlParams.get('country');

    if (country) {
      // Fetch weather data by country
      this.weatherService.getWeatherByCountry(country).subscribe((data) => {
        this.weatherData = this.weatherUtilsService.getSevenDayForecast(data);
        this.getTodayForecast(data);
      });
    } else {
      // Fetch the initial weather data using geolocation
      this.weatherService.getWeatherForecast().pipe(pluck('list')).subscribe((data) => {
        this.weatherData = this.weatherUtilsService.getSevenDayForecast(data);
      });

      this.weatherService.getWeatherForecast().subscribe((data) => {
        this.getTodayForecast(data);
      });

      this.weatherDataService.weatherData$.subscribe((data) => {
        if (data) {
          this.weatherData = this.weatherUtilsService.getSevenDayForecast(data);
          this.getTodayForecast(data);
        }
      });
    }
  }

  // Function to handle tab click: Today
  OnTodayClick() {
    this.today = true;
    this.week = false;
  }

  // Function to handle tab click: Week
  OnWeekClick() {
    this.week = true;
    this.today = false;
  }

  // Function to handle metric value click: Celsius
  OnCelsiusClick() {
    this.celsius = true;
    this.fahrenheit = false;
    this.selectedUnit = 'C';
    this.selectedUnitTemp = 'Celsius';
    this.weatherTempService.updateTemperatureUnit('Celsius');
  }

  // Function to handle metric value click: Fahrenheit
  OnFahrenheitClick() {
    this.fahrenheit = true;
    this.celsius = false;
    this.selectedUnit = 'F';
    this.selectedUnitTemp = 'Fahrenheit';
    this.weatherTempService.updateTemperatureUnit('Fahrenheit');
  }

  getFormattedWindSpeed(): string {
    const windSpeedInKmPerHour = this.windSpeed * 3.6; 
    const windSpeedInMph = windSpeedInKmPerHour / 1.609344; 
    if (this.selectedUnitTemp === 'Fahrenheit') {
      return `${windSpeedInMph.toFixed(2)}`;
    } else {
      return `${windSpeedInKmPerHour.toFixed(2)}`;
    }
  }

  getFormattedVisibility(): string {
    const visibilityInKm = this.visibilityKm; 
    const visibilityInMi = visibilityInKm * 0.621371; 
    if (this.selectedUnitTemp === 'Fahrenheit') {
      return `${visibilityInMi.toFixed(2)}`;
    } else {
      return `${visibilityInKm.toFixed(2)}`;
    }
  }
  
  // Function to format date range for today's forecast
  dateRange() {
    const start = new Date();
    start.setHours(start.getHours() + (start.getTimezoneOffset() / 60))
    const to = new Date(start);
    to.setHours(to.getHours() + 2, to.getMinutes() + 59, to.getSeconds() + 59);

    return { start, to }
  }

  // Function to get today's forecast
  getTodayForecast(today: any) {
    this.location = today.city;
    this.timeline = [];

    // Update sunrise and sunset times
    const sunriseTimestamp = today.city.sunrise;
    const sunsetTimestamp = today.city.sunset;

    // Convert timestamps to formatted times
    this.sunriseTime = this.sharedUtilsService.convertUnixTimestampToTime(sunriseTimestamp);
    this.sunsetTime = this.sharedUtilsService.convertUnixTimestampToTime(sunsetTimestamp);
    this.windSpeed = today.list[0]?.wind.speed;

    for (const forecast of today.list.slice(0, 6)) {
      this.timeline.push({
        time: forecast.dt_txt,
        temp: forecast.main.temp
      });

      const apiDate = new Date(forecast.dt_txt).getTime();

      if (this.dateRange().start.getTime() <= apiDate && this.dateRange().to.getTime() >= apiDate) {
        this.weatherNow = forecast;
      }
    }
  }

} 