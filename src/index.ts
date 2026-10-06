import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import path from 'node:path';
import userRoutes from './UserRoutes';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(cors());
app.use('/api', userRoutes);
app.use(express.static(path.join(__dirname, '../src/public')));

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello, World!');
});

const mongoUri = process.env.MONGODB_URI;
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be an integer between 1 and 65535');
  process.exitCode = 1;
} else if (!mongoUri) {
  console.error('Set MONGODB_URI in .env before starting the server');
  process.exitCode = 1;
} else {
  mongoose.connect(mongoUri)
    .then(() => {
      const server = app.listen(port);
      server.on('listening', () => console.log(`Server is running on port ${port}`));
      server.on('error', (error: NodeJS.ErrnoException) => {
        console.error(error.code === 'EADDRINUSE'
          ? `Port ${port} is already in use`
          : 'Could not start the server');
        process.exitCode = 1;
        void mongoose.disconnect();
      });
    })
    .catch(() => {
      console.error('Could not connect to MongoDB. Check MONGODB_URI and network access.');
      process.exitCode = 1;
    });
}
