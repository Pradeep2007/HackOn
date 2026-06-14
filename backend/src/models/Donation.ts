import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  user: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  productName: string;
  brand: string;
  category: string;
  productImage: string;
  conditionScore: number;
  conditionCategory: string;
  
  // Organization details
  organizationName: string;
  organizationType: string;
  distanceKm: number;
  matchScore: number;
  beneficiariesHelped: number;
  beneficiaryType: string; // "students" | "readers" | "community members"

  // Sustainability Impact
  co2Savings: number;
  wastePrevented: number;
  greenCreditsEarned: number;

  // Logistics tracking
  status: 'Created' | 'Pickup Scheduled' | 'Picked Up' | 'Delivered' | 'Impact Recorded';
  certificateId: string;
  timeline: Array<{
    status: string;
    timestamp: Date;
    description: string;
  }>;
  pickupAddress: string;
  pickupDate?: Date;

  createdAt: Date;
}

const DonationSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
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

export default mongoose.model<IDonation>('Donation', DonationSchema);
