"use strict";
/**
 * @fileoverview Response model for CitizenES Backend
 * @description Defines the schema and interface for feedback responses
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
exports.Response = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Mongoose schema for Response model
 * @type {Schema<IResponse>}
 */
const responseSchema = new mongoose_1.Schema({
    feedback: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Feedback',
        required: true,
    },
    by: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
}, {
    timestamps: true,
});
// Add indexes for better query performance
responseSchema.index({ feedback: 1, createdAt: -1 });
responseSchema.index({ by: 1 });
responseSchema.index({ statusUpdate: 1 });
/**
 * Mongoose model for Response
 * @type {Model<IResponse>}
 */
exports.Response = mongoose_1.default.model('Response', responseSchema);
