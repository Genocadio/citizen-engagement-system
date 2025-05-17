import mongoose, { Document, Schema } from 'mongoose';

export type StatusType = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface IResponse extends Document {
  feedback: mongoose.Types.ObjectId;
  by: mongoose.Types.ObjectId;
  message: string;
  attachments: string[];
  statusUpdate: StatusType;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const responseSchema = new Schema<IResponse>({
  feedback: {
    type: Schema.Types.ObjectId,
    ref: 'Feedback',
    required: true
  },
  by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    type: String
  }],
  statusUpdate: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    required: true
  },
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

export const Response = mongoose.model<IResponse>('Response', responseSchema); 