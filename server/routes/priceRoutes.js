const express = require('express');
const router = express.Router();
const db = require('../models/Schemas');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/prices/item/:itemId
// @desc    Retrieve pricing history trends for a specific catalog item
router.get('/item/:itemId', verifyToken, async (req, res) => {
  try {
    const history = await db.PriceHistory.find({ itemId: req.params.itemId });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving price history records.', error: error.message });
  }
});

module.exports = router;
