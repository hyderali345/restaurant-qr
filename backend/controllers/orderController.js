import Order from '../models/Order.js';
import Table from '../models/Table.js';
import mongoose from 'mongoose';

export const createOrder = async (req, res) => {
  try {
    let orderData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(orderData.table)) {
      const table = await Table.findOne({ tableNumber: Number(orderData.table) });
      if (table) {
        orderData.table = table._id;
      }
    }

    const order = new Order(orderData);
    await order.save();
    const populatedOrder = await Order.findById(order._id).populate('items.menuItem').populate('table').populate('customer');
    
    req.io.to('kitchen').emit('new_order', populatedOrder);
    req.io.to('counter').emit('new_order', populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("Order placing error:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'completed' } })
                              .populate('items.menuItem').populate('table').populate('customer');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
                             .populate('items.menuItem').populate('table').populate('customer');
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, updatedAt: Date.now() }, { new: true })
                             .populate('items.menuItem').populate('table').populate('customer');
    
    req.io.to(`table_${order.table._id}`).emit('order_status_update', order);
    req.io.to('counter').emit('order_updated', order);
    req.io.to('kitchen').emit('order_updated', order);

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
