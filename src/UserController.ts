import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { Request, Response } from 'express';
import { IUser } from './User';

const users = new Map<string, IUser>();

function validText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validEmail(value: unknown): value is string {
  return validText(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function publicUser(user: IUser) {
  return { id: user.id, name: user.name, email: user.email };
}

function getId(req: Request): string | undefined {
  const { id } = req.params;
  return typeof id === 'string' ? id : undefined;
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body ?? {};
  if (!validText(name) || !validEmail(email) || !validText(password)) {
    res.status(400).json({ message: 'Name, email and password are required' });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if ([...users.values()].some((user) => user.email === normalizedEmail)) {
    res.status(409).json({ message: 'Email already exists' });
    return;
  }

  const user: IUser = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 10),
  };
  users.set(user.id, user);
  res.status(201).json(publicUser(user));
}

export function getUsers(_req: Request, res: Response): void {
  res.json([...users.values()].map(publicUser));
}

export function getUserById(req: Request, res: Response): void {
  const id = getId(req);
  const user = id ? users.get(id) : undefined;
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json(publicUser(user));
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = getId(req);
  const user = id ? users.get(id) : undefined;
  if (!user) {
    res.status(404).json({ message: 'User not found' });
    return;
  }

  const { name, email, password } = req.body ?? {};
  if ((name !== undefined && !validText(name)) ||
      (email !== undefined && !validEmail(email)) ||
      (password !== undefined && !validText(password))) {
    res.status(400).json({ message: 'Invalid user data' });
    return;
  }
  if (name === undefined && email === undefined && password === undefined) {
    res.status(400).json({ message: 'No user data to update' });
    return;
  }

  const normalizedEmail = email === undefined ? user.email : email.trim().toLowerCase();
  if ([...users.values()].some((item) => item.id !== user.id && item.email === normalizedEmail)) {
    res.status(409).json({ message: 'Email already exists' });
    return;
  }

  if (name !== undefined) user.name = name.trim();
  if (email !== undefined) user.email = normalizedEmail;
  if (password !== undefined) user.password = await bcrypt.hash(password, 10);
  res.json(publicUser(user));
}

export function deleteUser(req: Request, res: Response): void {
  const id = getId(req);
  if (!id || !users.delete(id)) {
    res.status(404).json({ message: 'User not found' });
    return;
  }
  res.json({ message: 'User deleted' });
}
