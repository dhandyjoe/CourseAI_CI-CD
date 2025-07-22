import { weatherRoutes } from '../routes/weatherRoutes';

// Mock the controller functions
jest.mock('../controllers/weatherController', () => ({
	getWeather: jest.fn(),
	getCityHistory: jest.fn(),
	getWeatherAnalysis: jest.fn(),
	adminLogin: jest.fn()
}));

describe('Weather Routes', () => {
	it('should be defined', () => {
		expect(weatherRoutes).toBeDefined();
	});

	it('should be a router function', () => {
		expect(typeof weatherRoutes).toBe('function');
	});

	it('should have routes configured', () => {
		// Check if the routes are properly configured
		const routes = (weatherRoutes as any).stack;
		expect(routes.length).toBeGreaterThan(0);
	});

	it('should export weatherRoutes correctly', () => {
		expect(weatherRoutes).toBeTruthy();
		expect((weatherRoutes as any).stack).toBeDefined();
	});
});
