const express = require('express');
const router = express.Router();
const db = require('../models/Schemas');
const { verifyToken } = require('../middleware/auth');

// @route   GET /api/recipes
// @desc    Retrieve all user recipes
router.get('/', verifyToken, async (req, res) => {
  try {
    const recipes = await db.Recipe.find({ userId: req.user.id });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recipes.', error: error.message });
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe with ingredients and structured steps
router.post('/', verifyToken, async (req, res) => {
  const { title, description, servings, ingredients, steps } = req.body;

  if (!title || !ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: 'Recipe title and at least one ingredient are required.' });
  }

  try {
    const newRecipe = await db.Recipe.create({
      userId: req.user.id,
      title,
      description: description || '',
      servings: servings ? Number(servings) : 2,
      ingredients, // Array of { name, qty, unit, itemId }
      steps: steps || []
    });

    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create recipe.', error: error.message });
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await db.Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

    if (String(recipe.userId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized. You do not own this recipe.' });
    }

    await db.Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Recipe deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete recipe.', error: error.message });
  }
});

// @route   POST /api/recipes/scale-cart
// @desc    Analyze stock differences for a recipe scaled to target servings, and return net needs
router.post('/scale-cart', verifyToken, async (req, res) => {
  const { recipeId, targetServings } = req.body;

  if (!recipeId || !targetServings || targetServings <= 0) {
    return res.status(400).json({ message: 'Specify recipeId and targetServings (minimum 1).' });
  }

  try {
    const recipe = await db.Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found.' });

    // Fetch user inventory to compare stock
    const catalogItems = await db.GroceryItem.find({ userId: req.user.id });
    const activeLots = await db.InventoryLot.find({ itemId: { $in: catalogItems.map(c => c._id) } });

    // Calculate scaling multiplier
    const scaleFactor = Number(targetServings) / recipe.servings;
    const ingredientAnalysis = [];

    for (const ing of recipe.ingredients) {
      // 1. Calculate scaled requirement
      const scaledQty = Number((ing.qty * scaleFactor).toFixed(2));
      
      // 2. Fetch current active stock for linked item
      let currentStock = 0;
      let linkedItemId = ing.itemId;

      // If itemId matches, check inventory
      if (linkedItemId) {
        const itemLots = activeLots.filter(l => String(l.itemId) === String(linkedItemId));
        itemLots.forEach(lot => {
          currentStock += Math.max(0, lot.qty - lot.consumedQty);
        });
      } else {
        // Attempt text match in catalog as fallback
        const catalogMatch = catalogItems.find(c => c.name.toLowerCase() === ing.name.toLowerCase());
        if (catalogMatch) {
          linkedItemId = catalogMatch._id;
          const itemLots = activeLots.filter(l => String(l.itemId) === String(linkedItemId));
          itemLots.forEach(lot => {
            currentStock += Math.max(0, lot.qty - lot.consumedQty);
          });
        }
      }

      currentStock = Number(currentStock.toFixed(2));
      
      // 3. Compute Net Need difference
      const netNeed = Math.max(0, Number((scaledQty - currentStock).toFixed(2)));
      const hasEnough = currentStock >= scaledQty;

      ingredientAnalysis.push({
        name: ing.name,
        itemId: linkedItemId,
        requiredQty: scaledQty,
        stockQty: currentStock,
        netNeed,
        unit: ing.unit,
        hasEnough
      });
    }

    res.json({
      recipeId: recipe._id,
      recipeTitle: recipe.title,
      originalServings: recipe.servings,
      targetServings: Number(targetServings),
      scaleFactor,
      analysis: ingredientAnalysis
    });

  } catch (error) {
    res.status(500).json({ message: 'Failed to execute recipe ingredient analysis.', error: error.message });
  }
});

// @route   POST /api/recipes/bulk-cart
// @desc    Directly push the missing ingredient requirements from scale analysis to shopping list
router.post('/bulk-cart', verifyToken, async (req, res) => {
  const { items } = req.body; // Array of { name, itemId, netNeed, unit }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'No items provided for cart insertion.' });
  }

  try {
    let list = await db.GroceryList.findOne({ userId: req.user.id });
    if (!list) {
      list = await db.GroceryList.create({ userId: req.user.id, entries: [] });
    }

    let insertedCount = 0;

    for (const item of items) {
      if (item.netNeed <= 0) continue;

      // Check if entry already exists unchecked on shopping list
      const index = list.entries.findIndex(entry => {
        if (item.itemId && String(entry.itemId) === String(item.itemId) && !entry.checked) return true;
        if (!item.itemId && entry.customText === item.name && !entry.checked) return true;
        return false;
      });

      if (index > -1) {
        list.entries[index].qty += Number(item.netNeed);
      } else {
        list.entries.push({
          itemId: item.itemId || null,
          customText: item.itemId ? '' : item.name,
          qty: Number(item.netNeed),
          unit: item.unit,
          checked: false,
          source: 'recipe'
        });
      }
      insertedCount++;
    }

    await db.GroceryList.findByIdAndUpdate(list._id, { entries: list.entries });
    res.json({ message: `Successfully pushed ${insertedCount} missing ingredients to your grocery list.`, list });
  } catch (error) {
    res.status(500).json({ message: 'Failed to push scaled ingredients to cart.', error: error.message });
  }
});

module.exports = router;
