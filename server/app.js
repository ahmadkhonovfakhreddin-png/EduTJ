import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import meRoutes from './routes/meRoutes.js';
import centerRoutes from './routes/centerRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  const allowed = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map((s) => s.trim())
    : true;

  app.use(
    cors({
      origin: allowed,
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/me', meRoutes);
  app.use('/api/centers', centerRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/bookmarks', bookmarkRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
