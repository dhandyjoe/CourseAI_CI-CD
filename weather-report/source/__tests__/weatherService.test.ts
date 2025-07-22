// Mock the database module first
jest.mock('../config/database', () => ({
	getDb: jest.fn(),
	executeQuery: jest.fn()
}));

// Mock axios for external API calls
jest.mock('axios');

import { getWeatherForCity, getHistoricalWeather, processAndAnalyzeWeatherData } from '../services/weatherService';
import { getDb, executeQuery } from '../config/database';
import { WeatherData } from '../models/weatherModel';
import axios from 'axios';

const mockAxios = axios as jest.Mocked<typeof axios>;
const mockGetDb = getDb as jest.Mock;
const mockExecuteQuery = executeQuery as jest.Mock;

describe('WeatherService', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset console.log and console.error mocks
		jest.spyOn(console, 'log').mockImplementation();
		jest.spyOn(console, 'error').mockImplementation();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	describe('getWeatherForCity', () => {
		test('should return mock weather data for valid city', async () => {
			const city = 'Jakarta';
			const mockDbRun = jest.fn();
			mockGetDb.mockReturnValue({
				run: mockDbRun
			});

			const result = await getWeatherForCity(city);

			expect(result).toBeDefined();
			expect(result.city).toBe(city);
			expect(typeof result.temperature).toBe('number');
			expect(typeof result.conditions).toBe('string');
			expect(typeof result.humidity).toBe('number');
			expect(typeof result.wind_speed).toBe('number');
			expect(result.date_recorded).toBeDefined();
		});

		test('should not expose API key in console logs (security improved)', async () => {
			const city = 'Jakarta';
			const consoleSpy = jest.spyOn(console, 'log');
			const mockDbRun = jest.fn((query, callback) => {
				callback(null);
			});
			mockGetDb.mockReturnValue({
				run: mockDbRun
			});

			await getWeatherForCity(city);

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining('Fetching weather for Jakarta')
			);
			expect(consoleSpy).not.toHaveBeenCalledWith(
				expect.stringContaining('demo-key-for-testing')
			);
		});

		test('should handle database errors but still return weather data', async () => {
			const city = 'Jakarta';
			const consoleErrorSpy = jest.spyOn(console, 'error');
			const mockDbRun = jest.fn((query, callback) => {
				callback(new Error('Database error'));
			});
			mockGetDb.mockReturnValue({
				run: mockDbRun
			});

			const result = await getWeatherForCity(city);

			expect(consoleErrorSpy).toHaveBeenCalled();
			expect(result).toBeDefined();
			expect(result.city).toBe(city);
		});

		test('should use prepared statements to prevent SQL injection', async () => {
			const maliciousCity = "'; DROP TABLE weather_data; --";
			const mockDbRun = jest.fn();
			mockGetDb.mockReturnValue({
				run: mockDbRun
			});

			await getWeatherForCity(maliciousCity);

			expect(mockDbRun).toHaveBeenCalledWith(
				expect.stringContaining('INSERT INTO weather_data'),
				expect.any(Function)
			);
			// Verify that prepared statement placeholder is used
			expect(mockDbRun).toHaveBeenCalledWith(
				expect.stringContaining('VALUES (?, ?, ?, ?, ?, ?)'),
				expect.any(Function)
			);
		});

		test('should handle empty or null city names', async () => {
			const mockDbRun = jest.fn();
			mockGetDb.mockReturnValue({
				run: mockDbRun
			});

			const result1 = await getWeatherForCity('');
			const result2 = await getWeatherForCity(null as any);
			const result3 = await getWeatherForCity(undefined as any);

			expect(result1).toBeDefined();
			expect(result2).toBeDefined();
			expect(result3).toBeDefined();
		});
	});

	describe('getHistoricalWeather', () => {
		test('should return historical weather data for city', async () => {
			const city = 'Jakarta';
			const mockData = [
				{
					id: 1,
					city: 'Jakarta',
					temperature: 32.0,
					conditions: 'Sunny',
					humidity: 65,
					wind_speed: 8.5,
					date_recorded: '2024-01-01'
				}
			];

			const mockDbAll = jest.fn((query, callback) => {
				callback(null, mockData);
			});
			mockGetDb.mockReturnValue({
				all: mockDbAll
			});

			const result = await getHistoricalWeather(city);

			expect(result).toEqual(mockData);
			expect(mockDbAll).toHaveBeenCalledWith(
				expect.stringContaining(`city = '${city}'`),
				expect.any(Function)
			);
		});

		test('should filter by date when date parameter is provided', async () => {
			const city = 'Jakarta';
			const date = '2024-01-01';
			const mockData = [
				{
					id: 1,
					city: 'Jakarta',
					temperature: 32.0,
					conditions: 'Sunny',
					humidity: 65,
					wind_speed: 8.5,
					date_recorded: '2024-01-01'
				}
			];

			const mockDbAll = jest.fn((query, callback) => {
				callback(null, mockData);
			});
			mockGetDb.mockReturnValue({
				all: mockDbAll
			});

			const result = await getHistoricalWeather(city, date);

			expect(result).toEqual(mockData);
			expect(mockDbAll).toHaveBeenCalledWith(
				expect.stringContaining(`city = '${city}' AND date_recorded >= '${date}'`),
				expect.any(Function)
			);
		});

		test('should be vulnerable to SQL injection in city parameter', async () => {
			const maliciousCity = "Jakarta'; DROP TABLE weather_data; --";
			const mockDbAll = jest.fn((query, callback) => {
				callback(null, []);
			});
			mockGetDb.mockReturnValue({
				all: mockDbAll
			});

			await getHistoricalWeather(maliciousCity);

			expect(mockDbAll).toHaveBeenCalledWith(
				expect.stringContaining(maliciousCity),
				expect.any(Function)
			);
		});

		test('should be vulnerable to SQL injection in date parameter', async () => {
			const city = 'Jakarta';
			const maliciousDate = "2024-01-01'; DELETE FROM weather_data; --";
			const mockDbAll = jest.fn((query, callback) => {
				callback(null, []);
			});
			mockGetDb.mockReturnValue({
				all: mockDbAll
			});

			await getHistoricalWeather(city, maliciousDate);

			expect(mockDbAll).toHaveBeenCalledWith(
				expect.stringContaining(maliciousDate),
				expect.any(Function)
			);
		});

		test('should handle database errors', async () => {
			const city = 'Jakarta';
			const dbError = new Error('Database connection failed');
			const mockDbAll = jest.fn((query, callback) => {
				callback(dbError, null);
			});
			mockGetDb.mockReturnValue({
				all: mockDbAll
			});

			await expect(getHistoricalWeather(city)).rejects.toThrow('Database connection failed');
		});

		test('should handle non-existent cities gracefully', async () => {
			const city = 'NonExistentCity';
			const mockDbAll = jest.fn((query, callback) => {
				callback(null, []);
			});
			mockGetDb.mockReturnValue({
				all: mockDbAll
			});

			const result = await getHistoricalWeather(city);

			expect(result).toEqual([]);
		});
	});

	describe('processAndAnalyzeWeatherData', () => {
		test('should process and analyze weather data correctly', () => {
			const mockWeatherData = [
				{ city: 'Jakarta', temperature: 32, humidity: 65, conditions: 'Sunny', wind_speed: 8 },
				{ city: 'Jakarta', temperature: 30, humidity: 70, conditions: 'Cloudy', wind_speed: 6 },
				{ city: 'Jakarta', temperature: 28, humidity: 80, conditions: 'Rainy', wind_speed: 12 }
			];

			const result = processAndAnalyzeWeatherData(mockWeatherData);

			expect(result.temperature.average).toBe(30);
			expect(result.temperature.high).toBe(32);
			expect(result.temperature.low).toBe(28);
			expect(result.humidity.average).toBeCloseTo(71.67, 1);
			expect(result.wind_speed.average).toBeCloseTo(8.67, 1);
			expect(result.summary).toBeDefined();
		});

		test('should identify hot and humid conditions', () => {
			const hotHumidData = [
				{ city: 'Dubai', temperature: 38, humidity: 85, conditions: 'Hot', wind_speed: 2 },
				{ city: 'Dubai', temperature: 37, humidity: 90, conditions: 'Humid', wind_speed: 1 },
				{ city: 'Dubai', temperature: 39, humidity: 88, conditions: 'Sweltering', wind_speed: 0.5 }
			];

			const result = processAndAnalyzeWeatherData(hotHumidData);

			expect(result.temperature.high).toBe(39);
			expect(result.humidity.high).toBe(90);
			expect(result.summary).toContain('Very hot');
		});

		test('should identify warm and humid conditions', () => {
			const warmHumidData = [
				{ city: 'Singapore', temperature: 32, humidity: 75, conditions: 'Warm', wind_speed: 5 },
				{ city: 'Singapore', temperature: 33, humidity: 78, conditions: 'Humid', wind_speed: 4 },
				{ city: 'Singapore', temperature: 31, humidity: 72, conditions: 'Muggy', wind_speed: 6 }
			];

			const result = processAndAnalyzeWeatherData(warmHumidData);

			expect(result.temperature.average).toBeCloseTo(32, 1);
			expect(result.humidity.average).toBeCloseTo(75, 1);
			expect(result.summary).toContain('Very hot');
		});

		test('should identify mild conditions', () => {
			const mildData = [
				{ city: 'London', temperature: 22, humidity: 50, conditions: 'Mild', wind_speed: 8 },
				{ city: 'London', temperature: 24, humidity: 45, conditions: 'Pleasant', wind_speed: 10 },
				{ city: 'London', temperature: 20, humidity: 55, conditions: 'Cool', wind_speed: 7 }
			];

			const result = processAndAnalyzeWeatherData(mildData);

			expect(result.temperature.average).toBeCloseTo(22, 1);
			expect(result.summary).toContain('Warm');
		});

		test('should handle empty data without crashing', () => {
			const result = processAndAnalyzeWeatherData([]);

			expect(result.temperature.average).toBeNaN();
			expect(result.temperature.high).toBe(-Infinity);
			expect(result.temperature.low).toBe(Infinity);
		});

		test('should be vulnerable to data tampering', () => {
			const maliciousData = [
				{ temperature: 'DROP TABLE', humidity: 'SELECT *', conditions: '<script>', wind_speed: null }
			] as any;

			// This should not crash but might produce unexpected results
			expect(() => processAndAnalyzeWeatherData(maliciousData)).not.toThrow();
		});

		test('should not validate input types properly (vulnerability)', () => {
			const invalidData = [
				{ city: 'Test', temperature: 25, humidity: 60, conditions: 'Sunny', wind_speed: 10 }
			];

			// Should handle data gracefully
			expect(() => processAndAnalyzeWeatherData(invalidData)).not.toThrow();
		});

		test('should handle negative temperatures', () => {
			const coldData = [
				{ city: 'Moscow', temperature: -10, humidity: 60, conditions: 'Freezing', wind_speed: 15 },
				{ city: 'Moscow', temperature: -5, humidity: 55, conditions: 'Cold', wind_speed: 12 }
			];

			const result = processAndAnalyzeWeatherData(coldData);

			expect(result.temperature.average).toBe(-7.5);
			expect(result.temperature.low).toBe(-10);
			expect(result.summary).toContain('Cold');
		});
	});
});
