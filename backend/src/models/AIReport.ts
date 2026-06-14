import mongoose, { Schema, Document } from 'mongoose';

export interface IAIReport extends Document {
  conditionCategory: 'Like New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
  conditionScore: number;
  confidenceScore: number;
  detectedIssues: string[];
  videoPath?: string;
  
  // AI checks
  ownershipConfidence: number;
  functionalScore?: number;
  functionalChecks?: any;

  // New Trust Model fields
  trustScore: number;
  productMatchScore: number;
  expectedAttributes?: any;
  detectedAttributes?: any;

  createdAt: Date;
}

const AIReportSchema: Schema = new Schema({
  conditionCategory: { 
    type: String, 
    enum: ['Like New', 'Excellent', 'Good', 'Fair', 'Poor'], 
    required: true 
  },
  conditionScore: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  detectedIssues: [{ type: String }],
  videoPath: { type: String },

  // Checks
  ownershipConfidence: { type: Number, default: 0 },
  functionalScore: { type: Number },
  functionalChecks: { type: Schema.Types.Mixed },

  // Trust Model scores
  trustScore: { type: Number, default: 90 },
  productMatchScore: { type: Number, default: 100 },
  expectedAttributes: { type: Schema.Types.Mixed },
  detectedAttributes: { type: Schema.Types.Mixed },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAIReport>('AIReport', AIReportSchema);
