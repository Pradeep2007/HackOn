import mongoose, { Schema, Document } from 'mongoose';

export interface ITrustScore extends Document {
  user: mongoose.Types.ObjectId;
  score: number;
  factors: Array<{
    factorName: string;
    impact: number;
    description: string;
  }>;
  updatedAt: Date;
}

const TrustScoreSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  score: { type: Number, required: true, default: 95 },
  factors: [{
    factorName: { type: String, required: true },
    impact: { type: Number, required: true },
    description: { type: String, required: true }
  }],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITrustScore>('TrustScore', TrustScoreSchema);
