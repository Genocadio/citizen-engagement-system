/**
 * @fileoverview Feedback model for CitizenES Backend
 * @description Defines the schema and interface for user feedback items
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface representing a location
 * @interface Location
 */
export interface Location {
  /** Country name */
  country?: string;
  /** Province/State name */
  province?: string;
  /** District/County name */
  district?: string;
  /** Sector/Area name */
  sector?: string;
  /** Additional location details */
  otherDetails?: string;
}

/**
 * Interface representing a Feedback document
 * @interface IFeedback
 * @extends {Document}
 */
export interface IFeedback extends Document {
  /** Unique ticket identifier */
  ticketId: string;
  /** Feedback title */
  title: string;
  /** Detailed feedback description */
  description: string;
  /** Type of feedback */
  type: 'Complaint' | 'Positive' | 'Suggestion';
  /** Current status of the feedback */
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  /** Main category of the feedback */
  category: string;
  /** Subcategory of the feedback */
  subcategory?: string;
  /** Priority level of the feedback */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** Reference to the feedback author */
  author: mongoose.Types.ObjectId;
  /** Reference to the assigned staff member */
  assignedTo?: mongoose.Types.ObjectId;
  /** Array of attachment URLs */
  attachments: string[];
  /** Whether chat is enabled for this feedback */
  chatEnabled: boolean;
  /** Number of likes */
  likes: number;
  /** Array of user IDs who liked the feedback */
  likedBy: mongoose.Types.ObjectId[];
  /** Array of user IDs following this feedback */
  followers: mongoose.Types.ObjectId[];
  /** Whether the feedback is anonymous */
  isAnonymous: boolean;
  /** Location information */
  location?: Location;
  /** Timestamp when the feedback was created */
  createdAt: Date;
  /** Timestamp when the feedback was last updated */
  updatedAt: Date;
}

/**
 * Mongoose schema for Location
 * @type {Schema<Location>}
 */
const locationSchema = new Schema<Location>({
  country: {
    type: String,
    trim: true,
  },
  province: {
    type: String,
    trim: true,
  },
  district: {
    type: String,
    trim: true,
  },
  sector: {
    type: String,
    trim: true,
  },
  otherDetails: {
    type: String,
    trim: true,
  },
});

/**
 * Mongoose schema for Feedback model
 * @type {Schema<IFeedback>}
 */
const feedbackSchema = new Schema<IFeedback>(
  {
    ticketId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Complaint', 'Positive', 'Suggestion'],
      required: true,
      set: (v: string) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open',
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      set: (v: string) => v.toLowerCase(),
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: function (this: IFeedback) {
        return !this.isAnonymous;
      },
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [
      {
        type: String,
      },
    ],
    chatEnabled: {
      type: Boolean,
      default: true,
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
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    location: {
      type: locationSchema,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-validate hook to generate unique ticket ID
 * Generates a 6-character alphanumeric ticket ID
 */
feedbackSchema.pre('validate', async function (next) {
  if (this.isNew) {
    const generateTicketId = async () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let ticketId = '';
      for (let i = 0; i < 6; i++) {
        ticketId += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const exists = await mongoose.model('Feedback').findOne({ ticketId });
      if (exists) {
        return generateTicketId();
      }
      return ticketId;
    };

    this.ticketId = await generateTicketId();
  }
  next();
});

/**
 * Pre-save hook to set priority based on feedback type
 */
feedbackSchema.pre('save', async function (next) {
  if (this.isNew) {
    // Set priority based on type
    switch (this.type) {
      case 'Complaint':
        this.priority = 'high';
        break;
      case 'Suggestion':
        this.priority = 'medium';
        break;
      case 'Positive':
        this.priority = 'low';
        break;
    }
  }
  next();
});

// Indexes for better query performance
feedbackSchema.index({ category: 1, status: 1 });
feedbackSchema.index({ category: 1, subcategory: 1 });
feedbackSchema.index({ author: 1 });
feedbackSchema.index({ assignedTo: 1 });
feedbackSchema.index({ 'location.country': 1, 'location.province': 1 });
feedbackSchema.index({ isAnonymous: 1 });
feedbackSchema.index({ ticketId: 1 });

/**
 * Mongoose model for Feedback
 * @type {Model<IFeedback>}
 */
export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
