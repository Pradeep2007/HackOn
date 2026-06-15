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
const FlashDealSchema = new mongoose_1.Schema({
    productName: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    productImage: { type: String, required: true },
    conditionGrade: { type: String, required: true },
    conditionScore: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    dealPrice: { type: Number, required: true },
    durationMinutes: { type: Number, default: 15 },
    timeLeftSeconds: { type: Number, default: 900 }, // 15 mins default
    potentialBuyers: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Claimed', 'Expired'], default: 'Active' },
    hubLocation: { type: String, required: true },
    assignedBuyer: { type: String },
    routeOptimized: { type: Boolean, default: false },
    orderId: { type: String },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('FlashDeal', FlashDealSchema);
