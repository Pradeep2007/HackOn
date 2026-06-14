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
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IOrder>('Order', OrderSchema);
