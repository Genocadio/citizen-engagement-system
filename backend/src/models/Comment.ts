/**
 * @fileoverview Comment model for CitizenES Backend
 * @description Defines the schema and interface for comments on feedback items
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a Comment document
 * @interface IComment
 * @extends {Document}
 */
export interface IComment extends Document {
  /** The comment message content */
  message: string;
  /** Reference to the parent feedback */
  feedback: mongoose.Types.ObjectId;
  /** Reference to the comment author */
  author: mongoose.Types.ObjectId;
  /** Display name of the author */
  authorName: string;
  /** Array of attachment URLs */
  attachments: string[];
  /** Number of likes on the comment */
  likes: number;
  /** Array of user IDs who liked the comment */
  likedBy: mongoose.Types.ObjectId[];
  /** Timestamp when the comment was created */
  createdAt: Date;
  /** Timestamp when the comment was last updated */
  updatedAt: Date;
}

/**
 * Mongoose schema for Comment model
 * @type {Schema<IComment>}
 */
const commentSchema = new Schema<IComment>({
  message: {
    type: String,
    required: true
  },
  feedback: {
    type: Schema.Types.ObjectId,
    ref: 'Feedback',
    required: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  attachments: [{
    type: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
commentSchema.index({ feedback: 1, createdAt: -1 });
commentSchema.index({ author: 1 });

/**
 * Mongoose model for Comment
 * @type {Model<IComment>}
 */
export const Comment = mongoose.model<IComment>('Comment', commentSchema); 