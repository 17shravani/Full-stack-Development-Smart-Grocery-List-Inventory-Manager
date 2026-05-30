# AetherGro 🪐
### AI-Powered Smart Grocery List & Autonomous Pantry Shelf Ecosystem

<img width="1024" height="1024" alt="P4- output" src="https://github.com/user-attachments/assets/018f7b40-0ebb-4cf4-b589-c32cc6b16f3d" />

AetherGro is a production-grade, highly innovative full-stack digital ecosystem designed to eradicate household food waste, prevent product stockouts, and streamline supermarket planning. Developed as an enterprise-class MERN stack portfolio piece, AetherGro incorporates an **Interactive 3D-ish Digital Twin Shelf Visualizer**, a **Multi-Agent AI Simulation Terminal**, a **Smart OCR Receipt Text Ingestion Tool**, and a serving-scalable **Net-Need Recipe Aggregator**.

---

## 🎯 Strategic Value & Problem Scope

In standard household and cloud-kitchen ecosystems, inventory management is highly manual and fractured. Standard shopping trackers rely on raw checklists, which fail to:
1. **Model Depletion Velocities**: Items deplete at specific daily speeds, but normal trackers do not project empty dates.
2. **Handle Lot-Based Expiry**: Multiple boxes of milk bought on different dates have different expiries. Tracking total count alone leads to spoiled waste.
3. **Avoid Duplicate Carting**: When selecting a recipe, ordinary apps push all ingredients onto the shopping list. They do not cross-reference current pantry levels to deduct active inventory stock.

**AetherGro resolves these chronic gaps** by treating the home kitchen as a mini-supply chain, transforming raw pantry numbers into predictive restock actions.

---

## 🚀 Extraordinary Core Features (Unrivaled Portfolio Value)

*   **Pantry Digital Twin Tier-Shelves**: Организованный visual tiers displaying grocery assets (Dairy, Produce, Grains, etc.) represented as cards surrounded by glowing halo indicators (Green = Safe, Orange = Low, Red-Blinking = Expired/Critical).
*   **AI Multi-Agent Operations Console**: Displays live scrolling terminal telemetry from specialized agents (Prediction, Risk, Optimization, Orchestrator Agents) collaborating to audit stock, flag spoilage, and auto-restock shelves.
*   **Net-Need Ingredient Difference Engine**: Select servings for recipes (e.g. Avocado Toast or Paneer Tomato Wrap) to scale ingredients, compare against current quantities, and bulk-cart only the exact missing differences.
*   **Simulated Receipt OCR Scanner HUD**: An interactive terminal window where users input raw billing printouts, running a vertical vertical neon sweep animation to instantly extract items, quantities, and prices.
*   **Store Aisle & Price Trend Tracker**: Sorts shopping lists dynamically by preferred supermarket aisles and indexes pricing points to map merchant inflation changes.
*   **Zero-Friction Offline Fallback Sandbox**: Extremely robust engineering allows the entire app to run immediately in standalone simulation mode if MongoDB connection is missing, avoiding startup failures.

---

## 🏗️ Technical Architecture Map

```
                               ┌────────────────────────────────┐
                               │     Client (React.js + PWA)    │
                               │  - Digital Twin Shelf Visualizer│
                               │  - Multi-Agent AI Status Panel  │
                               │  - OCR Receipt / Barcode Sim   │
                               └──────────────┬─────────────────┘
                                              │ REST APIs
                                              ▼
                               ┌────────────────────────────────┐
                               │  Express.js API Gateway        │
                               │  - JWT Middleware & Security   │
                               │  - Auto-Restock Suggest Service│
                               └──────────────┬─────────────────┘
                                              │ Mongoose
                                              ▼
                               ┌────────────────────────────────┐
                               │      MongoDB (Data Store)      │
                               │  - Users, Pantry, PriceHistory │
                               │  - Recipes & Grocery Lists     │
                               └────────────────────────────────┘
```

---

## 📂 Repository Layout

```
Smart-Grocery-Inventory-Manager/
├── client/
│   ├── public/              # Static shell files
│   ├── src/
│   │   ├── components/       # DigitalTwin, AgentConsole, AnalyticsChart, ReceiptScanner, RecipeCart
│   │   ├── pages/            # Login (with Auto-Seeding), Dashboard, Pantry, Recipes, GroceryList
│   │   ├── context/          # AppContext API gateway & Offline Sandbox models
│   │   ├── index.css         # Tailwind & cyber glowing animations
│   │   └── App.jsx           # SPA Shell & Top Navigation tabs
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── config/               # DB Adapter & JSON Fallback models
│   ├── models/               # Gateway abstraction for Mongoose & local files
│   ├── middleware/           # JWT Security and verification
│   ├── routes/               # Express Auth, Inventory, List, Recipe, Price & AI routes
│   └── server.js             # Primary Node entrance gateway
├── .gitignore
└── README.md
```

