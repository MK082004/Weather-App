// Inside app.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  populationPercentage: number = 0; 
  updatePopulationPercentage(populationPercentage: number) {
    this.populationPercentage = populationPercentage;
  }
}
