import { Router } from 'express';
import { WateringController } from '../controllers/watering.controller.js';

const router = Router();

router.post('/start', WateringController.start);
router.post('/stop', WateringController.stop);
router.post('/mode', WateringController.setMode);
router.get('/logs', WateringController.getLogs);

export default router;
