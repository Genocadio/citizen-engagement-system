import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  message: string;
  feedback: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  authorName: string;
  attachments: string[];
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

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

export const Comment = mongoose.model<IComment>('Comment', commentSchema); 