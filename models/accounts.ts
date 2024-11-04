import { Schema, model } from 'mongoose';
import { IBase } from './base';
import { ACCOUNT_TYPE_CHOICES, AUTH_TYPE_CHOICES } from './choices';

// Define the Token interface
interface IToken {
  access: string;
  refresh: string;
}

// Define the interface for the User model
interface IUser extends IBase {
  name: string; // full name
  email: string;
  phone: string;
  password: string;
  avatar: string | null;
  isEmailVerified: boolean;
  authType: AUTH_TYPE_CHOICES;
  accountType: ACCOUNT_TYPE_CHOICES;
  isActive: boolean;
  tokens: IToken[];
  otp: number;
  otpExpiry: Date; 
}

// Create the User schema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, maxlength: 500 },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: false, default: null },
  password: { type: String, required: true },
  avatar: { type: String, default: null, required: false },
  isEmailVerified: { type: Boolean, default: false },
  authType: { type: String, enum: AUTH_TYPE_CHOICES, default: AUTH_TYPE_CHOICES.GENERAL },
  accountType: { type: String, enum: ACCOUNT_TYPE_CHOICES, default: ACCOUNT_TYPE_CHOICES.BUYER },
  isActive: { type: Boolean, default: true },
  tokens: [
    {
      access: { type: String, required: true },
      refresh: { type: String, required: true },
    },
  ],
  otp: { type: Number, null: true, blank: true },
  otpExpiry: { type: Date, null: true, blank: true },
}, { timestamps: true });

// Create the User model
const User = model<IUser>('User', UserSchema);
export { User, IUser };
