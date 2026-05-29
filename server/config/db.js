const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Ensure data folder exists for fallback JSON database
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const dbFilePath = path.join(dataDir, 'db.json');

// Initial structure for JSON db
const initialDb = {
  users: [],
  groceryitems: [],
  inventorylots: [],
  grocerylists: [],
  recipes: [],
  pricehistories: []
};

// If JSON DB file doesn't exist, create it
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, JSON.stringify(initialDb, null, 2), 'utf8');
}

class JsonDb {
  constructor() {
    this.filePath = dbFilePath;
  }

  read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error("Error reading JSON database: ", e);
      return initialDb;
    }
  }

  write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error("Error writing JSON database: ", e);
    }
  }

  // Generic helpers mimicking basic MongoDB queries
  find(collectionName, query = {}) {
    const db = this.read();
    const collection = db[collectionName.toLowerCase()] || [];
    return collection.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && String(item[key]) !== String(query[key])) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const results = this.find(collectionName, query);
    return results.length > 0 ? results[0] : null;
  }

  findById(collectionName, id) {
    return this.findOne(collectionName, { _id: id });
  }

  create(collectionName, data) {
    const db = this.read();
    const collection = db[collectionName.toLowerCase()] || [];
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      ...data
    };
    collection.push(newItem);
    db[collectionName.toLowerCase()] = collection;
    this.write(db);
    return newItem;
  }

  findByIdAndUpdate(collectionName, id, updateData) {
    const db = this.read();
    const collection = db[collectionName.toLowerCase()] || [];
    const index = collection.findIndex(item => String(item._id) === String(id));
    if (index === -1) return null;

    collection[index] = {
      ...collection[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    db[collectionName.toLowerCase()] = collection;
    this.write(db);
    return collection[index];
  }

  findByIdAndDelete(collectionName, id) {
    const db = this.read();
    const collection = db[collectionName.toLowerCase()] || [];
    const index = collection.findIndex(item => String(item._id) === String(id));
    if (index === -1) return false;

    collection.splice(index, 1);
    db[collectionName.toLowerCase()] = collection;
    this.write(db);
    return true;
  }

  deleteMany(collectionName, query = {}) {
    const db = this.read();
    const collection = db[collectionName.toLowerCase()] || [];
    const filteredCollection = collection.filter(item => {
      for (let key in query) {
        if (query[key] !== undefined && String(item[key]) === String(query[key])) {
          return false; // delete matches
        }
      }
      return true;
    });
    db[collectionName.toLowerCase()] = filteredCollection;
    this.write(db);
    return true;
  }
}

const localDb = new JsonDb();
let useMongoDB = false;

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log("⚠️  No MONGODB_URI found in environment. Activating AetherGro Local JSON Database engine...");
    useMongoDB = false;
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("⚡ MongoDB Connected successfully to Cluster!");
    useMongoDB = true;
  } catch (error) {
    console.error("❌ MongoDB connection error: ", error.message);
    console.log("⚠️  Falling back to AetherGro Local JSON Database engine...");
    useMongoDB = false;
  }
};

module.exports = {
  connectDB,
  isMongoActive: () => useMongoDB,
  localDb
};
