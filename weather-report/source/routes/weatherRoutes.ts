import { Router } from 'express';
import { getWeather, getCityHistory, getWeatherAnalysis, adminLogin } from '../controllers/weatherController';

const router = Router();

// Weather routes
router.get('/current', getWeather);
router.get('/history/:city', getCityHistory);
router.get('/analysis/:city', getWeatherAnalysis);
router.post('/admin/login', adminLogin);

export { router as weatherRoutes };
