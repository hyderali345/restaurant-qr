import express from 'express';
import mongoose from 'mongoose';
import Table from '../models/Table.js';
import Customer from '../models/Customer.js';
import Menu from '../models/Menu.js';
import Order from '../models/Order.js';

const router = express.Router();

// --- Table Routes ---
router.get('/tables', async (req, res) => {
  try {
    const tables = await Table.find();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tables', async (req, res) => {
  try {
    const table = new Table(req.body);
    await table.save();
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Menu Routes ---
router.get('/menu', async (req, res) => {
  try {
    const menu = await Menu.find({ isAvailable: true });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/menu', async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    req.io.to('counter').emit('menu_updated', menu);
    res.status(201).json(menu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper endpoint to seed database on the cloud
router.get('/seed', async (req, res) => {
  try {
    await Table.deleteMany({});
    await Menu.deleteMany({});
    
    await Table.insertMany([
      { tableNumber: 1, qrCodeUrl: 'http://localhost:5173/table/1' },
      { tableNumber: 2, qrCodeUrl: 'http://localhost:5173/table/2' },
      { tableNumber: 3, qrCodeUrl: 'http://localhost:5173/table/3' },
      { tableNumber: 4, qrCodeUrl: 'http://localhost:5173/table/4' },
      { tableNumber: 5, qrCodeUrl: 'http://localhost:5173/table/5' },
    ]);
    
    await Menu.insertMany([
      { name: 'Chicken Mandi', description: 'Aromatic yellow rice topped with authentic roasted quarter chicken, fried onions, and nuts.', price: 450, category: 'Main Course', imageUrl: '/images/chicken_mandi.png', isAvailable: true },
      { name: 'Mutton Juicy Mandi', description: 'Tender, slow-cooked juicy mutton pieces over fragrant basmati rice.', price: 650, category: 'Main Course', imageUrl: '/images/mutton_mandi.png', isAvailable: true },
      { name: 'Chicken Al Faham', description: 'Arabian style smoky charcoal-grilled chicken with garlic paste and salad.', price: 320, category: 'Starters', imageUrl: '/images/chicken_faham.png', isAvailable: true },
      { name: 'Chicken Shawarma', description: 'Juicy grilled chicken wrapped in soft pita with garlic sauce and fries.', price: 150, category: 'Starters', imageUrl: '/images/shawarma.png', isAvailable: true },
      { name: 'Hummus with Pita', description: 'Creamy homemade hummus drizzled with olive oil, served with warm pita.', price: 180, category: 'Sides', imageUrl: '/images/hummus.png', isAvailable: true },
      { name: 'Kunafa', description: 'Warm crispy Arabian dessert with melted sweet cheese and pistachios.', price: 250, category: 'Desserts', imageUrl: '/images/kunafa.png', isAvailable: true },
    ]);
    
    res.json({ message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Customer Routes ---
router.post('/customers', async (req, res) => {
  try {
    let { name, email, phone, tableId } = req.body;
    let actualTableId = tableId;

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      const table = await Table.findOne({ tableNumber: Number(tableId) });
      if (!table) {
        return res.status(400).json({ error: "Invalid Table Number" });
      }
      actualTableId = table._id;
    }

    const customer = new Customer({ name, email, phone, tableId: actualTableId });
    await customer.save();
    res.status(201).json({ ...customer.toObject(), tableId: actualTableId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Order Routes ---
router.post('/orders', async (req, res) => {
  try {
    let orderData = req.body;
    
    // In case tableId is still a number instead of ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderData.table)) {
      const table = await Table.findOne({ tableNumber: Number(orderData.table) });
      if (table) {
        orderData.table = table._id;
      }
    }

    const order = new Order(orderData);
    await order.save();
    const populatedOrder = await Order.findById(order._id).populate('items.menuItem').populate('table').populate('customer');
    
    // Notify Kitchen and Counter
    req.io.to('kitchen').emit('new_order', populatedOrder);
    req.io.to('counter').emit('new_order', populatedOrder);

    res.status(201).json(populatedOrder);
  } catch (err) {
    console.error("Order placing error:", err);
    res.status(400).json({ error: err.message });
  }
});

router.get('/orders/active', async (req, res) => {
  try {
    const orders = await Order.find({ status: { $ne: 'completed' } })
                              .populate('items.menuItem').populate('table').populate('customer');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
                             .populate('items.menuItem').populate('table').populate('customer');
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, updatedAt: Date.now() }, { new: true })
                             .populate('items.menuItem').populate('table').populate('customer');
    
    // Notify specific table customer about the status update
    req.io.to(`table_${order.table._id}`).emit('order_status_update', order);
    
    // Notify counter
    req.io.to('counter').emit('order_updated', order);
    
    // Notify kitchen
    req.io.to('kitchen').emit('order_updated', order);

    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
