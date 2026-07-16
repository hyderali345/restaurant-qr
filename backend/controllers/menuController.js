import Menu from '../models/Menu.js';
import Table from '../models/Table.js';

export const getMenu = async (req, res) => {
  try {
    const menu = await Menu.find({ isAvailable: true });
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const menu = new Menu(req.body);
    await menu.save();
    req.io.to('counter').emit('menu_updated', menu);
    res.status(201).json(menu);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const seedDatabase = async (req, res) => {
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
};
