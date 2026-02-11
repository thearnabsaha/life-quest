import { Router } from 'express';
import * as goalController from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', goalController.getUserGoals);
router.post('/', goalController.createGoal);
router.patch('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);
router.post('/:id/progress', goalController.updateGoalProgress);

export default router;
