import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from './User';

function validText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function validEmail(value: unknown): value is string {
  return validText(value) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.isValidObjectId(id);
}

function sendError(res: Response, error: unknown): void {
  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: 'Invalid user data' });
  } else if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    res.status(409).json({ message: 'Email already exists' });
  } else {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const { name, email, password } = req.body ?? {};
  if (!validText(name) || !validEmail(email) || !validText(password)) {
    res.status(400).json({ message: 'Name, email and password are required' });
    return;
  }

  try {
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ id: user.id, name: user.name, email: user.email });
  } catch (error) {
    sendError(res, error);
  }
}

export async function getUsers(_req: Request, res: Response): Promise<void> {
  try {
    res.json(await User.find().select('name email'));
  } catch (error) {
    sendError(res, error);
  }
}

export async function getUserById(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  if (!validId(id)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }
  try {
    const user = await User.findById(id).select('name email');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    sendError(res, error);
  }
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  if (!validId(id)) {
    res.status(400).json({ message: 'Invalid user ID' });
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

  try {
    const changes: Partial<{ name: string; email: string; password: string }> = {};
    if (name !== undefined) changes.name = name.trim();
    if (email !== undefined) changes.email = email.trim().toLowerCase();
    if (password !== undefined) changes.password = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(id, changes, {
      returnDocument: 'after',
      runValidators: true,
    }).select('name email');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error) {
    sendError(res, error);
  }
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const id = req.params.id;
  if (!validId(id)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    sendError(res, error);
  }
}
