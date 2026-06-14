import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  productName: string;
  brand: string;
  category: string;
  purchaseDate: Date;
  originalPurchasePrice: number;
  productImage: string;
  orderId: string;
  deliveryStatus: string;
  
  // Sustainability & Smart Returns
  returnStatus: 'None' | 'Return Initiated' | 'Returned';
  returnOption?: 'standard' | 'flexible' | 'hub';
  returnCreditsEarned?: number;
  sustainabilityScore: number;
  sustainabilityBadge: 'Bronze' | 'Silver' | 'Gold';
  co2Savings: number;
  packaging?: string;
  repairability?: number;
  returnRate?: number;

  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export default mongoose.model<IOrder>('Order', OrderSchema);
