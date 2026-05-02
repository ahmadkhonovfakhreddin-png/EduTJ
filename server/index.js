import 'dotenv/config';
import { createApp } from './app.js';

const PORT = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('Warning: JWT_SECRET is not set');
}

if (!process.env.DATABASE_URL) {
  console.warn('Warning: DATABASE_URL is not set');
}

const app = createApp();

app.listen(PORT, () => {
  console.log(`EduTJ API listening on port ${PORT}`);
});
