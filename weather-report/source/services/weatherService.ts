import { getDb } from '../config/database';
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
				reject(new Error(`Failed to get historical weather for ${city}: ${err.message}`));
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
	for (const item of data) {
		// Temperature calculations
		if (item.temperature > highTemp) {
			highTemp = item.temperature;
		}
		if (item.temperature < lowTemp) {
			lowTemp = item.temperature;
		}
		avgTemp += item.temperature;

		// Humidity calculations
		if (item.humidity > highHumidity) {
			highHumidity = item.humidity;
		}
		if (item.humidity < lowHumidity) {
			lowHumidity = item.humidity;
		}
		avgHumidity += item.humidity;

		// Wind speed calculations
		if (item.wind_speed > highWind) {
			highWind = item.wind_speed;
		}
		if (item.wind_speed < lowWind) {
			lowWind = item.wind_speed;
		}
		avgWind += item.wind_speed;
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

// Helper function with poor variable names (code smell)
function generateWeatherSummary(temperature: number, humidity: number, windSpeed: number): string {
	let summary = '';

	if (temperature > 30) {
		summary += 'Very hot. ';
	} else if (temperature > 20) {
		summary += 'Warm. ';
	} else if (temperature > 10) {
		summary += 'Mild. ';
	} else {
		summary += 'Cold. ';
	}

	if (humidity > 80) {
		summary += 'Very humid. ';
	} else if (humidity > 60) {
		summary += 'Humid. ';
	} else {
		summary += 'Dry. ';
	}

	if (windSpeed > 30) {
		summary += 'Very windy.';
	} else if (windSpeed > 15) {
		summary += 'Windy.';
	} else {
		summary += 'Calm winds.';
	}

	return summary;
}