---

## ⚡ Unified REST API Guide

### 🔒 Authentication (`/api/auth`)
*   `POST /api/auth/register` - Create user. **Automatically seeds profile with a robust set of grocery items, lots, prices, and recipes for instant visualization.**
*   `POST /api/auth/login` - Verify password & return JWT.
*   `GET /api/auth/profile` - Secure user dashboard metrics.

### 📦 Pantry & Lots (`/api/inventory`)
*   `GET /api/inventory/overview` - Pulls active stocks, lots, and expiry warning flags (Dairy, Produce tiers).
*   `POST /api/inventory/items` - Register item to user catalog.
*   `DELETE /api/inventory/items/:id` - Cascade delete catalog item and active lots.
*   `POST /api/inventory/lots` - Record purchase lot (Stock-In) and logs price trends.
*   `POST /api/inventory/consume` - Consume stock amounts from lot (Stock-Out).
*   `POST /api/inventory/ocr-receipt` - Text OCR parser to seed purchase batches.

### 🛒 Shopping Lists (`/api/list`)
*   `GET /api/list/current` - Pulls grocery list grouped by supermarket aisles.
*   `POST /api/list/add` - Append manual list items.
*   `PATCH /api/list/entry/:id/check` - Toggle item checked.
*   `POST /api/list/clear-checked` - Wipe completed entries.
*   `POST /api/list/auto-populate` - Runs AI restock loop to auto-restock low stock.

### 🍳 Recipe scaling (`/api/recipes`)
*   `GET /api/recipes` - Get curated recipes.
*   `POST /api/recipes/scale-cart` - Computes scaled shortage differences.
*   `POST /api/recipes/bulk-cart` - Bulk-adds missing ingredients.

---

## 🛠️ Step-by-Step Installation Guide

### Prerequisites
*   Node.js installed (Windows/Mac/Linux)
*   MongoDB Atlas account (Optional: Local fallback database activates automatically if not provided!)

### 1. Configure the Backend Server
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# (Optional) Setup environment variables
cp .env.example .env
```
*Note: If you leave `MONGODB_URI` blank in `.env`, AetherGro will write to `server/data/db.json` automatically. Zero installation friction!*

```bash
# Spin up backend dev server
npm run dev
# Server will launch on http://localhost:5000
```

### 2. Configure the Frontend Client
Open a second terminal window.
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite React server
npm run dev
# Frontend will launch on http://localhost:3000
```

---

## 🪐 Virtual Simulation Walkthrough (Recruiter Evaluation)

To experience the full power of AetherGro immediately:
1.  **Register a New Account**: Go to the login page and click **"Create Account"**. Enter a name, email, and password. This triggers a seed routine, loading fresh items (milk, eggs, rice, bread), pricing, and scaled recipes instantly.
2.  **View Matrix Dashboard**: Observe the glowing SVG depletion curves, total stocked stats, and live terminal logs flowing from our specialized prediction agents.
3.  **Audit Digital Twin Shelves**: Head to the **Shelf Digital Twin** tab. You'll see items organized on glowing categories. Click **"Whole Wheat Bread"**. Since its seed lot expired 1 day ago, you'll see a red glow. Click the lot to consume stock or record a new purchase lot.
4.  **Process a Bill Receipt**: Go to the Dashboard, choose the **"Reliance Smart Mart"** receipt template on the OCR Scanner panel, and click **"Run AI OCR Scanner"**. Watch the laser sweep across the receipt, instantly adding fresh tomatoes, eggs, and price points to your pantry shelves!
5.  **Scale and Buy Ingredients**: Head to **Culinary Planner**. Under the *Healthy Avocado Toast* card, click **"Scale & Analyze Shortages"**. Adjust servings to 6. Watch the Difference Engine highlight shortages in red and click **"Ingest Missing Elements"** to push only the missing portions straight to the grocery list.

---

## 🎓 Target Course Learning Outcomes
*   Constructed unified **Express API gateways** utilizing route protection middlewares.
*   Implemented **resilient database adapters** combining MongoDB Cloud and file-system buffers.
*   Developed highly sophisticated, serving-scalable **net-need ingredient deduction algorithms**.
*   Engineered **interactive CSS keyframe animations** and custom modular **dynamic SVG visual graphs**.
*   Secured accounts with bcrypt password hashes and signature-protected JSON Web Tokens (JWT).
