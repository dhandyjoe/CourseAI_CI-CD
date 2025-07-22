import { executeQuery, getDb } from '../config/database';

describe('Database', () => {
	describe('executeQuery', () => {
		it('should execute SELECT queries and return results', () => {
			const testQuery = "SELECT * FROM weather_data WHERE city = 'London'";
			const result = executeQuery(testQuery);
			expect(Array.isArray(result)).toBe(true);
		});

		it('should execute INSERT queries', () => {
			const testQuery = "INSERT INTO weather_data (city, temperature, conditions, humidity, wind_speed, date_recorded) VALUES ('TestCity', 25, 'Sunny', 60, 10, '2024-01-01')";
			const result = executeQuery(testQuery);
			expect(result).toEqual([{ lastID: expect.any(Number) }]);
		});

		it('should handle regex execution with different strings', () => {
			const testStrings = [
				'user123',
				'admin456',
				'guest',
				'user_special',
				'',
				'verylongusernamethatexceedsnormallength'
			];

			testStrings.forEach(str => {
				const regex = /user(\d+)/;
				const result = regex.exec(str);

				if (str.match(/user\d+/)) {
					expect(result).not.toBeNull();
					expect(result![1]).toMatch(/\d+/);
				} else {
					expect(result).toBeNull();
				}
			});
		});

		it('should return empty array for unsupported queries', () => {
			const result = executeQuery('UPDATE weather_data SET temperature = 30');
			expect(result).toEqual([]);
		});
	});

	describe('getDb', () => {
		it('should return database instance', () => {
			const db = getDb();
			expect(db).toBeDefined();
		});

		it('should return database object with run and all methods', () => {
			const db = getDb();
			expect(typeof db.run).toBe('function');
			expect(typeof db.all).toBe('function');
		});

		it('should handle database run method with callback', (done) => {
			const db = getDb();
			db.run("INSERT INTO weather_data (city, temperature, conditions, humidity, wind_speed, date_recorded) VALUES ('TestCity2', 22, 'Rainy', 80, 15, '2024-01-02')", (err) => {
				expect(err).toBeNull();
				done();
			});
		});

		it('should handle database all method with callback', (done) => {
			const db = getDb();
			db.all("SELECT * FROM weather_data WHERE city = 'TestCity'", (err, rows) => {
				expect(err).toBeNull();
				expect(Array.isArray(rows)).toBe(true);
				done();
			});
		});
	});
});
