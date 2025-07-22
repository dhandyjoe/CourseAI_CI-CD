import {
	doStuff,
	dynamicEval,
	formatDate,
	dateFormat,
	calculateAverageTemperature,
	calculateMedianTemperature,
	getApiCredentials
} from '../apiUtils';

// Mock console to reduce noise
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => { });
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('ApiUtils', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterAll(() => {
		mockConsoleLog.mockRestore();
		mockConsoleError.mockRestore();
	});

	describe('doStuff', () => {
		it('should deep clone objects', () => {
			const originalObj = {
				name: 'Jakarta',
				coordinates: { lat: -6.2088, lng: 106.8456 },
				tags: ['capital', 'tropical']
			};

			const result = doStuff(originalObj);

			expect(result).toEqual(originalObj);
			expect(result).not.toBe(originalObj);
			expect(result.coordinates).not.toBe(originalObj.coordinates);
			expect(result.tags).not.toBe(originalObj.tags);
		});

		it('should handle primitive values', () => {
			expect(doStuff(42)).toBe(42);
			expect(doStuff('hello')).toBe('hello');
			expect(doStuff(true)).toBe(true);
			expect(doStuff(null)).toBe(null);
		});

		it('should handle arrays', () => {
			const originalArray = [1, 2, { nested: 'value' }, [4, 5]];
			const result = doStuff(originalArray);

			expect(result).toEqual(originalArray);
			expect(result).not.toBe(originalArray);
			expect(result[2]).not.toBe(originalArray[2]);
			expect(result[3]).not.toBe(originalArray[3]);
		});

		it('should handle empty objects and arrays', () => {
			expect(doStuff({})).toEqual({});
			expect(doStuff([])).toEqual([]);
		});

		it('should handle complex nested structures', () => {
			const complex = {
				level1: {
					level2: {
						level3: {
							data: [1, 2, 3],
							info: 'nested'
						}
					}
				}
			};

			const result = doStuff(complex);
			expect(result).toEqual(complex);
			expect(result.level1.level2.level3.data).not.toBe(complex.level1.level2.level3.data);
		});
	});

	describe('dynamicEval', () => {
		it('should execute simple mathematical expressions (security vulnerability)', () => {
			expect(dynamicEval('2 + 3')).toBe(5);
			expect(dynamicEval('10 * 5')).toBe(50);
			expect(dynamicEval('Math.sqrt(16)')).toBe(4);
		});

		it('should execute string operations', () => {
			expect(dynamicEval('"hello" + " world"')).toBe('hello world');
			expect(dynamicEval('"test".toUpperCase()')).toBe('TEST');
		});

		it('should be vulnerable to code injection', () => {
			// This demonstrates the security vulnerability
			const maliciousCode = 'console.log("Security breach!"); 42';
			const result = dynamicEval(maliciousCode);

			expect(result).toBe(42);
			// The malicious code would have been executed
		});

		it('should handle variable declarations', () => {
			const result = dynamicEval('var x = 10; x * 2');
			expect(result).toBe(20);
		});

		it('should throw errors for invalid expressions', () => {
			expect(() => dynamicEval('invalid javascript code {')).toThrow();
			expect(() => dynamicEval('undefined.property')).toThrow();
		});

		it('should access global scope (vulnerability)', () => {
			// This shows how eval can access global variables
			(global as any).testVar = 'vulnerable';
			const result = dynamicEval('global.testVar');
			expect(result).toBe('vulnerable');

			// Cleanup
			delete (global as any).testVar;
		});
	});

	describe('formatDate', () => {
		it('should format Date objects correctly', () => {
			const date = new Date('2024-01-15');
			const result = formatDate(date);
			expect(result).toBe('2024-01-15');
		});

		it('should format date strings correctly', () => {
			const result = formatDate('2024-03-25');
			expect(result).toBe('2024-03-25');
		});

		it('should handle single digit months and days', () => {
			const date = new Date('2024-01-05');
			const result = formatDate(date);
			expect(result).toBe('2024-01-05');
		});

		it('should handle ISO date strings', () => {
			// Note: This will be converted to local time, so we need to account for timezone
			const result = formatDate('2024-12-31T00:00:00.000Z');
			// Expected result may vary based on timezone
			expect(result).toMatch(/2024-12-\d{2}/);
		});

		it('should handle invalid dates gracefully with inconsistent error handling', () => {
			const result = formatDate('invalid-date');
			// The actual implementation returns "NaN-NaN-NaN" for invalid dates, not empty string
			expect(result).toBe('NaN-NaN-NaN');
			// The console.log is called within the catch block after the invalid date processing
		});

		it('should handle null/undefined input', () => {
			expect(formatDate(null as any)).toBe('');
			expect(formatDate(undefined as any)).toBe('');
		});

		it('should handle numeric input (treated as timestamp)', () => {
			const timestamp = new Date('2024-01-01').getTime();
			const result = formatDate(new Date(timestamp));
			expect(result).toBe('2024-01-01');
		});
	});

	describe('dateFormat', () => {
		it('should format Date objects correctly (duplicate functionality)', () => {
			const date = new Date('2024-01-15');
			const result = dateFormat(date);
			expect(result).toBe('2024-01-15');
		});

		it('should format date strings correctly', () => {
			const result = dateFormat('2024-03-25');
			expect(result).toBe('2024-03-25');
		});

		it('should handle leap year dates', () => {
			const result = dateFormat('2024-02-29');
			expect(result).toBe('2024-02-29');
		});

		it('should handle end of year dates', () => {
			const result = dateFormat('2023-12-31');
			expect(result).toBe('2023-12-31');
		});

		it('should handle invalid dates with consistent error handling', () => {
			const result = dateFormat('invalid-date');
			// The actual implementation returns "NaN-NaN-NaN" for invalid dates
			expect(result).toBe('NaN-NaN-NaN');
		});

		it('should handle edge cases', () => {
			expect(dateFormat('')).toBe('NaN-NaN-NaN');
			expect(dateFormat('not-a-date')).toBe('NaN-NaN-NaN');
			expect(dateFormat('2024-13-01')).toBe('NaN-NaN-NaN'); // Invalid month
		});

		// Test showing the duplicate code smell
		it('should produce same result as formatDate for valid inputs', () => {
			const testDate = '2024-06-15';
			const formatDateResult = formatDate(testDate);
			const dateFormatResult = dateFormat(testDate);

			expect(formatDateResult).toBe(dateFormatResult);
		});
	});

	describe('calculateAverageTemperature', () => {
		it('should calculate average correctly', () => {
			expect(calculateAverageTemperature([20, 25, 30])).toBe(25);
			expect(calculateAverageTemperature([10, 20])).toBe(15);
			expect(calculateAverageTemperature([0, 100])).toBe(50);
		});

		it('should handle single temperature', () => {
			expect(calculateAverageTemperature([25])).toBe(25);
		});

		it('should handle negative temperatures', () => {
			expect(calculateAverageTemperature([-10, 0, 10])).toBe(0);
			expect(calculateAverageTemperature([-5, -15])).toBe(-10);
		});

		it('should handle decimal temperatures', () => {
			const result = calculateAverageTemperature([20.5, 25.7, 30.3]);
			expect(result).toBeCloseTo(25.5, 2);
		});

		it('should return 0 for empty array', () => {
			expect(calculateAverageTemperature([])).toBe(0);
		});

		it('should handle large arrays', () => {
			const temperatures = Array.from({ length: 100 }, (_, i) => i);
			const result = calculateAverageTemperature(temperatures);
			expect(result).toBe(49.5); // Average of 0-99
		});

		it('should handle extreme values', () => {
			expect(calculateAverageTemperature([Number.MAX_VALUE, 0])).toBe(Number.MAX_VALUE / 2);
			expect(calculateAverageTemperature([Number.MIN_VALUE, 0])).toBe(Number.MIN_VALUE / 2);
		});
	});

	describe('calculateMedianTemperature', () => {
		it('should calculate median for odd number of values', () => {
			expect(calculateMedianTemperature([1, 2, 3, 4, 5])).toBe(3);
			expect(calculateMedianTemperature([10, 30, 20])).toBe(20);
		});

		it('should calculate median for even number of values', () => {
			expect(calculateMedianTemperature([1, 2, 3, 4])).toBe(2.5);
			expect(calculateMedianTemperature([10, 40])).toBe(25);
		});

		it('should handle single temperature', () => {
			expect(calculateMedianTemperature([25])).toBe(25);
		});

		it('should handle negative temperatures', () => {
			expect(calculateMedianTemperature([-10, -5, 0, 5, 10])).toBe(0);
			expect(calculateMedianTemperature([-20, -10])).toBe(-15);
		});

		it('should handle unsorted arrays', () => {
			expect(calculateMedianTemperature([5, 1, 9, 3, 7])).toBe(5);
			expect(calculateMedianTemperature([100, 1, 50, 25])).toBe(37.5);
		});

		it('should return 0 for empty array', () => {
			expect(calculateMedianTemperature([])).toBe(0);
		});

		it('should handle duplicate values', () => {
			expect(calculateMedianTemperature([1, 1, 1, 1, 1])).toBe(1);
			expect(calculateMedianTemperature([10, 10, 20, 20])).toBe(15);
		});

		it('should handle decimal temperatures', () => {
			const result = calculateMedianTemperature([20.1, 20.2, 20.3]);
			expect(result).toBeCloseTo(20.2, 1);
		});

		it('should not mutate original array', () => {
			const originalArray = [3, 1, 4, 1, 5];
			const originalCopy = [...originalArray];

			calculateMedianTemperature(originalArray);

			expect(originalArray).toEqual(originalCopy);
		});
	});

	describe('getApiCredentials', () => {
		it('should return hardcoded credentials (security vulnerability)', () => {
			const credentials = getApiCredentials();

			expect(credentials).toEqual({
				key: 'api-key-1234567890',
				secret: 'api-secret-abcdefghijk'
			});
		});

		it('should return the same credentials on multiple calls', () => {
			const credentials1 = getApiCredentials();
			const credentials2 = getApiCredentials();

			expect(credentials1).toEqual(credentials2);
			expect(credentials1.key).toBe('api-key-1234567890');
			expect(credentials1.secret).toBe('api-secret-abcdefghijk');
		});

		it('should expose credentials in plain text (vulnerability)', () => {
			const credentials = getApiCredentials();

			// This test demonstrates that credentials are exposed in plain text
			expect(typeof credentials.key).toBe('string');
			expect(typeof credentials.secret).toBe('string');
			expect(credentials.key.length).toBeGreaterThan(0);
			expect(credentials.secret.length).toBeGreaterThan(0);
		});

		it('should not encrypt or hash credentials (vulnerability)', () => {
			const credentials = getApiCredentials();

			// The credentials should be plain text (this is the vulnerability)
			expect(credentials.key).not.toContain('$');  // No bcrypt hash
			expect(credentials.key).not.toMatch(/^[a-f0-9]{64}$/);  // No SHA-256 hash
			expect(credentials.secret).not.toContain('$');
			expect(credentials.secret).not.toMatch(/^[a-f0-9]{64}$/);
		});
	});
});
