/**
 * @fileoverview User model for CitizenES Backend
 * @description Defines the schema and interface for user accounts
 */

import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * Interface representing a User document
 * @interface IUser
 * @extends {Document}
 */
export interface IUser extends Document {
  /** User's email address */
  email: string;
  /** Hashed password */
  password: string;
  /** User's first name */
  firstName?: string;
  /** User's last name */
  lastName?: string;
  /** Unique username */
  username?: string;
  /** User's phone number */
  phoneNumber?: string;
  /** URL to user's profile picture */
  profileUrl?: string;
  /** User's role in the system */
  role: 'user' | 'admin';
  /** User's category (for regular users) */
  category?: 'citizen' | 'government' | "infrastructure" | "public-services" | "safety" | "environment" | "other";
  /** User's activity state */
  isActive: boolean;
  /** Last login timestamp */
  lastLoginAt?: Date;
  /** Last activity timestamp */
  lastActivityAt?: Date;
  /** Login history */
  loginHistory: {
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
  }[];
  /** Timestamp when the user was created */
  createdAt: Date;
  /** Timestamp when the user was last updated */
  updatedAt: Date;
  /** Method to compare password with hash */
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * Mongoose schema for User model
 * @type {Schema<IUser>}
 */
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true,
    index: true
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
    index: true
  },
  profileUrl: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  category: {
    type: String,
    enum: ['citizen', 'government', 'infrastructure', 'public-services', 'safety', 'environment', 'other'],
    required: function(this: IUser) {
      return this.role === 'user';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date
  },
  lastActivityAt: {
    type: Date
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      required: true
    },
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

/**
 * Pre-save hook to validate user name
 * Ensures at least one of firstName or lastName is provided
 */
userSchema.pre('save', function(next) {
  if (!this.firstName && !this.lastName) {
    next(new Error('At least one of firstName or lastName must be provided'));
  }
  next();
});

/**
 * Pre-save hook to hash password
 * Hashes the password before saving to the database
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

/**
 * Method to compare password with hash
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} Whether the password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add compound index for firstName and lastName (not unique)
userSchema.index({ firstName: 1, lastName: 1 });

/**
 * Mongoose model for User
 * @type {Model<IUser>}
 */
export const User = mongoose.model<IUser>('User', userSchema); 