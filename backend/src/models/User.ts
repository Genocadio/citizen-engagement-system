import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  profileUrl?: string;
  role: 'user' | 'admin';
  category?: 'citizen' | 'government';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

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
    enum: ['citizen', 'government'],
    required: function(this: IUser) {
      return this.role === 'user';
    }
  }
}, {
  timestamps: true
});

// Validate that at least one of firstName or lastName is provided
userSchema.pre('save', function(next) {
  if (!this.firstName && !this.lastName) {
    next(new Error('At least one of firstName or lastName must be provided'));
  }
  next();
});

// Hash password before saving
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

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Add compound index for firstName and lastName (not unique)
userSchema.index({ firstName: 1, lastName: 1 });

export const User = mongoose.model<IUser>('User', userSchema); 