import request from 'supertest';
import express from 'express';
import { getWeather, getCityHistory, getWeatherAnalysis, adminLogin } from '../controllers/weatherController';
import * as weatherService from '../services/weatherService';

// Mock weather service functions
jest.mock('../services/weatherService');
const mockGetWeatherForCity = weatherService.getWeatherForCity as jest.MockedFunction<typeof weatherService.getWeatherForCity>;
const mockGetHistoricalWeather = weatherService.getHistoricalWeather as jest.MockedFunction<typeof weatherService.getHistoricalWeather>;
const mockProcessAndAnalyzeWeatherData = weatherService.processAndAnalyzeWeatherData as jest.MockedFunction<typeof weatherService.processAndAnalyzeWeatherData>;

// Mock database
const mockDb = {
	run: jest.fn(),
	all: jest.fn(),
	get: jest.fn()
};

jest.mock('../config/database', () => ({
	getDb: jest.fn(),
	executeQuery: jest.fn(),
	initDb: jest.fn(),
	checkDbConnection: jest.fn(() => true)
}));

// Import the mocked getDb
import { getDb } from '../config/database';
const mockGetDb = getDb as jest.MockedFunction<typeof getDb>;

// Mock console to reduce noise
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('WeatherController', () => {
	let app: express.Application;
	let mockReq: Partial<express.Request>;
	let mockRes: Partial<express.Response>;
	let statusMock: jest.Mock;
	let jsonMock: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		// Setup mock getDb to return mockDb
		mockGetDb.mockReturnValue(mockDb as any);

		// Setup Express app for integration tests
		app = express();
		app.use(express.json());
		app.get('/weather', getWeather);
		app.get('/history/:city', getCityHistory);
		app.get('/analysis/:city', getWeatherAnalysis);
		app.post('/admin/login', adminLogin);

		// Setup mock response
		statusMock = jest.fn().mockReturnThis();
		jsonMock = jest.fn().mockReturnThis();

		mockRes = {
			status: statusMock,
			json: jsonMock
		};
	});

	afterAll(() => {
		mockConsoleError.mockRestore();
	});

	describe('getWeather', () => {
		beforeEach(() => {
			mockReq = {
				query: { city: 'Jakarta' }
			};
		});

		it('should return weather data for valid city', async () => {
			const mockWeatherData = {
				city: 'Jakarta',
				temperature: 28,
				conditions: 'Sunny',
				humidity: 65,
				wind_speed: 10,
				date_recorded: '2024-01-01T00:00:00.000Z'
			};

			mockGetWeatherForCity.mockResolvedValue(mockWeatherData);

			await getWeather(mockReq as express.Request, mockRes as express.Response);

			expect(mockGetWeatherForCity).toHaveBeenCalledWith('Jakarta');
			expect(jsonMock).toHaveBeenCalledWith({
				success: true,
				data: mockWeatherData
			});
		});

		it('should return 400 error when city parameter is missing', async () => {
			mockReq.query = {};

			await getWeather(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(400);
			expect(jsonMock).toHaveBeenCalledWith({
				error: 'City parameter is required'
			});
			expect(mockGetWeatherForCity).not.toHaveBeenCalled();
		});

		it('should handle service errors with improved security', async () => {
			const mockError = new Error('Service error');
			mockError.stack = 'Error stack trace';
			mockGetWeatherForCity.mockRejectedValue(mockError);

			await getWeather(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(500);
			expect(jsonMock).toHaveBeenCalledWith({
				success: false,
				error: 'Failed to fetch weather data'
			});
			expect(mockConsoleError).toHaveBeenCalledWith('Controller error occurred');
		});

		it('should validate city parameter format', async () => {
			mockReq.query = { city: "'; DROP TABLE weather_data; --" };

			await getWeather(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(400);
			expect(jsonMock).toHaveBeenCalledWith({
				error: 'Invalid city name format'
			});
		});

		it('should work with integration test', async () => {
			const mockWeatherData = {
				city: 'Jakarta',
				temperature: 28,
				conditions: 'Sunny',
				humidity: 65,
				wind_speed: 10,
				date_recorded: '2024-01-01T00:00:00.000Z'
			};

			mockGetWeatherForCity.mockResolvedValue(mockWeatherData);

			const response = await request(app)
				.get('/weather')
				.query({ city: 'Jakarta' });

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				success: true,
				data: mockWeatherData
			});
		});
	});

	describe('getCityHistory', () => {
		beforeEach(() => {
			mockReq = {
				params: { city: 'Jakarta' },
				query: { from: '2024-01-01' }
			};
		});

		it('should return historical weather data', async () => {
			const mockHistoricalData = [
				{
					id: 1,
					city: 'Jakarta',
					temperature: 28,
					conditions: 'Sunny',
					humidity: 65,
					wind_speed: 10,
					date_recorded: '2024-01-01T00:00:00.000Z'
				}
			];

			mockGetHistoricalWeather.mockResolvedValue(mockHistoricalData);

			await getCityHistory(mockReq as express.Request, mockRes as express.Response);

			expect(mockGetHistoricalWeather).toHaveBeenCalledWith('Jakarta', '2024-01-01');
			expect(jsonMock).toHaveBeenCalledWith({
				success: true,
				data: mockHistoricalData
			});
		});

		it('should handle missing city parameter', async () => {
			mockReq.params = {};

			await getCityHistory(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(400);
			expect(jsonMock).toHaveBeenCalledWith({
				error: 'City parameter is required'
			});
		});

		it('should work without date filter', async () => {
			mockReq.query = {};
			const mockHistoricalData = [
				{
					id: 1,
					city: 'Jakarta',
					temperature: 28,
					conditions: 'Sunny',
					humidity: 65,
					wind_speed: 10,
					date_recorded: '2024-01-01T00:00:00.000Z'
				}
			];

			mockGetHistoricalWeather.mockResolvedValue(mockHistoricalData);

			await getCityHistory(mockReq as express.Request, mockRes as express.Response);

			expect(mockGetHistoricalWeather).toHaveBeenCalledWith('Jakarta', undefined);
			expect(jsonMock).toHaveBeenCalledWith({
				success: true,
				data: mockHistoricalData
			});
		});

		it('should handle service errors with improved security', async () => {
			const mockError = new Error('Database error');
			mockError.stack = 'Database error stack';
			mockGetHistoricalWeather.mockRejectedValue(mockError);

			await getCityHistory(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(500);
			expect(jsonMock).toHaveBeenCalledWith({
				success: false,
				error: 'Failed to fetch historical weather data'
			});
		});
	});

	describe('getWeatherAnalysis', () => {
		beforeEach(() => {
			mockReq = {
				params: { city: 'Jakarta' }
			};
		});

		it('should return weather analysis with SQL injection vulnerability', async () => {
			const mockRows = [
				{ city: 'Jakarta', temperature: 28, humidity: 65, wind_speed: 10 },
				{ city: 'Jakarta', temperature: 30, humidity: 70, wind_speed: 15 }
			];

			const mockAnalysis = {
				temperature: { high: 30, low: 28, average: 29 },
				humidity: { high: 70, low: 65, average: 67.5 },
				wind_speed: { high: 15, low: 10, average: 12.5 },
				summary: 'Warm. Humid. Calm winds.'
			};

			mockDb.all.mockImplementation((query, callback) => {
				// Verify SQL injection vulnerability
				expect(query).toBe("SELECT * FROM weather_data WHERE city = 'Jakarta'");
				callback(null, mockRows);
			});

			mockProcessAndAnalyzeWeatherData.mockReturnValue(mockAnalysis);

			await getWeatherAnalysis(mockReq as express.Request, mockRes as express.Response);

			expect(jsonMock).toHaveBeenCalledWith({
				success: true,
				city: 'Jakarta',
				dataPoints: 2,
				analysis: mockAnalysis
			});
		});

		it('should reject invalid city parameter format', async () => {
			mockReq.params = { city: "Jakarta'; DROP TABLE weather_data; --" };

			await getWeatherAnalysis(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(400);
			expect(jsonMock).toHaveBeenCalledWith({
				error: 'Invalid city name format'
			});
		});

		it('should return 404 when no data found', async () => {
			mockDb.all.mockImplementation((query, callback) => {
				callback(null, []);
			});

			await getWeatherAnalysis(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(404);
			expect(jsonMock).toHaveBeenCalledWith({
				error: 'No data found for this city'
			});
		});

		it('should handle database errors', async () => {
			const dbError = new Error('Database connection failed');

			mockDb.all.mockImplementation((query, callback) => {
				callback(dbError, null);
			});

			await getWeatherAnalysis(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(500);
			expect(jsonMock).toHaveBeenCalledWith({
				error: 'Database error'
			});
			expect(mockConsoleError).toHaveBeenCalledWith('Database error occurred');
		});

		it('should handle analysis errors', async () => {
			const analysisError = new Error('Analysis failed');

			mockDb.all.mockImplementation((query, callback) => {
				callback(analysisError, null);
			});

			await getWeatherAnalysis(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(500);
			expect(jsonMock).toHaveBeenCalledWith({
				error: 'Database error'
			});
			expect(mockConsoleError).toHaveBeenCalledWith('Database error occurred');
		});
	});

	describe('adminLogin', () => {
		it('should login with hardcoded credentials (vulnerability)', () => {
			mockReq = {
				body: { username: 'admin', password: 'admin123' }
			};

			adminLogin(mockReq as express.Request, mockRes as express.Response);

			expect(jsonMock).toHaveBeenCalledWith({
				success: true,
				token: 'demo-token-for-testing'
			});
		});

		it('should reject invalid credentials', () => {
			mockReq = {
				body: { username: 'user', password: 'wrongpass' }
			};

			adminLogin(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(401);
			expect(jsonMock).toHaveBeenCalledWith({
				success: false,
				error: 'Invalid credentials'
			});
		});

		it('should reject missing username', () => {
			mockReq = {
				body: { password: 'admin123' }
			};

			adminLogin(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(401);
			expect(jsonMock).toHaveBeenCalledWith({
				success: false,
				error: 'Invalid credentials'
			});
		});

		it('should reject missing password', () => {
			mockReq = {
				body: { username: 'admin' }
			};

			adminLogin(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(401);
			expect(jsonMock).toHaveBeenCalledWith({
				success: false,
				error: 'Invalid credentials'
			});
		});

		it('should handle empty request body', () => {
			mockReq = {
				body: {}
			};

			adminLogin(mockReq as express.Request, mockRes as express.Response);

			expect(statusMock).toHaveBeenCalledWith(401);
			expect(jsonMock).toHaveBeenCalledWith({
				success: false,
				error: 'Invalid credentials'
			});
		});

		it('should work with integration test', async () => {
			const response = await request(app)
				.post('/admin/login')
				.send({ username: 'admin', password: 'admin123' });

			expect(response.status).toBe(200);
			expect(response.body).toEqual({
				success: true,
				token: 'demo-token-for-testing'
			});
		});
	});
});
