import { Router } from 'express';
import * as radarController from '../controllers/radar.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', radarController.getRadarStats);
router.get('/subcategories', radarController.getSubCategoryRadar);

export default router;
