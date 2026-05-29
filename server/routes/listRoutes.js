const express = require('express');
const router = express.Router();
const db = require('../models/Schemas');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/list/current
// @desc    Retrieve the active grocery shopping list, auto-populating item details and grouping by aisle
router.get('/current', verifyToken, async (req, res) => {
  try {
    let list = await db.GroceryList.findOne({ userId: req.user.id });
    
    if (!list) {
      list = await db.GroceryList.create({
        userId: req.user.id,
        title: "Primary Shopping List",
        entries: []
      });
    }

    // Populate item details
    const items = await db.GroceryItem.find({ userId: req.user.id });
    const itemMap = items.reduce((map, item) => {
      map[item._id] = item;
      return map;
    }, {});

    const enrichedEntries = list.entries.map(entry => {
      const itemDetails = entry.itemId ? itemMap[entry.itemId] : null;
      return {
        _id: entry._id,
        itemId: entry.itemId,
        customText: entry.customText,
        qty: entry.qty,
        unit: entry.unit,
        checked: entry.checked,
        source: entry.source,
        name: itemDetails ? itemDetails.name : entry.customText,
        category: itemDetails ? itemDetails.category : 'General',
        preferredAisle: itemDetails ? itemDetails.preferredAisle : 'General Aisle'
      };
    });

    res.json({
      _id: list._id,
      title: list.title,
      entries: enrichedEntries
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving shopping list.', error: error.message });
  }
});

// @route   POST /api/list/add
// @desc    Add a manual or automated item to the shopping list
router.post('/add', verifyToken, async (req, res) => {
  const { itemId, customText, qty, unit, source } = req.body;

  if (!itemId && !customText) {
    return res.status(400).json({ message: 'Please specify an itemId or a custom name.' });
  }

  try {
    let list = await db.GroceryList.findOne({ userId: req.user.id });
    if (!list) {
      list = await db.GroceryList.create({
        userId: req.user.id,
        title: "Primary Shopping List",
        entries: []
      });
    }

    // Verify if item already exists on list and is unchecked (then increment qty)
    const existingIndex = list.entries.findIndex(entry => {
      if (itemId && String(entry.itemId) === String(itemId) && !entry.checked) return true;
      if (customText && entry.customText === customText && !entry.checked) return true;
      return false;
    });

    if (existingIndex > -1) {
      list.entries[existingIndex].qty += (qty ? Number(qty) : 1);
    } else {
      list.entries.push({
        itemId: itemId || null,
        customText: customText || '',
        qty: qty ? Number(qty) : 1,
        unit: unit || 'pieces',
        checked: false,
        source: source || 'manual'
      });
    }

    await db.GroceryList.findByIdAndUpdate(list._id, { entries: list.entries });
    res.status(201).json({ message: 'Item added to shopping list.', list });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add item to shopping list.', error: error.message });
  }
});

// @route   PATCH /api/list/entry/:id/check
// @desc    Toggle item checked status
router.patch('/entry/:id/check', verifyToken, async (req, res) => {
  const { checked } = req.body;

  try {
    let list = await db.GroceryList.findOne({ userId: req.user.id });
    if (!list) return res.status(404).json({ message: 'Shopping list not found.' });

    const entryIndex = list.entries.findIndex(e => String(e._id) === String(req.params.id));
    if (entryIndex === -1) {
      return res.status(404).json({ message: 'Shopping list item not found.' });
    }

    list.entries[entryIndex].checked = checked;
    await db.GroceryList.findByIdAndUpdate(list._id, { entries: list.entries });

    res.json({ message: 'Status updated successfully.', entry: list.entries[entryIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle item status.', error: error.message });
  }
});

// @route   DELETE /api/list/entry/:id
// @desc    Delete an item from the shopping list
router.delete('/entry/:id', verifyToken, async (req, res) => {
  try {
    let list = await db.GroceryList.findOne({ userId: req.user.id });
    if (!list) return res.status(404).json({ message: 'Shopping list not found.' });

    const filteredEntries = list.entries.filter(e => String(e._id) !== String(req.params.id));
    await db.GroceryList.findByIdAndUpdate(list._id, { entries: filteredEntries });

    res.json({ message: 'Item deleted from shopping list.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item.', error: error.message });
  }
});

// @route   POST /api/list/clear-checked
// @desc    Clear all checked (completed) entries from shopping list
router.post('/clear-checked', verifyToken, async (req, res) => {
  try {
    let list = await db.GroceryList.findOne({ userId: req.user.id });
    if (!list) return res.status(404).json({ message: 'Shopping list not found.' });

    const activeEntries = list.entries.filter(e => !e.checked);
    await db.GroceryList.findByIdAndUpdate(list._id, { entries: activeEntries });

    res.json({ message: 'Cleared completed items.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear checked items.', error: error.message });
  }
});

// @route   POST /api/list/auto-populate
// @desc    Perform full smart restock run (evaluates pantries for expiries and critical thresholds)
router.post('/auto-populate', verifyToken, async (req, res) => {
  try {
    // 1. Fetch catalog items and active inventory lots
    const items = await db.GroceryItem.find({ userId: req.user.id });
    const lots = await db.InventoryLot.find({ itemId: { $in: items.map(i => i._id) } });

    // 2. Fetch current list
    let list = await db.GroceryList.findOne({ userId: req.user.id });
    if (!list) {
      list = await db.GroceryList.create({ userId: req.user.id, entries: [] });
    }

    const today = new Date();
    const addedCount = { lowstock: 0, expiry: 0 };

    for (const item of items) {
      const itemLots = lots.filter(l => String(l.itemId) === String(item._id));
      let activeStock = 0;
      let nearExpiryLot = false;

      itemLots.forEach(lot => {
        const remaining = Math.max(0, lot.qty - lot.consumedQty);
        activeStock += remaining;

        if (remaining > 0 && lot.expiryAt) {
          const expDate = new Date(lot.expiryAt);
          const daysLeft = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (daysLeft >= 0 && daysLeft <= 3) {
            nearExpiryLot = true;
          }
        }
      });

      // Check if item is already on list and unchecked
      const isAlreadyOnList = list.entries.some(e => String(e.itemId) === String(item._id) && !e.checked);
      if (isAlreadyOnList) continue;

      // Rule A: Low Stock trigger
      if (activeStock <= item.minStockLevel) {
        list.entries.push({
          itemId: item._id,
          customText: item.name,
          qty: Math.max(1, item.minStockLevel),
          unit: item.defaultUnit,
          checked: false,
          source: 'lowstock'
        });
        addedCount.lowstock++;
      } 
      // Rule B: Expiring soon and needs replacement buffer
      else if (nearExpiryLot) {
        list.entries.push({
          itemId: item._id,
          customText: item.name,
          qty: 1,
          unit: item.defaultUnit,
          checked: false,
          source: 'expiry'
        });
        addedCount.expiry++;
      }
    }

    await db.GroceryList.findByIdAndUpdate(list._id, { entries: list.entries });
    
    res.json({
      message: `Autonomous scanning routine complete! Restocked ${addedCount.lowstock} low-stock items and ${addedCount.expiry} expiring items.`,
      addedCount
    });

  } catch (error) {
    res.status(500).json({ message: 'Auto-populate scanning routine failed.', error: error.message });
  }
});

module.exports = router;
