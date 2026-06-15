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
const ListingSchema = new mongoose_1.Schema({
    order: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    seller: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    sellingPrice: { type: Number, required: true },
    description: { type: String, required: true },
    conditionNotes: { type: String, required: true },
    images: [{ type: String }],
    video: { type: String },
    aiReport: { type: mongoose_1.Schema.Types.ObjectId, ref: 'AIReport' },
    isPurchasedOnAmazon: { type: Boolean, default: true },
    isSellerVerified: { type: Boolean, default: true },
    isAiVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['Active', 'Sold', 'Inactive'], default: 'Active' },
    // Verification details
    imei: { type: String },
    serialNumber: { type: String },
    verificationCode: { type: String, required: true },
    ownershipConfidence: { type: Number, default: 0 },
    functionalScore: { type: Number },
    functionalChecks: { type: mongoose_1.Schema.Types.Mixed },
    zipCode: { type: String, required: true, default: '110001' },
    // Trust Model scores
    trustScore: { type: Number, default: 90 },
    productMatchScore: { type: Number, default: 100 },
    expectedAttributes: { type: mongoose_1.Schema.Types.Mixed },
    detectedAttributes: { type: mongoose_1.Schema.Types.Mixed },
    // Revenue Model & Sustainability
    buyerPrice: { type: Number, required: true },
    amazonFee: { type: Number, required: true },
    sustainabilityScore: { type: Number, default: 85 },
    sustainabilityBadge: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Silver' },
    co2Savings: { type: Number, default: 12 },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Listing', ListingSchema);
