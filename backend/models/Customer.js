import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Customer', customerSchema);
