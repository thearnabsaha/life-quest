import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import categoryRoutes from './routes/category.routes';
import xpRoutes from './routes/xp.routes';
import habitRoutes from './routes/habit.routes';
import calendarRoutes from './routes/calendar.routes';
import goalRoutes from './routes/goal.routes';
import notificationRoutes from './routes/notification.routes';
import rulebookRoutes from './routes/rulebook.routes';
import shopRoutes from './routes/shop.routes';
import radarRoutes from './routes/radar.routes';
import aiRoutes from './routes/ai.routes';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rulebook', rulebookRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/radar', radarRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Life-Quest server running on port ${env.PORT}`);
});
