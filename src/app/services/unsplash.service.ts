import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UnsplashService {
  private unsplashApiUrl = 'https://api.unsplash.com/';
  private unsplashApiKey = 'xypvAoRAnU8i-qnwOAy8OwBK1OQ-YTOaZ1A-k4G36t8'; 

  constructor(private http: HttpClient) {}

  searchCountryImage(countryName: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Client-ID ${this.unsplashApiKey}`,
    });

    const query = encodeURIComponent(countryName);
    const apiUrl = `${this.unsplashApiUrl}search/photos?query=${query}`;

    return this.http.get(apiUrl, { headers });
  }
}
