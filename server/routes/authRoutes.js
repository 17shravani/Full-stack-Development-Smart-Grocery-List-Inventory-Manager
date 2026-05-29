const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/Schemas');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Seed helper to populate sample inventory and recipes for a new user
const seedUserData = async (userId) => {
  try {
    // 1. Seed Sample Grocery Items
    const items = [
      { userId, name: "Organic Amul Milk", category: "Dairy", barcode: "8901262150024", defaultUnit: "L", minStockLevel: 2, preferredAisle: "Aisle A: Dairy & Cold" },
      { userId, name: "Whole Wheat Bread", category: "Bakery", barcode: "8902506342125", defaultUnit: "packs", minStockLevel: 1, preferredAisle: "Aisle C: Fresh Bakery" },
      { userId, name: "Brown Eggs (Dozen)", category: "Dairy", barcode: "8904128509121", defaultUnit: "packs", minStockLevel: 1, preferredAisle: "Aisle A: Dairy & Cold" },
      { userId, name: "Premium Basmati Rice", category: "Grains", barcode: "8901725181220", defaultUnit: "kg", minStockLevel: 2, preferredAisle: "Aisle F: Grains & Spices" },
      { userId, name: "Fresh Hass Avocados", category: "Produce", barcode: "", defaultUnit: "pieces", minStockLevel: 3, preferredAisle: "Aisle B: Fresh Produce" },
      { userId, name: "Paneer (Cottage Cheese)", category: "Dairy", barcode: "8901262170329", defaultUnit: "pieces", minStockLevel: 1, preferredAisle: "Aisle A: Dairy & Cold" },
      { userId, name: "Vine Tomatoes", category: "Produce", barcode: "", defaultUnit: "kg", minStockLevel: 1, preferredAisle: "Aisle B: Fresh Produce" }
    ];

    const seededItems = [];
    for (const item of items) {
      const createdItem = await db.GroceryItem.create(item);
      seededItems.push(createdItem);
    }

    const itemMap = seededItems.reduce((map, item) => {
      map[item.name] = item._id;
      return map;
    }, {});

    // 2. Seed Inventory Lots (bought items with quantities and expiry dates)
    const today = new Date();
    
    // Expired soon lot (2 days remaining)
    const milkExpiry = new Date();
    milkExpiry.setDate(today.getDate() + 2);
    
    // Expired lot (-1 days ago)
    const breadExpiry = new Date();
    breadExpiry.setDate(today.getDate() - 1);
    
    // Good lot (12 days remaining)
    const eggsExpiry = new Date();
    eggsExpiry.setDate(today.getDate() + 12);
    
    // Non-expiring grains
    const riceExpiry = new Date();
    riceExpiry.setDate(today.getDate() + 180);

    const lots = [
      { itemId: itemMap["Organic Amul Milk"], qty: 1.5, consumedQty: 0.2, unit: "L", expiryAt: milkExpiry, price: 68, store: "Reliance Smart" },
      { itemId: itemMap["Whole Wheat Bread"], qty: 1.0, consumedQty: 0.95, unit: "packs", expiryAt: breadExpiry, price: 45, store: "D-Mart" },
      { itemId: itemMap["Brown Eggs (Dozen)"], qty: 1.0, consumedQty: 0.1, unit: "packs", expiryAt: eggsExpiry, price: 110, store: "Reliance Smart" },
      { itemId: itemMap["Premium Basmati Rice"], qty: 5.0, consumedQty: 1.5, unit: "kg", expiryAt: riceExpiry, price: 120, store: "D-Mart" },
      { itemId: itemMap["Fresh Hass Avocados"], qty: 2.0, consumedQty: 2.0, unit: "pieces", expiryAt: new Date(today.getTime() - 86400000), price: 90, store: "Local Vegetable Market" }
    ];

    for (const lot of lots) {
      await db.InventoryLot.create(lot);
    }

    // 3. Seed Price History for Organic Amul Milk & Bread
    const milkId = itemMap["Organic Amul Milk"];
    const breadId = itemMap["Whole Wheat Bread"];

    const priceRecords = [
      { itemId: milkId, store: "Reliance Smart", price: 68, recordedAt: new Date(today.getTime() - 2 * 86400000) },
      { itemId: milkId, store: "D-Mart", price: 65, recordedAt: new Date(today.getTime() - 4 * 86400000) },
      { itemId: milkId, store: "Reliance Smart", price: 70, recordedAt: new Date(today.getTime() - 8 * 86400000) },
      { itemId: breadId, store: "D-Mart", price: 45, recordedAt: new Date(today.getTime() - 1 * 86400000) },
      { itemId: breadId, store: "Local Bakery", price: 50, recordedAt: new Date(today.getTime() - 5 * 86400000) }
    ];

    for (const record of priceRecords) {
      await db.PriceHistory.create(record);
    }

    // 4. Seed Recipes (ingredients linking to catalog items where possible)
    const recipes = [
      {
        userId,
        title: "Creamy Paneer & Tomato Wrap",
        description: "A fast, high-protein cottage cheese wrap with ripe vine tomatoes.",
        servings: 2,
        ingredients: [
          { name: "Paneer (Cottage Cheese)", qty: 200, unit: "g", itemId: itemMap["Paneer (Cottage Cheese)"] },
          { name: "Vine Tomatoes", qty: 2, unit: "pieces", itemId: itemMap["Vine Tomatoes"] },
          { name: "Organic Amul Milk", qty: 0.1, unit: "L", itemId: itemMap["Organic Amul Milk"] },
          { name: "Wheat Tortillas", qty: 4, unit: "pieces", itemId: null } // Custom item
        ],
        steps: [
          "Dice paneer into small cubes and pan sear until golden brown.",
          "Chop fresh vine tomatoes and sauté in butter.",
          "Add paneer, milk, and salt. Cook until it forms a creamy coating.",
          "Warm the tortillas and wrap the cottage cheese mixture tightly. Serve fresh."
        ]
      },
      {
        userId,
        title: "Healthy Avocado Toast",
        description: "Classic power breakfast with organic whole wheat bread and fresh avocados.",
        servings: 1,
        ingredients: [
          { name: "Fresh Hass Avocados", qty: 1, unit: "pieces", itemId: itemMap["Fresh Hass Avocados"] },
          { name: "Whole Wheat Bread", qty: 2, unit: "pieces", itemId: itemMap["Whole Wheat Bread"] },
          { name: "Brown Eggs (Dozen)", qty: 2, unit: "pieces", itemId: itemMap["Brown Eggs (Dozen)"] }
        ],
        steps: [
          "Toast two slices of organic whole wheat bread until crisp.",
          "Mash avocado with lemon juice, salt, and pepper in a small bowl.",
          "Poach or fry the eggs to your preference.",
          "Spread mashed avocado over toast, top with cooked eggs, and sprinkle red chili flakes."
        ]
      }
    ];

    for (const recipe of recipes) {
      await db.Recipe.create(recipe);
    }

    // 5. Seed empty Grocery List for the user
    await db.GroceryList.create({
      userId,
      title: "Weekly Grocery Plan",
      entries: [
        { itemId: itemMap["Organic Amul Milk"], customText: "Organic Amul Milk", qty: 1, unit: "L", checked: false, source: "lowstock" },
        { itemId: itemMap["Whole Wheat Bread"], customText: "Whole Wheat Bread", qty: 1, unit: "packs", checked: false, source: "expiry" }
      ]
    });

  } catch (error) {
    console.error("⚠️ Failed to seed initial user data: ", error);
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user and seed their initial ecosystem
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password.' });
  }

  try {
    // Check if user already exists
    const existingUser = await db.User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email address already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await db.User.create({
      name,
      email,
      password: hashedPassword
    });

    // Seed mock data for student dashboard demonstration
    await seedUserData(newUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email },
      message: 'Registration successful. Account initialized with premium seed data.'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during user registration.', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and return token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter both email and password.' });
  }

  try {
    const user = await db.User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Incorrect password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile details
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await db.User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }
    res.json({ id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user profile.', error: error.message });
  }
});

module.exports = router;
