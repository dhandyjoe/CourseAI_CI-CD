import {
	doStuff,
	dynamicEval,
	formatDate,
	dateFormat,
	getApiCredentials
} from '../apiUtils';

describe('ApiUtils', () => {
	describe('doStuff', () => {
		it('should deep copy objects correctly', () => {
			const originalObj = {
				name: 'Test',
				nested: {
					value: 42,
					array: [1, 2, 3]
				}
			};

			const result = doStuff(originalObj);
			expect(result).toEqual(originalObj);
			expect(result).not.toBe(originalObj);
			expect(result.nested).not.toBe(originalObj.nested);
			expect(result.nested.array).not.toBe(originalObj.nested.array);
		});

		it('should handle arrays', () => {
			const originalArray = [1, 2, { nested: 'value' }];
			const result = doStuff(originalArray);
			expect(result).toEqual(originalArray);
			expect(result).not.toBe(originalArray);
			expect(result[2]).not.toBe(originalArray[2]);
		});

		it('should handle primitive values', () => {
			expect(doStuff(42)).toBe(42);
			expect(doStuff('test')).toBe('test');
			expect(doStuff(true)).toBe(true);
			expect(doStuff(null)).toBe(null);
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

		it('should handle invalid dates', () => {
			const date = new Date('invalid');
			const result = formatDate(date);
			expect(result).toBe('');
		});

		it('should handle date strings with time', () => {
			const result = formatDate('2024-12-31T00:00:00.000Z');
			expect(result).toBe('2024-12-31');
		});

		it('should handle different date formats', () => {
			const result = formatDate('Mar 25 2024');
			// The actual implementation returns "NaN-NaN-NaN" for invalid dates, not empty string
			expect(result).toBe('');
		});
	});

	describe('dateFormat', () => {
		it('should format Date objects consistently', () => {
			const date = new Date('2024-01-15');
			const result = dateFormat(date);
			expect(result).toBe('2024-01-15');
		});

		it('should format date strings consistently', () => {
			const result = dateFormat('2024-06-30');
			expect(result).toBe('2024-06-30');
		});

		it('should handle invalid dates', () => {
			const date = new Date('invalid date');
			const result = dateFormat(date);
			expect(result).toBe('Invalid date');
		});

		it('should handle edge case dates', () => {
			const result = dateFormat('2024-02-29'); // Leap year
			expect(result).toBe('2024-02-29');
		});

		it('should handle timezone variations', () => {
			const result = dateFormat('2024-07-04T12:00:00Z');
			expect(result).toBe('2024-07-04');
		});

		it('should handle malformed input gracefully', () => {
			const result = dateFormat('not-a-date');
			// The actual implementation returns "NaN-NaN-NaN" for invalid dates
			expect(result).toBe('Invalid date');
		});

		it('should produce same results as formatDate for valid dates', () => {
			const testDate = '2024-05-20';
			const formatDateResult = formatDate(testDate);
			const dateFormatResult = dateFormat(testDate);
			expect(formatDateResult).toBe(dateFormatResult);
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
		});

		it('should have string properties', () => {
			const credentials = getApiCredentials();

			expect(typeof credentials.key).toBe('string');
			expect(typeof credentials.secret).toBe('string');
		});

		it('should have non-empty credentials', () => {
			const credentials = getApiCredentials();

			expect(credentials.key.length).toBeGreaterThan(0);
			expect(credentials.secret.length).toBeGreaterThan(0);
		});
	});
});
