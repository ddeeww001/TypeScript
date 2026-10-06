import cors from 'cors';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import userRoutes from './UserRoutes';

const app = express();
const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI?.trim();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../src/public')));

app.get('/', (_req: Request, res: Response) => {
  if (!mongoUri) {
    res.send('Hello, World!');
    res.status(503).send('Server is running, but MONGODB_URI is not configured.');
    return ;
  }
  res.send('Hello, World!');
});

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be an integer between 1 and 65535');
  process.exitCode = 1;
} else if (!mongoUri) {
  console.warn('Warning: MONGODB_URI is not configured. Set it before using the API.');
} else {
  mongoose.connect(mongoUri)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch(() => {
      console.error('Could not connect to MongoDB. API requests will be unavailable.');
    });
}

app.use('/api', (_req: Request, res: Response, next) => {
  if (!mongoUri) {
    res.status(503).json({ error: 'MONGODB_URI is not configured' });
    return;
  }
  next();
}, userRoutes);

if (process.exitCode !== 1) {
  const server = app.listen(port);
  server.on('listening', () => console.log(`Server is running on port ${port}`));
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error(error.code === 'EADDRINUSE'
      ? `Port ${port} is already in use`
      : 'Could not start the server');
    process.exitCode = 1;
  });
}
