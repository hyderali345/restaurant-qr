import Customer from '../models/Customer.js';
import Table from '../models/Table.js';
import mongoose from 'mongoose';

export const registerCustomer = async (req, res) => {
  try {
    let { name, phone, tableId } = req.body;
    let actualTableId = tableId;

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      const table = await Table.findOne({ tableNumber: Number(tableId) });
      if (!table) {
        return res.status(400).json({ error: "Invalid Table Number" });
      }
      actualTableId = table._id;
    }

    const customer = new Customer({ name, phone, tableId: actualTableId });
    await customer.save();
    res.status(201).json({ ...customer.toObject(), tableId: actualTableId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
