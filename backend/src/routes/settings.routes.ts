import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller.js';

const router = Router();

router.get('/', SettingsController.get);
router.put('/', SettingsController.update);
router.post('/cleanup', SettingsController.cleanup);

export default router;
