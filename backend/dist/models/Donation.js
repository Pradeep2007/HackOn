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
const DonationSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Order', required: true },
    productName: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    productImage: { type: String, required: true },
    conditionScore: { type: Number, required: true },
    conditionCategory: { type: String, required: true },
    organizationName: { type: String, required: true },
    organizationType: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    matchScore: { type: Number, required: true },
    beneficiariesHelped: { type: Number, required: true },
    beneficiaryType: { type: String, required: true },
    co2Savings: { type: Number, default: 0 },
    wastePrevented: { type: Number, default: 1 },
    greenCreditsEarned: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Created', 'Pickup Scheduled', 'Picked Up', 'Delivered', 'Impact Recorded'],
        default: 'Created'
    },
    certificateId: { type: String, required: true, unique: true },
    timeline: [{
            status: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
            description: { type: String, required: true }
        }],
    pickupAddress: { type: String, required: true },
    pickupDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Donation', DonationSchema);
