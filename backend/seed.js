import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Table from './models/Table.js';
import Menu from './models/Menu.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://hyderali:mongodbhyder@cluster0.ikth8av.mongodb.net/restaurant?appName=Cluster0';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Clear existing
    await Table.deleteMany({});
    await Menu.deleteMany({});

    // Add Tables
    const tables = await Table.insertMany([
      { tableNumber: 1, qrCodeUrl: 'simulated_qr_1' },
      { tableNumber: 2, qrCodeUrl: 'simulated_qr_2' },
      { tableNumber: 3, qrCodeUrl: 'simulated_qr_3' }
    ]);
    console.log('Added Tables');

    // Add Menu
    await Menu.insertMany([
      { 
        name: 'Hyderabadi Chicken Biryani', 
        description: 'Authentic dum biryani with raita and salan.', 
        price: 15.99, 
        category: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=300&h=300&fit=crop'
      },
      { 
        name: 'Paneer Butter Masala', 
        description: 'Soft paneer cubes in a rich tomato gravy.', 
        price: 12.50, 
        category: 'Main Course',
        imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=300&h=300&fit=crop'
      },
      { 
        name: 'Garlic Naan', 
        description: 'Freshly baked naan with garlic butter.', 
        price: 3.00, 
        category: 'Breads',
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=300&h=300&fit=crop'
      },
      { 
        name: 'Mango Lassi', 
        description: 'Sweet and refreshing yogurt drink.', 
        price: 4.50, 
        category: 'Beverages',
        imageUrl: 'https://images.unsplash.com/photo-1546171753-97d7676e4602?q=80&w=300&h=300&fit=crop'
      }
    ]);
    console.log('Added Menu Items');

    console.log('Seeding Complete! Tables ID:', tables.map(t => t._id));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
