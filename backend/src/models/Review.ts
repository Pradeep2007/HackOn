import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  listing?: mongoose.Types.ObjectId;
  reviewer: mongoose.Types.ObjectId;
  targetUser: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
  listing: { type: Schema.Types.ObjectId, ref: 'Listing' },
  reviewer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IReview>('Review', ReviewSchema);
