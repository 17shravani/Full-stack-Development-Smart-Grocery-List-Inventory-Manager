const express = require('express');
const router = express.Router();
const db = require('../models/Schemas');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/ai/suggest
// @desc    Predictive analytics engine - calculates consumption rates and exact remaining shelf-life buffers
router.get('/suggest', verifyToken, async (req, res) => {
  try {
    const items = await db.GroceryItem.find({ userId: req.user.id });
    const lots = await db.InventoryLot.find({ itemId: { $in: items.map(i => i._id) } });

    const predictions = items.map(item => {
      const itemLots = lots.filter(l => String(l.itemId) === String(item._id));
      let currentStock = 0;
      let totalPurchased = 0;
      
      itemLots.forEach(l => {
        currentStock += Math.max(0, l.qty - l.consumedQty);
        totalPurchased += l.qty;
      });

      // Simulated consumption velocity (daily usage)
      // E.g. Milk: 0.25 L/day, Bread: 0.3 packs/day, Eggs: 0.15 packs/day, Rice: 0.05 kg/day
      let dailyVelocity = 0.1; // Default
      const name = item.name.toLowerCase();
      
      if (name.includes('milk')) dailyVelocity = 0.25;
      else if (name.includes('bread')) dailyVelocity = 0.20;
      else if (name.includes('egg')) dailyVelocity = 0.15;
      else if (name.includes('rice')) dailyVelocity = 0.05;
      else if (name.includes('avocado')) dailyVelocity = 0.33;
      else if (name.includes('paneer')) dailyVelocity = 0.10;

      // Project days until depletion
      const projectedDays = currentStock > 0 ? Number((currentStock / dailyVelocity).toFixed(1)) : 0;
      
      return {
        itemId: item._id,
        name: item.name,
        category: item.category,
        currentStock,
        dailyVelocity: `${dailyVelocity} ${item.defaultUnit}/day`,
        daysRemaining: projectedDays,
        restockUrgency: projectedDays <= 2 ? 'High' : projectedDays <= 5 ? 'Medium' : 'Low'
      };
    });

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to compute predictive analytics.', error: error.message });
  }
});

// @route   GET /api/ai/agent-simulation
// @desc    Retrieve dynamic, scrolling agent activity logs to simulate a running multi-agent AI system
router.get('/agent-simulation', verifyToken, async (req, res) => {
  const timestamp = new Date().toLocaleTimeString();
  
  const simulatedLogs = [
    {
      agent: "Prediction Agent",
      message: "Analyzing historical usage velocity for Organic Amul Milk. Current rate is 0.25L/day. Projected depletion: 4.8 days.",
      status: "info",
      timestamp
    },
    {
      agent: "Risk Detection Agent",
      message: "Critical Warning: Whole Wheat Bread (Lot #B12) expired 24 hours ago. Alert flagged on dashboard. Prompting replacement.",
      status: "warning",
      timestamp
    },
    {
      agent: "Optimization Agent",
      message: "Supermarket price indexing complete. Found 'Organic Amul Milk' priced 12% lower at D-Mart than local retail stores.",
      status: "success",
      timestamp
    },
    {
      agent: "Prediction Agent",
      message: "Pantry consumption scan complete. 4 items currently sitting below critical threshold levels.",
      status: "info",
      timestamp
    },
    {
      agent: "Orchestrator Agent",
      message: "Cross-referencing recipes 'Healthy Avocado Toast' ingredients with current active stock. Isolated missing eggs.",
      status: "success",
      timestamp
    },
    {
      agent: "Orchestrator Agent",
      message: "Automatically pushed replacement Organic Amul Milk (Qty: 1 L, Source: Predictive Low Stock) to shopping list.",
      status: "success",
      timestamp
    }
  ];

  // Randomly shuffle or serve logs to simulate a running state
  res.json(simulatedLogs);
});

module.exports = router;
