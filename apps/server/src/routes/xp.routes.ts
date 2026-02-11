import { Router } from 'express';
import * as xpController from '../controllers/xp.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.post('/log', xpController.logXP);
router.get('/logs', xpController.getXPLogs);
router.patch('/logs/:id', xpController.updateXPLog);

export default router;
