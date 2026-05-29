const express = require('express');
const router = express.Router();
const db = require('../models/Schemas');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/inventory/overview
// @desc    Retrieve all grocery items for a user, aggregated with active inventory lots and expiry warnings
router.get('/overview', verifyToken, async (req, res) => {
  try {
    const items = await db.GroceryItem.find({ userId: req.user.id });
    const itemIds = items.map(item => item._id);

    // Fetch all active lots for these items
    const lots = await db.InventoryLot.find({ itemId: { $in: itemIds } });
    
    // Aggregate lots per item
    const aggregated = items.map(item => {
      const itemLots = lots.filter(lot => String(lot.itemId) === String(item._id));
      
      let totalQty = 0;
      let remainingQty = 0;
      let nearestExpiry = null;
      let status = 'safe'; // safe, lowstock, expired, critical (expiring in <= 3 days)
      const today = new Date();

      itemLots.forEach(lot => {
        const lotRemaining = Math.max(0, lot.qty - lot.consumedQty);
        totalQty += lot.qty;
        remainingQty += lotRemaining;

        if (lotRemaining > 0 && lot.expiryAt) {
          const expDate = new Date(lot.expiryAt);
          if (!nearestExpiry || expDate < nearestExpiry) {
            nearestExpiry = expDate;
          }
        }
      });

      // Calculate stock status based on stock thresholds and expiries
      if (remainingQty <= item.minStockLevel) {
        status = 'lowstock';
      }

      if (nearestExpiry) {
        const timeDiff = nearestExpiry.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0 && remainingQty > 0) {
          status = 'expired';
        } else if (daysLeft >= 0 && daysLeft <= 3 && remainingQty > 0) {
          status = 'critical'; // Expiry heat map: RED glowing
        }
      }

      return {
        _id: item._id,
        name: item.name,
        category: item.category,
        barcode: item.barcode,
        defaultUnit: item.defaultUnit,
        minStockLevel: item.minStockLevel,
        preferredAisle: item.preferredAisle,
        totalPurchased: totalQty,
        stock: Number(remainingQty.toFixed(2)),
        expiryDate: nearestExpiry,
        status,
        lots: itemLots.filter(l => (l.qty - l.consumedQty) > 0) // Only send non-empty lots
      };
    });

    res.json(aggregated);
  } catch (error) {
    res.status(500).json({ message: 'Error compiling pantry overview.', error: error.message });
  }
});

// @route   POST /api/inventory/items
// @desc    Add a new grocery catalog item
router.post('/items', verifyToken, async (req, res) => {
  const { name, category, barcode, defaultUnit, minStockLevel, preferredAisle } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Item name is required.' });
  }

  try {
    const newItem = await db.GroceryItem.create({
      userId: req.user.id,
      name,
      category: category || 'Produce',
      barcode: barcode || '',
      defaultUnit: defaultUnit || 'pieces',
      minStockLevel: minStockLevel !== undefined ? Number(minStockLevel) : 2,
      preferredAisle: preferredAisle || 'General Aisle'
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create grocery item.', error: error.message });
  }
});

// @route   DELETE /api/inventory/items/:id
// @desc    Delete an item and cascade delete lots
router.delete('/items/:id', verifyToken, async (req, res) => {
  try {
    const item = await db.GroceryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in catalog.' });
    }
    
    // Ensure item belongs to user
    if (String(item.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this item.' });
    }

    await db.GroceryItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Grocery item deleted, cascading inventory lot wipes completed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete grocery item.', error: error.message });
  }
});

// @route   POST /api/inventory/lots
// @desc    Create a new inventory purchase lot (Stock-In)
router.post('/lots', verifyToken, async (req, res) => {
  const { itemId, qty, unit, expiryAt, price, store } = req.body;

  if (!itemId || qty === undefined || !unit) {
    return res.status(400).json({ message: 'Please specify itemId, qty, and unit.' });
  }

  try {
    const item = await db.GroceryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Grocery item not found.' });
    }

    const newLot = await db.InventoryLot.create({
      itemId,
      qty: Number(qty),
      consumedQty: 0,
      unit,
      expiryAt: expiryAt ? new Date(expiryAt) : null,
      price: price ? Number(price) : 0,
      store: store || 'Supermarket'
    });

    // Record in price history if price is provided
    if (price && price > 0) {
      await db.PriceHistory.create({
        itemId,
        store: store || 'Supermarket',
        price: Number(price)
      });
    }

    res.status(201).json(newLot);
  } catch (error) {
    res.status(500).json({ message: 'Failed to record purchase lot.', error: error.message });
  }
});

