import { Router } from 'express';
import { DevicesController } from '../controllers/devices.controller.js';

const router = Router();

router.post('/connect', DevicesController.connect);
router.get('/', DevicesController.getDevices);
router.get('/:id', DevicesController.getDevice);
router.post('/:id/disconnect', DevicesController.disconnect);
router.get('/:id/status', DevicesController.checkStatus);

export default router;
