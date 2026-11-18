import { Schema, model, type InferSchemaType } from 'mongoose';
import { LOCALES, ROLES } from '@nabd/shared';

// Fields follow docs/03_DATA_MODEL.md → users.
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: [...ROLES], required: true, default: 'student' },
    name: { type: String, required: true, trim: true },
    language: { type: String, enum: [...LOCALES], default: 'ar' },
    faculty: { type: String },
    year: { type: Number },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);
