import cors from 'cors';
import express, { Request, Response } from 'express';
import path from 'node:path';
import userRoutes from './UserRoutes';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../src/public')));

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello, World!');
});

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error('PORT must be an integer between 1 and 65535');
  process.exitCode = 1;
}

app.use('/api', userRoutes);

if (process.exitCode !== 1) {
  const server = app.listen(port, '0.0.0.0');
  server.on('listening', () => console.log(`Server is running on port ${port}`));
  server.on('error', (error: NodeJS.ErrnoException) => {
    console.error(error.code === 'EADDRINUSE'
      ? `Port ${port} is already in use`
      : 'Could not start the server');
    process.exitCode = 1;
  });
}
