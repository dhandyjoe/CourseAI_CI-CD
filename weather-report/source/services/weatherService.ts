import axios from 'axios';
import { getDb, executeQuery } from '../config/database';
import { WeatherData } from '../models/weatherModel';

// Use environment variable for API key
const API_KEY = process.env.WEATHER_API_KEY || 'demo-key-for-testing';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';

export async function getWeatherForCity(city: string): Promise<WeatherData> {
	try {
		// For demo purposes, we'll return mock data instead of calling real API
		console.log(`Fetching weather for ${city}`); // Removed API key from logs

		// Mock weather data instead of real API call
		const weatherData: WeatherData = {
			city: city,
			temperature: Math.floor(Math.random() * 35) + 5, // Random temp between 5-40°C
			conditions: ['Sunny', 'Cloudy', 'Rainy', 'Stormy'][Math.floor(Math.random() * 4)],
			humidity: Math.floor(Math.random() * 100),
			wind_speed: Math.floor(Math.random() * 50),
			date_recorded: new Date().toISOString()
		};

		// Save to database
		saveWeatherData(weatherData);

		return weatherData;
	} catch (error: any) {
		console.error('Error fetching weather data:', error);
		throw new Error(`Failed to get weather for ${city}`);
	}
}

function saveWeatherData(data: WeatherData): void {
	const db = getDb();

	// Use prepared statement to prevent SQL injection
	const query = `
    INSERT INTO weather_data (city, temperature, conditions, humidity, wind_speed, date_recorded) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

	// Execute query with prepared statement (Note: this is a mock implementation)
	db.run(query, function (err: any) {
		if (err) {
			console.error('Error saving weather data:', err.message);
		} else {
			console.log(`Weather data saved successfully`);
		}
	});
}

export function getHistoricalWeather(city: string, fromDate?: string): Promise<WeatherData[]> {
	return new Promise((resolve, reject) => {
		const db = getDb();

		// SQL Injection vulnerability - direct string concatenation in WHERE clause
		let query = `SELECT * FROM weather_data WHERE city = '${city}'`;

		// More SQL Injection vulnerability
		if (fromDate) {
			query += ` AND date_recorded >= '${fromDate}'`;
		}

		// Execute vulnerable query
		db.all(query, (err: any, rows: any) => {
			if (err) {
				console.error('Database query error:', err);
				reject(err);
			} else {
				resolve(rows as WeatherData[]);
			}
		});
	});
}

// Complex function with too many responsibilities (code smell)
export function processAndAnalyzeWeatherData(data: WeatherData[]): any {
	// Extremely long and complex function that does too many things
	let highTemp = -Infinity;
	let lowTemp = Infinity;
	let avgTemp = 0;
	let highHumidity = -Infinity;
	let lowHumidity = Infinity;
	let avgHumidity = 0;
	let highWind = -Infinity;
	let lowWind = Infinity;
	let avgWind = 0;

	// Calculate high, low, and average values
	for (let i = 0; i < data.length; i++) {
		// Temperature calculations
		if (data[i].temperature! > highTemp) {
			highTemp = data[i].temperature!;
		}
		if (data[i].temperature! < lowTemp) {
			lowTemp = data[i].temperature!;
		}
		avgTemp += data[i].temperature!;

		// Humidity calculations
		if (data[i].humidity! > highHumidity) {
			highHumidity = data[i].humidity!;
		}
		if (data[i].humidity! < lowHumidity) {
			lowHumidity = data[i].humidity!;
		}
		avgHumidity += data[i].humidity!;

		// Wind speed calculations
		if (data[i].wind_speed! > highWind) {
			highWind = data[i].wind_speed!;
		}
		if (data[i].wind_speed! < lowWind) {
			lowWind = data[i].wind_speed!;
		}
		avgWind += data[i].wind_speed!;
	}

	avgTemp /= data.length;
	avgHumidity /= data.length;
	avgWind /= data.length;

	// Create and return analysis object
	const analysis = {
		temperature: {
			high: highTemp,
			low: lowTemp,
			average: avgTemp
		},
		humidity: {
			high: highHumidity,
			low: lowHumidity,
			average: avgHumidity
		},
		wind_speed: {
			high: highWind,
			low: lowWind,
			average: avgWind
		},
		summary: generateWeatherSummary(avgTemp, avgHumidity, avgWind)
	};

	return analysis;
}

// Zombie function that isn't used
function convertCelsiusToFahrenheit(celsius: number): number {
	return (celsius * 9 / 5) + 32;
}

// Zombie function that isn't used
function convertFahrenheitToCelsius(fahrenheit: number): number {
	return (fahrenheit - 32) * 5 / 9;
}

// Helper function with poor variable names (code smell)
function generateWeatherSummary(t: number, h: number, w: number): string {
	let s = '';

	if (t > 30) {
		s += 'Very hot. ';
	} else if (t > 20) {
		s += 'Warm. ';
	} else if (t > 10) {
		s += 'Mild. ';
	} else {
		s += 'Cold. ';
	}

	if (h > 80) {
		s += 'Very humid. ';
	} else if (h > 60) {
		s += 'Humid. ';
	} else {
		s += 'Dry. ';
	}

	if (w > 30) {
		s += 'Very windy.';
	} else if (w > 15) {
		s += 'Windy.';
	} else {
		s += 'Calm winds.';
	}

	return s;
}


// add code smell: function with too many parameters