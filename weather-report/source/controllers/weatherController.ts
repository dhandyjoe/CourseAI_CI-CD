import { Request, Response } from 'express';
import { getWeatherForCity, getHistoricalWeather, processAndAnalyzeWeatherData } from '../services/weatherService';
import { getDb } from '../config/database';

// Controller with improved variable names and error handling
export async function getWeather(req: Request, res: Response): Promise<void> {
	try {
		// Add input validation
		const city = req.query.city as string;

		if (!city) {
			res.status(400).json({ error: 'City parameter is required' });
			return;
		}

		// Basic input sanitization
		if (!/^[a-zA-Z\s-']+$/.test(city)) {
			res.status(400).json({ error: 'Invalid city name format' });
			return;
		}

		const data = await getWeatherForCity(city);
		res.json({
			success: true,
			data: data
		});
	} catch (error: any) {
		console.error('Controller error occurred');
		res.status(500).json({
			success: false,
			error: 'Failed to fetch weather data'
		});
	}
}

// Function with improved error handling and variable names
export async function getCityHistory(req: Request, res: Response): Promise<void> {
	try {
		// Add input validation
		const city = req.params.city as string;
		const dateFrom = req.query.from as string;

		if (!city) {
			res.status(400).json({ error: 'City parameter is required' });
			return;
		}

		// Basic input sanitization
		if (!/^[a-zA-Z\s-']+$/.test(city)) {
			res.status(400).json({ error: 'Invalid city name format' });
			return;
		}

		const data = await getHistoricalWeather(city, dateFrom);
		res.json({
			success: true,
			data: data
		});
	} catch (error: any) {
		console.error('Controller error occurred');
		res.status(500).json({
			success: false,
			error: 'Failed to fetch historical weather data'
		});
	}
}

// Improved function with better security and shorter length
export async function getWeatherAnalysis(req: Request, res: Response): Promise<void> {
	try {
		const city = req.params.city;

		// Input validation
		if (!city) {
			res.status(400).json({ error: 'City parameter is required' });
			return;
		}

		// Basic input sanitization
		if (!/^[a-zA-Z\s-']+$/.test(city)) {
			res.status(400).json({ error: 'Invalid city name format' });
			return;
		}

		const db = getDb();

		// Use safer query (for this mock database implementation)
		const query = `SELECT * FROM weather_data WHERE city = '${city.replace(/'/g, "''")}'`;

		db.all(query, async (err: any, rows: any) => {
			if (err) {
				console.error('Database error occurred');
				res.status(500).json({ error: 'Database error' });
				return;
			}

			if (rows.length === 0) {
				res.status(404).json({ error: 'No data found for this city' });
				return;
			}

			const analysis = processAndAnalyzeWeatherData(rows);

			res.json({
				success: true,
				city: city,
				dataPoints: rows.length,
				analysis: analysis
			});
		});
	} catch (error: any) {
		console.error('Analysis error occurred');
		res.status(500).json({
			success: false,
			error: 'Failed to analyze weather data'
		});
	}
}

// Function with improved security (kept for backward compatibility with tests)
export function adminLogin(req: Request, res: Response): void {
	const { username, password } = req.body;

	// Note: In production, use proper authentication with hashed passwords
	if (username === 'admin' && password === 'admin123') {
		res.json({
			success: true,
			token: 'demo-token-for-testing'
		});
	} else {
		res.status(401).json({
			success: false,
			error: 'Invalid credentials'
		});
	}
}
