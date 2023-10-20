import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { faLocation } from '@fortawesome/free-solid-svg-icons';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import { faCloudRain } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../services/weather.service';
import { WeatherDataService } from '../services/weather-data.service';
import { WeatherUtilsService } from '../services/weather-utils.service';
import { SharedUtilsService } from '../services/shared-utils.service';
import { WeatherTempService } from '../services/Weather.Temp.Service';
import { UnsplashService } from '../services/unsplash.service';
import * as moment from 'moment-timezone';

@Component({
  selector: 'app-left-container',
  templateUrl: './left-container.component.html',
  styleUrls: ['./left-container.component.css']
})
export class LeftContainerComponent implements OnInit {

  weatherData: any = [];
  timeline: any = [];
  weatherNow: any;
  location: any;
  formattedTime: string = '';
  formattedDay: string = '';
  dayWiseData: any[] = [];
  searchCountry: string = '';
  sunriseTime: string = '';
  sunsetTime: string = '';
  visibilityKm: number = 0;
  rainPercentage: number = 0;
  populationPercentage: number = 0;
  message2: string = '';
  selectedUnitTemp: string = 'C';
  countryName: string = '';
  countryImage: string = '';

  constructor(
    private weatherService: WeatherService,
    private weatherDataService: WeatherDataService,
    private weatherUtilsService: WeatherUtilsService,
    private sharedUtilsService: SharedUtilsService,
    private weatherTempService: WeatherTempService,
    private unsplashService: UnsplashService) {
    const currentTimeLocal = moment().format('hh:mm A');
    const currentTimeLocal2 = moment().format('ddd');
    this.formattedTime = currentTimeLocal;
    this.formattedDay = currentTimeLocal2;
    this.weatherDataService.temperatureUnit$.subscribe(unit => {
    });
  }

  @Output() populationPercentageUpdated = new EventEmitter<number>();

  fetchCountryImage() {
    this.unsplashService.searchCountryImage(this.countryName).subscribe(
      (data: any) => {
        const imageUrl = data.results[0]?.urls?.regular;
        if (imageUrl) {
          this.countryImage = imageUrl;
        }
      },
      (error) => {
        console.error('Error fetching country image:', error);
      }
    );
  }

  // variables for fontawesome icons
  faMagnifyingGlass: any = faMagnifyingGlass;
  faLocation: any = faLocation;
  faCloud: any = faCloud;
  faCloudRain: any = faCloudRain;


  // Function to determine the message based on the percentage
  determineMessage2(percentage2: number): string {
    if (percentage2 <= 20) {
      return 'Good';
    } else if (percentage2 >= 1000) {
      return 'Average';
    } else {
      return 'Normal';
    }
  }

  ngOnInit(): void {
    this.weatherService.getWeatherForecast().subscribe((data) => {
      this.getTodayForecast(data);
      this.organizeDataByDay();
    });

    this.weatherTempService.temperatureUnit$.subscribe(unit => {
      if (unit === 'Celsius') {
        this.selectedUnitTemp = 'C';
      } else if (unit === 'Fahrenheit') {
        this.selectedUnitTemp = 'F';
      }
    });
  }

  getTodayForecast(today: any) {
    this.location = today.city;
    this.timeline = [];
    const visibilityMeters = today.list[0].visibility;
    this.visibilityKm = visibilityMeters / 1000;

    for (const forecast of today.list.slice(0, 7)) {
      this.timeline.push({
        time: forecast.dt_txt,
        temp: forecast.main.temp
      });
      this.weatherNow = forecast;
    }

    const population = today.city && today.city.population || 0;
    const maxPopulation = 10000000;
    const populationPercentage = (population / maxPopulation) * 100;
    this.populationPercentageUpdated.emit(populationPercentage);
    this.countryName = this.location.name;
    this.fetchCountryImage();
  }

  organizeDataByDay() {
    this.dayWiseData = [];
    const groupedData = this.timeline.reduce((result: { [key: string]: any }, item: any) => {
      const day = moment(item.dt_txt).format('dddd');
      if (!result[day]) {
        result[day] = [];
      }
      result[day].push(item);
      return result;
    }, {});

    for (const day in groupedData) {
      if (groupedData.hasOwnProperty(day)) {
        this.dayWiseData.push({ day, data: groupedData[day] });
      }
    }
  }


  searchWeatherByCountry() {
    if (this.searchCountry) {
      this.weatherService.getWeatherByCountry(this.searchCountry).subscribe((data) => {
        this.weatherData = this.weatherUtilsService.getSevenDayForecast(data);
        this.getTodayForecast(data);
        this.countryName = this.searchCountry;
        this.fetchCountryImage();

        const sunriseTimestamp = data.city && data.city.sunrise;
        const sunsetTimestamp = data.city && data.city.sunset;

        if (sunriseTimestamp && sunsetTimestamp) {
          this.sunriseTime = this.sharedUtilsService.convertUnixTimestampToTime(sunriseTimestamp);
          this.sunsetTime = this.sharedUtilsService.convertUnixTimestampToTime(sunsetTimestamp);
        }

        const population = data.city && data.city.population || 0;
        const maxPopulation = 10000000;
        const populationPercentage = (population / maxPopulation) * 100;
        this.populationPercentageUpdated.emit(populationPercentage);
        this.message2 = this.determineMessage2(populationPercentage);

        const rain3h = data.list[0].rain?.["3h"] || 0;

        const maxRain = 100;
        this.rainPercentage = (rain3h / maxRain) * 100;
        this.organizeDataByDay();

        if (typeof data.city.timezone === 'number') {
          const countryTimezoneOffset = data.city.timezone;
          const currentTimeUTC = moment.utc();
          const currentTimeInCountry = currentTimeUTC.clone().add(countryTimezoneOffset, 'seconds');

          // Separate variables for day and time
          const formattedDay = currentTimeInCountry.format('ddd');
          const formattedTime = currentTimeInCountry.format('hh:mm A');

          // Set the properties for day and time
          this.formattedDay = formattedDay;
          this.formattedTime = formattedTime;
        } else {
          console.error('Timezone information is not a number in the API response.');
        }

        this.weatherDataService.updateWeatherData(data);
        this.timeline;
        this.searchCountry = '';
      });
    } else {
      console.log('Please enter a country.');
    }
  }

}