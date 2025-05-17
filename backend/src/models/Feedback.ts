import mongoose, { Document, Schema } from 'mongoose';

export interface Location {
  country?: string;
  province?: string;
  district?: string;
  sector?: string;
  otherDetails?: string;
}

export interface IFeedback extends Document {
  ticketId: string;
  title: string;
  description: string;
  type: 'Complaint' | 'Positive' | 'Suggestion';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  category: string;
  subcategory?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  author: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  attachments: string[];
  chatEnabled: boolean;
  likes: number;
  likedBy: mongoose.Types.ObjectId[];
  followers: mongoose.Types.ObjectId[];
  isAnonymous: boolean;
  location?: Location;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<Location>({
  country: {
    type: String,
    trim: true
  },
  province: {
    type: String,
    trim: true
  },
  district: {
    type: String,
    trim: true
  },
  sector: {
    type: String,
    trim: true
  },
  otherDetails: {
    type: String,
    trim: true
  }
});

const feedbackSchema = new Schema<IFeedback>({
  ticketId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Complaint', 'Positive', 'Suggestion'],
    required: true,
    set: (v: string) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed'],
    default: 'open'
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    set: (v: string) => v.toLowerCase()
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: function(this: IFeedback) {
      return !this.isAnonymous;
    }
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    type: String
  }],
  chatEnabled: {
    type: Boolean,
    default: true
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  location: {
    type: locationSchema
  }
}, {
  timestamps: true
});

// Generate 6-character alphanumeric ticket ID
feedbackSchema.pre('validate', async function(next) {
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

// Generate short unique ticket ID and set priority based on type
feedbackSchema.pre('save', async function(next) {
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

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema); 