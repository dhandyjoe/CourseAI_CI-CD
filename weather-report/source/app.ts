import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { weatherRoutes } from './routes/weatherRoutes';
import { initDb } from './config/database';

// Load env vars (but we'll still hardcode some secrets as a vulnerability)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev')); // Logging middleware with default config (vulnerability)
app.use(cors()); // Open CORS policy (vulnerability)
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database
initDb();

// Routes
app.use('/api/weather', weatherRoutes);

// Basic error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	console.error('Application error occurred');
	res.status(500).json({
		error: 'Internal server error'
	});
});

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

export default app;
