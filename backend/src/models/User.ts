import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  trustScore: number;
  ratingsCount: number;
  defaultZipCode: string;
  defaultAddress: string;
  
  // Green Wallet & Sustainability tracking
  currentCredits: number;
  lifetimeCredits: number;
  redeemedCredits: number;
  tier: 'Green Explorer' | 'Eco Warrior' | 'Carbon Hero' | 'Circular Champion';
  co2Saved: number;
  waterSaved: number;
  wastePrevented: number;
  refurbishedPurchases: number;
  greenActionsCount: number;
  rewardHistory: Array<{
    activity: string;
    credits: number;
    co2Saved?: number;
    date: Date;
  }>;
  couponsRedeemed: Array<{
    code: string;
    reward: string;
    cost: number;
    date: Date;
  }>;

  createdAt: Date;
}

const UserSchema: Schema = new Schema({
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

export default mongoose.model<IUser>('User', UserSchema);
