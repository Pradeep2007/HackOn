import mongoose, { Schema, Document } from 'mongoose';

export interface IAIReport extends Document {
  conditionCategory: 'Like New' | 'Excellent' | 'Good' | 'Fair' | 'Poor';
  conditionScore: number;
  confidenceScore: number;
  detectedIssues: string[];
  videoPath?: string;
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
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IAIReport>('AIReport', AIReportSchema);
