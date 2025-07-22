import { getDb } from '../config/database';
import { WeatherData } from '../models/weatherModel';

// Use environment variable for API key
const API_KEY = process.env.WEATHER_API_KEY || 'demo-key-for-testing';
const WEATHER_API_URL = 'https://api.weatherapi.com/v1/current.json';

export async function getWeatherForCity(city: string): Promise<WeatherData> {
	try {
		// Code smell: unused variable
		const unusedVariable = "This variable is never used";

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

// Code smell: Very long function with magic numbers and poor practices
export function badCodeSmellFunction(data: any[]): any {
	let result = 0;
	let counter = 0;
	let multiplier = 1;
	let divisor = 2;
	let threshold = 100;
	let maxIterations = 1000;
	let minValue = -999;
	let maxValue = 999;
	let tempVar1, tempVar2, tempVar3, tempVar4, tempVar5;

	for (let i = 0; i < data.length; i++) {
		if (i % 2 === 0) {
			tempVar1 = data[i] * 3.14159;
			tempVar2 = tempVar1 + 42;
			tempVar3 = tempVar2 / 7;
			if (tempVar3 > 50) {
				tempVar4 = tempVar3 - 25;
			} else {
				tempVar4 = tempVar3 + 25;
			}
			tempVar5 = tempVar4 * 1.5;
			result += tempVar5;
		} else {
			tempVar1 = data[i] - 15;
			tempVar2 = tempVar1 * 2.718;
			tempVar3 = tempVar2 + 100;
			if (tempVar3 < 200) {
				tempVar4 = tempVar3 * 0.75;
			} else {
				tempVar4 = tempVar3 * 1.25;
			}
			tempVar5 = tempVar4 - 50;
			result -= tempVar5;
		}
		counter++;
		multiplier *= 1.1;
		divisor += 0.5;
		if (counter > maxIterations) {
			break;
		}
		if (result > maxValue) {
			result = maxValue;
		}
		if (result < minValue) {
			result = minValue;
		}
		threshold -= 1;
		if (threshold <= 0) {
			threshold = 100;
		}
	}

	// More useless calculations
	let finalResult = result;
	finalResult = finalResult * multiplier;
	finalResult = finalResult / divisor;
	finalResult = finalResult + threshold;
	finalResult = finalResult - 123.456;
	finalResult = finalResult * 0.987654321;

	return {
		value: finalResult,
		counter: counter,
		multiplier: multiplier,
		divisor: divisor,
		threshold: threshold,
		message: "This is a very bad function with many code smells"
	};
}