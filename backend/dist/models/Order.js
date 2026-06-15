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
const OrderSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    productName: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    purchaseDate: { type: Date, required: true },
    originalPurchasePrice: { type: Number, required: true },
    productImage: { type: String, required: true },
    orderId: { type: String, required: true, unique: true },
    deliveryStatus: { type: String, default: 'Delivered' },
    // Smart Returns and Sustainability parameters
    returnStatus: { type: String, enum: ['None', 'Return Initiated', 'Returned'], default: 'None' },
    returnOption: { type: String, enum: ['standard', 'flexible', 'hub'], default: 'standard' },
    returnCreditsEarned: { type: Number, default: 0 },
    sustainabilityScore: { type: Number, default: 80 },
    sustainabilityBadge: { type: String, enum: ['Bronze', 'Silver', 'Gold'], default: 'Silver' },
    co2Savings: { type: Number, default: 15 },
    packaging: { type: String, default: 'Eco-friendly Cardboard' },
    repairability: { type: Number, default: 8 },
    returnRate: { type: Number, default: 2 },
    createdAt: { type: Date, default: Date.now }
});
exports.default = mongoose_1.default.model('Order', OrderSchema);
