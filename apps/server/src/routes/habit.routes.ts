import { Router } from 'express';
import * as habitController from '../controllers/habit.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', habitController.getUserHabits);
router.post('/', habitController.createHabit);
router.get('/:id', habitController.getHabit);
router.patch('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);
router.post('/:id/complete', habitController.completeHabit);

export default router;
