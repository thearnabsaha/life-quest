import { Router } from 'express';
import * as rulebookController from '../controllers/rulebook.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', rulebookController.getRulebook);
router.patch('/', rulebookController.updateRulebook);
router.post('/reset', rulebookController.resetRulebook);

export default router;
