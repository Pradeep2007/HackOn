import mongoose, { Schema, Document } from 'mongoose';

export interface IListing extends Document {
  order: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  sellingPrice: number;
  description: string;
  conditionNotes: string;
  images: string[];
  video?: string;
  aiReport?: mongoose.Types.ObjectId;
  isPurchasedOnAmazon: boolean;
  isSellerVerified: boolean;
  isAiVerified: boolean;
  status: 'Active' | 'Sold' | 'Inactive';
  
  // Resell Enhancements
  imei?: string;
  serialNumber?: string;
  verificationCode: string;
  ownershipConfidence: number;
  functionalScore?: number;
  functionalChecks?: any;
  zipCode: string;

  // New Trust Model enhancements
  trustScore: number;
  productMatchScore: number;
  expectedAttributes?: any;
  detectedAttributes?: any;

  createdAt: Date;
}

const ListingSchema: Schema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sellingPrice: { type: Number, required: true },
  description: { type: String, required: true },
  conditionNotes: { type: String, required: true },
  images: [{ type: String }],
  video: { type: String },
  aiReport: { type: Schema.Types.ObjectId, ref: 'AIReport' },
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
  functionalChecks: { type: Schema.Types.Mixed },
  zipCode: { type: String, required: true, default: '110001' },

  // Trust Model scores
  trustScore: { type: Number, default: 90 },
  productMatchScore: { type: Number, default: 100 },
  expectedAttributes: { type: Schema.Types.Mixed },
  detectedAttributes: { type: Schema.Types.Mixed },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IListing>('Listing', ListingSchema);
