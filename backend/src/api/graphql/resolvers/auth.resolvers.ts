import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { User, IUser } from '../../../models/User';
import { logger } from '../../../utils/logger';
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import mongoose from 'mongoose';

interface JWTPayload {
  id: string;
}

export const authResolvers = {
  Mutation: {
    login: async (_: any, { email, password }: { email: string; password: string }) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() }) as IUser & { _id: mongoose.Types.ObjectId };
        if (!user) {
          throw new AuthenticationError('User not found');
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
          throw new AuthenticationError('Invalid password');
        }

        const secret: Secret = process.env.JWT_SECRET || 'your-secret-key';
        const options: SignOptions = { expiresIn: '7d' };
        const payload: JWTPayload = { id: user._id.toString() };

        const token = jwt.sign(payload, secret, options);

        return {
          token,
          user
        };
      } catch (error) {
        logger.error('Login error:', error);
        throw error;
      }
    },

    register: async (_: any, { input }: { input: any }) => {
      try {
        // Check for existing user with same email, username, or phone number
        const existingUser = await User.findOne({
          $or: [
            { email: input.email.toLowerCase() },
            { username: input.username?.toLowerCase() },
            { phoneNumber: input.phoneNumber }
          ]
        });

        if (existingUser) {
          if (existingUser.email === input.email.toLowerCase()) {
            throw new UserInputError('Email already registered');
          }
          if (input.username && existingUser.username === input.username.toLowerCase()) {
            throw new UserInputError('Username already taken');
          }
          if (input.phoneNumber && existingUser.phoneNumber === input.phoneNumber) {
            throw new UserInputError('Phone number already registered');
          }
        }

        // Create new user with lowercase email and username
        const user = await User.create({
          ...input,
          email: input.email.toLowerCase(),
          username: input.username?.toLowerCase(),
          role: 'user'
        }) as IUser & { _id: mongoose.Types.ObjectId };

        const secret: Secret = process.env.JWT_SECRET || 'your-secret-key';
        const options: SignOptions = { expiresIn: '7d' };
        const payload: JWTPayload = { id: user._id.toString() };

        const token = jwt.sign(payload, secret, options);

        return {
          token,
          user
        };
      } catch (error) {
        logger.error('Registration error:', error);
        if (error instanceof mongoose.Error.ValidationError) {
          throw new UserInputError('Invalid input data');
        }
        throw error;
      }
    }
  }
}; 