import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true, unique: true },
  qrCodeUrl: { type: String }, // optional, for generating or storing the QR link
  status: { type: String, enum: ['available', 'occupied'], default: 'available' },
  currentCustomer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Table', tableSchema);
