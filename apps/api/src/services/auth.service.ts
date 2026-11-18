import bcrypt from 'bcryptjs';
import type { LoginInput, RegisterInput } from '@nabd/shared';
import { AppError } from '../errors/AppError';
import { UserModel } from '../models/User.model';

const SALT_ROUNDS = 10;

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();

  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 'Email is already registered', 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  return UserModel.create({
    email,
    passwordHash,
    name: input.name,
    role: input.role ?? 'student',
    language: input.language ?? 'ar',
  });
}

export async function authenticate(input: LoginInput) {
  const user = await UserModel.findOne({ email: input.email.toLowerCase() });
  const passwordOk = user ? await bcrypt.compare(input.password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  return user;
}
