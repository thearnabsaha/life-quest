import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.post('/reset', profileController.resetProfile);

export default router;
