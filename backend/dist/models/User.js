"use strict";
/**
 * @fileoverview User model for CitizenES Backend
 * @description Defines the schema and interface for user accounts
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Mongoose schema for User model
 * @type {Schema<IUser>}
 */
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        index: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
        index: true,
    },
    profileUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.+/, 'Please enter a valid URL'],
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    category: {
        type: String,
        enum: [
            'citizen',
            'government',
            'infrastructure',
            'public-services',
            'safety',
            'environment',
            'other',
            'all',
        ],
        required: function () {
            return this.role === 'user';
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    lastLoginAt: {
        type: Date,
    },
    lastActivityAt: {
        type: Date,
    },
    loginHistory: [
        {
            timestamp: {
                type: Date,
                required: true,
            },
            ipAddress: String,
            userAgent: String,
        },
    ],
}, {
    timestamps: true,
});
/**
 * Pre-save hook to validate user name
 * Ensures at least one of firstName or lastName is provided
 */
userSchema.pre('save', function (next) {
    if (!this.firstName && !this.lastName) {
        next(new Error('At least one of firstName or lastName must be provided'));
    }
    next();
});
/**
 * Pre-save hook to hash password
 * Hashes the password before saving to the database
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
/**
 * Method to compare password with hash
 * @param {string} candidatePassword - Password to compare
 * @returns {Promise<boolean>} Whether the password matches
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
// Add compound index for firstName and lastName (not unique)
userSchema.index({ firstName: 1, lastName: 1 });
/**
 * Mongoose model for User
 * @type {Model<IUser>}
 */
exports.User = mongoose_1.default.model('User', userSchema);
