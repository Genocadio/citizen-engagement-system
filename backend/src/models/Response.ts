/**
 * @fileoverview Response model for CitizenES Backend
 * @description Defines the schema and interface for feedback responses
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Type definition for response status
 * @typedef {('open'|'in-progress'|'resolved'|'closed')} StatusType
 */
export type StatusType = 'open' | 'in-progress' | 'resolved' | 'closed';

/**
 * Interface representing a Response document
 * @interface IResponse
 * @extends {Document}
 */
export interface IResponse extends Document {
  /** Reference to the feedback this response belongs to */
  feedback: mongoose.Types.ObjectId;
  /** Reference to the user who created the response */
  by: mongoose.Types.ObjectId;
  /** Response message content */
  message: string;
  /** Array of attachment URLs */
  attachments: string[];
  /** Current status of the response */
  statusUpdate: StatusType;
  /** Number of likes on the response */
  likes: number;
  /** Array of user IDs who liked the response */
  likedBy: mongoose.Types.ObjectId[];
  /** Timestamp when the response was created */
  createdAt: Date;
  /** Timestamp when the response was last updated */
  updatedAt: Date;
}

/**
 * Mongoose schema for Response model
 * @type {Schema<IResponse>}
 */
const responseSchema = new Schema<IResponse>(
  {
    feedback: {
      type: Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,
    },
    by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    attachments: [
      {
        type: String,
      },
    ],
    statusUpdate: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
responseSchema.index({ feedback: 1, createdAt: -1 });
responseSchema.index({ by: 1 });
responseSchema.index({ statusUpdate: 1 });

/**
 * Mongoose model for Response
 * @type {Model<IResponse>}
 */
export const Response = mongoose.model<IResponse>('Response', responseSchema);
