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
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IListing>('Listing', ListingSchema);
