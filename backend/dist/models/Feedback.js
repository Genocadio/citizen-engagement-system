"use strict";
/**
 * @fileoverview Feedback model for CitizenES Backend
 * @description Defines the schema and interface for user feedback items
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feedback = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Mongoose schema for Location
 * @type {Schema<Location>}
 */
const locationSchema = new mongoose_1.Schema({
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
const feedbackSchema = new mongoose_1.Schema({
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
        set: (v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase(),
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
        set: (v) => v.toLowerCase(),
    },
    author: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: function () {
            return !this.isAnonymous;
        },
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    followers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true,
});
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
            const exists = await mongoose_1.default.model('Feedback').findOne({ ticketId });
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
exports.Feedback = mongoose_1.default.model('Feedback', feedbackSchema);
