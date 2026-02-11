import { Router } from 'express';
import * as calendarController from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

router.use(authenticate);

router.get('/', calendarController.getCalendarData);

export default router;
