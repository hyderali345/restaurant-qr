import Order from '../models/Order.js';
import Table from '../models/Table.js';
import mongoose from 'mongoose';
import axios from 'axios';

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
    const { status, paymentStatus } = req.body;
    let updateFields = { updatedAt: Date.now() };
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true })
                             .populate('items.menuItem').populate('table').populate('customer');
    
    req.io.to(`table_${order.table._id}`).emit('order_status_update', order);
    req.io.to('counter').emit('order_updated', order);
    req.io.to('kitchen').emit('order_updated', order);

    // If payment is completed, send SMS via Fast2SMS
    if (paymentStatus === 'completed' && order.customer?.phone) {
      const message = `Al-Maida Mandi:\nThank you for ordering, ${order.customer.name}!\nYour total bill was Rs.${order.totalAmount}.`;
      try {
        await axios.post('https://www.fast2sms.com/dev/bulkV2', {
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: order.customer.phone.replace(/\D/g, '').slice(-10)
        }, {
          headers: {
            'authorization': process.env.FAST2SMS_API_KEY || 'dummy_key'
          }
        });
        console.log('SMS sent to', order.customer.phone);
      } catch (smsError) {
        console.error('Fast2SMS Error:', smsError.response?.data || smsError.message);
      }
    }

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
