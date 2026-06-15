"use strict";
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
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: 'password' },
    avatar: { type: String },
    trustScore: { type: Number, default: 95 },
    ratingsCount: { type: Number, default: 0 },
    defaultZipCode: { type: String, required: true, default: '110001' },
    defaultAddress: { type: String, required: true, default: 'Barakhamba Road, Connaught Place, New Delhi 110001' },
    // Wallet fields
    currentCredits: { type: Number, default: 0 },
    lifetimeCredits: { type: Number, default: 0 },
    redeemedCredits: { type: Number, default: 0 },
    tier: { type: String, enum: ['Green Explorer', 'Eco Warrior', 'Carbon Hero', 'Circular Champion'], default: 'Green Explorer' },
    co2Saved: { type: Number, default: 0 },
    waterSaved: { type: Number, default: 0 },
    wastePrevented: { type: Number, default: 0 },
    refurbishedPurchases: { type: Number, default: 0 },
    greenActionsCount: { type: Number, default: 0 },
    rewardHistory: [{
            activity: { type: String, required: true },
            credits: { type: Number, required: true },
            co2Saved: { type: Number, default: 0 },
            date: { type: Date, default: Date.now }
        }],
    couponsRedeemed: [{
            code: { type: String, required: true },
            reward: { type: String, required: true },
            cost: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }],
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('User', UserSchema);