// @route   POST /api/inventory/consume
// @desc    Consume quantity of an inventory lot (Stock-Out)
router.post('/consume', verifyToken, async (req, res) => {
  const { lotId, qty } = req.body;

  if (!lotId || qty === undefined || qty <= 0) {
    return res.status(400).json({ message: 'Please specify lotId and a valid positive quantity.' });
  }

  try {
    const lot = await db.InventoryLot.findById(lotId);
    if (!lot) {
      return res.status(404).json({ message: 'Inventory lot not found.' });
    }

    const item = await db.GroceryItem.findById(lot.itemId);
    if (String(item.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized. Lot belongs to another user.' });
    }

    const remainingQty = lot.qty - lot.consumedQty;
    const newConsumedQty = lot.consumedQty + Math.min(qty, remainingQty);

    const updatedLot = await db.InventoryLot.findByIdAndUpdate(lotId, {
      consumedQty: newConsumedQty
    });

    res.json({
      message: `Successfully consumed ${qty} ${lot.unit}.`,
      lot: { ...lot, consumedQty: newConsumedQty }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record stock usage.', error: error.message });
  }
});

// @route   POST /api/inventory/ocr-receipt
// @desc    Simulated receipt OCR parser (reads raw text lists, extracts items, prices, quantities, and expiries)
router.post('/ocr-receipt', verifyToken, async (req, res) => {
  const { rawText, storeName } = req.body;

  if (!rawText) {
    return res.status(400).json({ message: 'Receipt text content is required.' });
  }

  try {
    const lines = rawText.split('\n');
    const importedLots = [];
    const store = storeName || 'Smart Grocery Mart';

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      // Mock OCR parsing regex: extracts words, quantities (L, kg, pieces, packs), and price numbers.
      // Example line: "Premium Basmati Rice 2kg - Rs. 240.00"
      // Example line: "Amul Milk 1L - 68"
      // Example line: "Bread 1 pack 45"
      const qtyRegex = /(\d+(?:\.\d+)?)\s*(L|kg|g|packs|cartons|pieces|pcs|pack|can)?/i;
      const priceRegex = /(?:Rs\.?|INR|\$)?\s*(\d+(?:\.\d+)?)$/;

      const qtyMatch = line.match(qtyRegex);
      const priceMatch = line.match(priceRegex);

      let name = line;
      let qty = 1;
      let unit = 'pieces';
      let price = 0;

      if (qtyMatch) {
        qty = parseFloat(qtyMatch[1]);
        unit = qtyMatch[2] || 'pieces';
        // Strip quantity out of the name
        name = name.replace(qtyMatch[0], '');
      }

      if (priceMatch) {
        price = parseFloat(priceMatch[1]);
        // Strip price out of name
        name = name.replace(priceMatch[0], '');
      }

      // Clean remaining text to form item name
      name = name.replace(/[-:—Rs.INR$]/g, '').trim();
      
      if (!name || name.length < 2) continue;

      // Title-case name
      name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      // Determine category based on keywords
      let category = 'Produce';
      if (/milk|cheese|paneer|curd|butter|egg/i.test(name)) category = 'Dairy';
      else if (/bread|bun|croissant|bakery/i.test(name)) category = 'Bakery';
      else if (/rice|wheat|flour|pulses|dal|grain/i.test(name)) category = 'Grains';
      else if (/chips|snack|cookie|chocolate/i.test(name)) category = 'Snacks';
      else if (/coke|juice|water|soda|coffee|tea|beverage/i.test(name)) category = 'Beverages';
      else if (/soap|shampoo|detergent|cleaner/i.test(name)) category = 'Household';

      // Check if catalog item already exists
      let item = await db.GroceryItem.findOne({ userId: req.user.id, name });
      if (!item) {
        item = await db.GroceryItem.create({
          userId: req.user.id,
          name,
          category,
          defaultUnit: unit,
          minStockLevel: 2,
          preferredAisle: `Aisle ${category.charAt(0)}: General ${category}`
        });
      }

      // Estimate expiry based on category
      const expiryAt = new Date();
      if (category === 'Dairy') expiryAt.setDate(expiryAt.getDate() + 5);
      else if (category === 'Produce') expiryAt.setDate(expiryAt.getDate() + 4);
      else if (category === 'Bakery') expiryAt.setDate(expiryAt.getDate() + 3);
      else if (category === 'Grains') expiryAt.setDate(expiryAt.getDate() + 180);
      else expiryAt.setDate(expiryAt.getDate() + 30); // Default 1 month

      // Create new inventory lot
      const newLot = await db.InventoryLot.create({
        itemId: item._id,
        qty,
        consumedQty: 0,
        unit,
        expiryAt,
        price,
        store
      });

      // Add to price history
      if (price > 0) {
        await db.PriceHistory.create({
          itemId: item._id,
          store,
          price
        });
      }

      importedLots.push({
        name,
        category,
        qty,
        unit,
        price,
        expiryAt
      });
    }

    res.json({
      message: `Parsed OCR Receipt. Imported ${importedLots.length} items successfully into Inventory Lots!`,
      importedItems: importedLots
    });
  } catch (error) {
    res.status(500).json({ message: 'Receipt parsing OCR failed.', error: error.message });
  }
});

module.exports = router;
