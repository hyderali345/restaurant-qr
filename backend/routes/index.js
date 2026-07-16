import express from 'express';
import { getTables, createTable } from '../controllers/tableController.js';
import { getMenu, createMenuItem, seedDatabase } from '../controllers/menuController.js';
import { registerCustomer } from '../controllers/customerController.js';
import { createOrder, getActiveOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// --- Table Routes ---
router.get('/tables', getTables);
router.post('/tables', createTable);

// --- Menu Routes ---
router.get('/menu', getMenu);
router.post('/menu', createMenuItem);
router.get('/seed', seedDatabase);

// --- Customer Routes ---
router.post('/customers', registerCustomer);

// --- Order Routes ---
router.post('/orders', createOrder);
router.get('/orders/active', getActiveOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
