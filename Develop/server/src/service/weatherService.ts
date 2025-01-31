import dayjs, { type Dayjs } from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state: string;
}

// TODO: Define a class for the Weather object
class Weather {
  city: string;
  date: Dayjs | string;
  tempF: number;
  windSpeed: number;
  humidity: number;
  icon: string;
  iconDescription: string;
  constructor(
    city: string,
    date: Dayjs | string,
    tempF: number,
    windSpeed: number,
    humidity: number,
    icon: string,
    iconDescription: string
  ) {
    this.city = city;
    this.date = date;
    this.tempF = tempF;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
    this.icon = icon;
    this.iconDescription = iconDescription;
  }
}

// TODO: Complete the WeatherService class
class WeatherService {
  
  private baseURL?: string;

  private apiKey?: string;

  private city = '';
  constructor() {
    this.baseURL = process.env.API_BASE_URL || '';

    this.apiKey = process.env.API_KEY || '';
  }

  
  // * Note: The following methods are here as a guide, but you are welcome to provide your own solution.
  // * Just keep in mind the getWeatherForCity method is being called in your
  // * 09-Servers-and-APIs/02-Challenge/Develop/server/src/routes/api/weatherRoutes.ts file
  
  // * the array of Weather objects you are returning ultimately goes to
  // * 09-Servers-and-APIs/02-Challenge/Develop/client/src/main.ts

  // TODO: Create fetchLocationData method
  private buildfetchLocationData(city: string, state: string, country: string) {
    return [city, state, country].filter((item) => item).join(','); 
  }


  // private async fetchLocationData(query: string) {}
  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    const { name, lat, lon, country, state } = locationData;
    return { name, lat, lon, country, state };
  }

  // private destructureLocationData(locationData: Coordinates): Coordinates {}
  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(query: string) {
    return `${this.baseURL}/geocode/v1/json?q=${query}&apiKey=${this.apiKey}`;
  }

  // private buildGeocodeQuery(): string {}
  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates) {
    return `${this.baseURL}/current.json?key=${this.apiKey}&q=${coordinates.lat},${coordinates.lon}`;
  }

  // private buildWeatherQuery(coordinates: Coordinates): string {}
  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData(query: string) {
    const response = await fetch(this.buildGeocodeQuery(query));
    const locationData = await response.json();
    return this.destructureLocationData(locationData);
  }

  // private async fetchAndDestructureLocationData() {}
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    return response.json();
  }

  // private async fetchWeatherData(coordinates: Coordinates) {}
  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any) {
    const { name, country } = response.location;
    const { temp_f, wind_mph, humidity } = response.current;
    const { icon, text } = response.current.condition;
    return new Weather(name, dayjs(), temp_f, wind_mph, humidity, icon, text);
  }

  // private parseCurrentWeather(response: any) {}
  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const forecastArray = weatherData.map((day: any) => {
      const { date, day: { avgtemp_f, maxwind_mph, avghumidity }, condition: { icon, text } } = day;
      return new Weather(currentWeather.city, date, avgtemp_f, maxwind_mph, avghumidity, icon, text);
    });
    return forecastArray;
  } 

  // private buildForecastArray(currentWeather: Weather, weatherData: any[]) {}
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    this.city = city;
    const locationQuery = this.buildfetchLocationData(city, '', '');
    const coordinates = await this.fetchAndDestructureLocationData(locationQuery);
    const currentWeather = this.parseCurrentWeather(await this.fetchWeatherData(coordinates));
    const weatherData = await this.fetchWeatherData(coordinates);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.forecast.forecastday);
    return [currentWeather, forecastArray];
  }

  // async getWeatherForCity(city: string) {}
}

export default new WeatherService();
