import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  avatar?: string;
  trustScore: number;
  ratingsCount: number;
  defaultZipCode: string;
  defaultAddress: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  trustScore: { type: Number, default: 95 },
  ratingsCount: { type: Number, default: 0 },
  defaultZipCode: { type: String, required: true, default: '110001' },
  defaultAddress: { type: String, required: true, default: 'Barakhamba Road, Connaught Place, New Delhi 110001' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', UserSchema);
