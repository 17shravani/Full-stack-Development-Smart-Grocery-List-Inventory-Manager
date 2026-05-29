const mongoose = require('mongoose');
const { isMongoActive, localDb } = require('../config/db');

// --- 1. Mongoose Schema Definitions ---

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const GroceryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, default: 'Produce' }, // Dairy, Produce, Bakery, Pantry, Grains, Meat, Snacks, Beverages, Household
  barcode: { type: String, default: '' },
  defaultUnit: { type: String, default: 'pieces' }, // pieces, kg, g, L, ml, packs, cartons
  minStockLevel: { type: Number, default: 2 },
  preferredAisle: { type: String, default: 'General Aisle' }
});

const InventoryLotSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroceryItem', required: true },
  qty: { type: Number, required: true },
  consumedQty: { type: Number, default: 0 },
  unit: { type: String, required: true },
  expiryAt: { type: Date },
  boughtAt: { type: Date, default: Date.now },
  price: { type: Number, default: 0 },
  store: { type: String, default: 'Supermarket' }
});

const GroceryListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Main Shopping List' },
  entries: [{
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroceryItem' },
    customText: { type: String },
    qty: { type: Number, default: 1 },
    unit: { type: String, default: 'pcs' },
    checked: { type: Boolean, default: false },
    source: { type: String, default: 'manual' } // manual, lowstock, expiry, recipe, prediction
  }],
  createdAt: { type: Date, default: Date.now }
});

const RecipeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String },
  servings: { type: Number, default: 2 },
  ingredients: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    unit: { type: String, required: true },
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroceryItem' }
  }],
  steps: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

const PriceHistorySchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroceryItem', required: true },
  store: { type: String, required: true },
  price: { type: Number, required: true },
  recordedAt: { type: Date, default: Date.now }
});

// Create Mongoose models
const MongoUser = mongoose.model('User', UserSchema);
const MongoGroceryItem = mongoose.model('GroceryItem', GroceryItemSchema);
const MongoInventoryLot = mongoose.model('InventoryLot', InventoryLotSchema);
const MongoGroceryList = mongoose.model('GroceryList', GroceryListSchema);
const MongoRecipe = mongoose.model('Recipe', RecipeSchema);
const MongoPriceHistory = mongoose.model('PriceHistory', PriceHistorySchema);


// --- 2. Unified DB Abstraction Interface (Gateway) ---

const db = {
  User: {
    find: async (query = {}) => {
      if (isMongoActive()) return await MongoUser.find(query);
      return localDb.find('users', query);
    },
    findOne: async (query = {}) => {
      if (isMongoActive()) return await MongoUser.findOne(query);
      return localDb.findOne('users', query);
    },
    findById: async (id) => {
      if (isMongoActive()) return await MongoUser.findById(id);
      return localDb.findById('users', id);
    },
    create: async (data) => {
      if (isMongoActive()) {
        const doc = new MongoUser(data);
        return await doc.save();
      }
      return localDb.create('users', data);
    }
  },

  GroceryItem: {
    find: async (query = {}) => {
      if (isMongoActive()) return await MongoGroceryItem.find(query);
      return localDb.find('groceryitems', query);
    },
    findOne: async (query = {}) => {
      if (isMongoActive()) return await MongoGroceryItem.findOne(query);
      return localDb.findOne('groceryitems', query);
    },
    findById: async (id) => {
      if (isMongoActive()) return await MongoGroceryItem.findById(id);
      return localDb.findById('groceryitems', id);
    },
    create: async (data) => {
      if (isMongoActive()) {
        const doc = new MongoGroceryItem(data);
        return await doc.save();
      }
      return localDb.create('groceryitems', data);
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isMongoActive()) return await MongoGroceryItem.findByIdAndUpdate(id, updateData, { new: true });
      return localDb.findByIdAndUpdate('groceryitems', id, updateData);
    },
    findByIdAndDelete: async (id) => {
      if (isMongoActive()) return await MongoGroceryItem.findByIdAndDelete(id);
      // Cascading deletes for lots
      await db.InventoryLot.deleteMany({ itemId: id });
      return localDb.findByIdAndDelete('groceryitems', id);
    }
  },

  InventoryLot: {
    find: async (query = {}) => {
      if (isMongoActive()) return await MongoInventoryLot.find(query);
      return localDb.find('inventorylots', query);
    },
    findById: async (id) => {
      if (isMongoActive()) return await MongoInventoryLot.findById(id);
      return localDb.findById('inventorylots', id);
    },
    create: async (data) => {
      if (isMongoActive()) {
        const doc = new MongoInventoryLot(data);
        return await doc.save();
      }
      return localDb.create('inventorylots', data);
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isMongoActive()) return await MongoInventoryLot.findByIdAndUpdate(id, updateData, { new: true });
      return localDb.findByIdAndUpdate('inventorylots', id, updateData);
    },
    findByIdAndDelete: async (id) => {
      if (isMongoActive()) return await MongoInventoryLot.findByIdAndDelete(id);
      return localDb.findByIdAndDelete('inventorylots', id);
    },
    deleteMany: async (query = {}) => {
      if (isMongoActive()) return await MongoInventoryLot.deleteMany(query);
      return localDb.deleteMany('inventorylots', query);
    }
  },

  GroceryList: {
    find: async (query = {}) => {
      if (isMongoActive()) return await MongoGroceryList.find(query);
      return localDb.find('grocerylists', query);
    },
    findOne: async (query = {}) => {
      if (isMongoActive()) return await MongoGroceryList.findOne(query);
      return localDb.findOne('grocerylists', query);
    },
    create: async (data) => {
      if (isMongoActive()) {
        const doc = new MongoGroceryList(data);
        return await doc.save();
      }
      return localDb.create('grocerylists', data);
    },
    findByIdAndUpdate: async (id, updateData) => {
      if (isMongoActive()) return await MongoGroceryList.findByIdAndUpdate(id, updateData, { new: true });
      return localDb.findByIdAndUpdate('grocerylists', id, updateData);
    }
  },

  Recipe: {
    find: async (query = {}) => {
      if (isMongoActive()) return await MongoRecipe.find(query);
      return localDb.find('recipes', query);
    },
    findById: async (id) => {
      if (isMongoActive()) return await MongoRecipe.findById(id);
      return localDb.findById('recipes', id);
    },
    create: async (data) => {
      if (isMongoActive()) {
        const doc = new MongoRecipe(data);
        return await doc.save();
      }
      return localDb.create('recipes', data);
    },
    findByIdAndDelete: async (id) => {
      if (isMongoActive()) return await MongoRecipe.findByIdAndDelete(id);
      return localDb.findByIdAndDelete('recipes', id);
    }
  },

  PriceHistory: {
    find: async (query = {}) => {
      if (isMongoActive()) return await MongoPriceHistory.find(query).sort({ recordedAt: -1 }).limit(5);
      const list = localDb.find('pricehistories', query);
      return list.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)).slice(0, 5);
    },
    create: async (data) => {
      if (isMongoActive()) {
        const doc = new MongoPriceHistory(data);
        return await doc.save();
      }
      return localDb.create('pricehistories', data);
    }
  }
};

module.exports = db;
