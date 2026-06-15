import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashDeal extends Document {
  productName: string;
  brand: string;
  category: string;
  productImage: string;
  conditionGrade: string;
  conditionScore: number;
  discountPercent: number;
  distanceKm: number;
  originalPrice: number;
  dealPrice: number;
  durationMinutes: number;
  timeLeftSeconds: number;
  potentialBuyers: number;
  status: 'Active' | 'Claimed' | 'Expired';
  hubLocation: string;
  assignedBuyer?: string;
  routeOptimized?: boolean;
  orderId?: string;
  createdAt: Date;
}

const FlashDealSchema: Schema = new Schema({
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

export default mongoose.model<IFlashDeal>('FlashDeal', FlashDealSchema);
