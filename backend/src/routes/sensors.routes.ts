import { Router } from 'express';
import { SensorsController } from '../controllers/sensors.controller.js';

const router = Router();

router.get('/latest', SensorsController.getLatest);
router.get('/history', SensorsController.getHistory);
router.get('/recent', SensorsController.getRecent);
router.get('/summary', SensorsController.getSummary);

export default router;
