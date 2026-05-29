import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aethergro_token') || null);
  const [pantryItems, setPantryItems] = useState([]);
  const [shoppingList, setShoppingList] = useState({ title: 'Primary Shopping List', entries: [] });
  const [recipes, setRecipes] = useState([]);
  const [simulatedLogs, setSimulatedLogs] = useState([]);
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [serverStatus, setServerStatus] = useState('offline');

  // Request Helper with automatic Authorization header mapping
  const apiRequest = async (endpoint, method = 'GET', body = null) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const config = {
        method,
        headers,
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'An API error occurred.');
      }
      setIsLoading(false);
      return data;
    } catch (err) {
      setIsLoading(false);
      console.error(`API Error (${endpoint}): `, err.message);
      // Don't crash - let the component handle it or show error
      throw err;
    }
  };

  // Check server health and set status
  const checkServerHealth = async () => {
    try {
      const res = await fetch('http://localhost:5000/');
      if (res.ok) {
        const data = await res.json();
        setServerStatus('online');
        console.log("⚡ AetherGro Express backend server is online in: " + data.activeMode);
      } else {
        setServerStatus('offline');
      }
    } catch (e) {
      setServerStatus('offline');
      console.log("⚠️ AetherGro Express Server offline. Operating in resilient standalone frontend simulation mode.");
    }
  };

  // Perform initial health checks and restore session
  useEffect(() => {
    checkServerHealth();
    if (token) {
      fetchUserProfile();
    } else {
      loadFallbackLocalData(); // Load beautiful mock state if not logged in
    }
  }, [token]);

  // Fetch data bundles when logged in and server is active
  useEffect(() => {
    if (user && serverStatus === 'online') {
      fetchPantry();
      fetchList();
      fetchRecipes();
      fetchAgentLogs();
    }
  }, [user, serverStatus]);

  // Periodic simulated agent ticker
  useEffect(() => {
    let interval;
    if (user) {
      interval = setInterval(() => {
        if (serverStatus === 'online') {
          fetchAgentLogs();
        } else {
          tickFallbackAgentLogs();
        }
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [user, serverStatus]);

  // Load Fallback Mock Data for immediate standalone viewing (recruiter wow factor!)
  const loadFallbackLocalData = () => {
    setPantryItems([
      { _id: 'item1', name: "Organic Amul Milk", category: "Dairy", barcode: "8901262150024", defaultUnit: "L", minStockLevel: 2, preferredAisle: "Aisle A: Dairy & Cold", stock: 1.5, totalPurchased: 2.0, status: "lowstock", expiryDate: new Date(Date.now() + 172800000), lots: [{ _id: 'lot1', qty: 1.5, consumedQty: 0.5, unit: "L", price: 68, store: "Reliance Smart", expiryAt: new Date(Date.now() + 172800000) }] },
      { _id: 'item2', name: "Whole Wheat Bread", category: "Bakery", barcode: "8902506342125", defaultUnit: "packs", minStockLevel: 1, preferredAisle: "Aisle C: Fresh Bakery", stock: 0.1, totalPurchased: 1.0, status: "expired", expiryDate: new Date(Date.now() - 86400000), lots: [{ _id: 'lot2', qty: 1.0, consumedQty: 0.9, unit: "packs", price: 45, store: "D-Mart", expiryAt: new Date(Date.now() - 86400000) }] },
      { _id: 'item3', name: "Brown Eggs (Dozen)", category: "Dairy", barcode: "8904128509121", defaultUnit: "packs", minStockLevel: 1, preferredAisle: "Aisle A: Dairy & Cold", stock: 1.0, totalPurchased: 1.0, status: "safe", expiryDate: new Date(Date.now() + 12 * 86400000), lots: [{ _id: 'lot3', qty: 1.0, consumedQty: 0.1, unit: "packs", price: 110, store: "Reliance Smart", expiryAt: new Date(Date.now() + 12 * 86400000) }] },
      { _id: 'item4', name: "Premium Basmati Rice", category: "Grains", barcode: "8901725181220", defaultUnit: "kg", minStockLevel: 2, preferredAisle: "Aisle F: Grains & Spices", stock: 5.0, totalPurchased: 5.0, status: "safe", expiryDate: new Date(Date.now() + 180 * 86400000), lots: [{ _id: 'lot4', qty: 5.0, consumedQty: 0, unit: "kg", price: 120, store: "D-Mart", expiryAt: new Date(Date.now() + 180 * 86400000) }] }
    ]);

    setShoppingList({
      title: "Weekly Grocery Plan",
      entries: [
        { _id: 'e1', itemId: 'item1', name: "Organic Amul Milk", category: "Dairy", qty: 1, unit: "L", checked: false, source: "lowstock", preferredAisle: "Aisle A: Dairy & Cold" },
        { _id: 'e2', itemId: 'item2', name: "Whole Wheat Bread", category: "Bakery", qty: 1, unit: "packs", checked: false, source: "expiry", preferredAisle: "Aisle C: Fresh Bakery" }
      ]
    });

    setRecipes([
      {
        _id: 'r1',
        title: "Creamy Paneer & Tomato Wrap",
        description: "A fast, high-protein cottage cheese wrap with ripe vine tomatoes.",
        servings: 2,
        ingredients: [
          { name: "Paneer (Cottage Cheese)", qty: 200, unit: "g", itemId: null },
          { name: "Vine Tomatoes", qty: 2, unit: "pieces", itemId: null },
          { name: "Organic Amul Milk", qty: 0.1, unit: "L", itemId: 'item1' }
        ],
        steps: [
          "Dice paneer into small cubes and pan sear until golden brown.",
          "Chop fresh vine tomatoes and sauté in butter.",
          "Add paneer, milk, and salt. Cook until it forms a creamy coating.",
          "Warm the tortillas and wrap the cottage cheese mixture tightly."
        ]
      },
      {
        _id: 'r2',
        title: "Healthy Avocado Toast",
        description: "Classic power breakfast with organic whole wheat bread and fresh avocados.",
        servings: 1,
        ingredients: [
          { name: "Fresh Hass Avocados", qty: 1, unit: "pieces", itemId: null },
          { name: "Whole Wheat Bread", qty: 2, unit: "pieces", itemId: 'item2' },
          { name: "Brown Eggs (Dozen)", qty: 2, unit: "pieces", itemId: 'item3' }
        ],
        steps: [
          "Toast two slices of organic whole wheat bread until crisp.",
          "Mash avocado with lemon juice, salt, and pepper in a small bowl.",
          "Poach or fry the eggs to your preference.",
          "Spread mashed avocado over toast, top with cooked eggs, and sprinkle red chili flakes."
        ]
      }
    ]);

    setSimulatedLogs([
      { agent: "Prediction Agent", message: "Analyzing historical usage velocity for Organic Amul Milk. Rate is 0.25L/day. Projected depletion: 6.0 days.", status: "info", timestamp: new Date().toLocaleTimeString() },
      { agent: "Risk Detection Agent", message: "Critical Warning: Whole Wheat Bread (Lot #B12) expired 24 hours ago. Alert flagged.", status: "warning", timestamp: new Date().toLocaleTimeString() },
      { agent: "Optimization Agent", message: "Supermarket price indexing: Organic Amul Milk is 12% cheaper at D-Mart than local grocers.", status: "success", timestamp: new Date().toLocaleTimeString() },
      { agent: "Orchestrator Agent", message: "Pushed replacement Organic Amul Milk (Qty: 1 L, Source: Predictive Restock) to shopping list.", status: "success", timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  const tickFallbackAgentLogs = () => {
    const agents = ["Prediction Agent", "Risk Detection Agent", "Optimization Agent", "Orchestrator Agent"];
    const msgs = [
      "Assessing pantry shelf space. Space utilization is currently 64%. Optimal parameters maintained.",
      "Consumption velocity audit: Rice depletion is steady at 0.05kg/day. Safe boundaries for 70 days.",
      "Store price lookup triggered. Local prices indexed. No major inflation volatility detected.",
      "Multi-Agent loop synchronization successful. Zero anomalous events detected in active pantry."
    ];
    const index = Math.floor(Math.random() * msgs.length);
    const newLog = {
      agent: agents[index],
      message: msgs[index],
      status: "info",
      timestamp: new Date().toLocaleTimeString()
    };
    setSimulatedLogs(prev => [newLog, ...prev.slice(0, 10)]);
  };

  // --- API Functions ---

  const fetchUserProfile = async () => {
    if (serverStatus !== 'online') return;
    try {
      const data = await apiRequest('/auth/profile');
      setUser(data);
    } catch (e) {
      logout();
    }
  };

  const login = async (email, password) => {
    if (serverStatus === 'online') {
      const data = await apiRequest('/auth/login', 'POST', { email, password });
      localStorage.setItem('aethergro_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } else {
      // Simulate standalone offline login (wow factor!)
      const mockUser = { id: 'mock123', name: 'Elite Developer', email: 'developer@aethergro.io' };
      setUser(mockUser);
      return mockUser;
    }
  };

  const register = async (name, email, password) => {
    if (serverStatus === 'online') {
      const data = await apiRequest('/auth/register', 'POST', { name, email, password });
      localStorage.setItem('aethergro_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } else {
      const mockUser = { id: 'mock123', name, email };
      setUser(mockUser);
      return mockUser;
    }
  };

  const logout = () => {
    localStorage.removeItem('aethergro_token');
    setToken(null);
    setUser(null);
    loadFallbackLocalData();
    setActivePage('dashboard');
  };

  const fetchPantry = async () => {
    if (serverStatus !== 'online') return;
    try {
      const data = await apiRequest('/inventory/overview');
      setPantryItems(data);
    } catch (e) {
      console.error("Failed to load pantry details.");
    }
  };

  const fetchList = async () => {
    if (serverStatus !== 'online') return;
    try {
      const data = await apiRequest('/list/current');
      setShoppingList(data);
    } catch (e) {
      console.error("Failed to load list details.");
    }
  };

  const fetchRecipes = async () => {
    if (serverStatus !== 'online') return;
    try {
      const data = await apiRequest('/recipes');
      setRecipes(data);
    } catch (e) {
      console.error("Failed to load recipe details.");
    }
  };

  const fetchAgentLogs = async () => {
    if (serverStatus !== 'online') return;
    try {
      const data = await apiRequest('/ai/agent-simulation');
      setSimulatedLogs(prev => {
        // Interlace new logs beautifully
        const ids = new Set(prev.map(p => p.message));
        const filtered = data.filter(d => !ids.has(d.message));
        return [...filtered, ...prev].slice(0, 15);
      });
    } catch (e) {
      console.error("Failed to fetch simulated AI logs.");
    }
  };

  const addGroceryItem = async (itemData) => {
    if (serverStatus === 'online') {
      await apiRequest('/inventory/items', 'POST', itemData);
      await fetchPantry();
    } else {
      // Offline local append
      const newItem = {
        _id: Math.random().toString(),
        name: itemData.name,
        category: itemData.category,
        barcode: itemData.barcode || '',
        defaultUnit: itemData.defaultUnit,
        minStockLevel: Number(itemData.minStockLevel),
        preferredAisle: itemData.preferredAisle || 'General Aisle',
        stock: 0,
        totalPurchased: 0,
        status: 'lowstock',
        lots: []
      };
      setPantryItems(prev => [newItem, ...prev]);
    }
  };

  const addLot = async (lotData) => {
    if (serverStatus === 'online') {
      await apiRequest('/inventory/lots', 'POST', lotData);
      await fetchPantry();
      await fetchList(); // Auto alert levels might re-adjust
    } else {
      // Offline local append lot to item
      setPantryItems(prev => prev.map(item => {
        if (item._id === lotData.itemId) {
          const newQty = Number(lotData.qty);
          const newLot = {
            _id: Math.random().toString(),
            qty: newQty,
            consumedQty: 0,
            unit: lotData.unit,
            expiryAt: lotData.expiryAt ? new Date(lotData.expiryAt) : null,
            price: Number(lotData.price || 0),
            store: lotData.store || 'Supermarket'
          };
          const totalStock = item.stock + newQty;
          const status = totalStock > item.minStockLevel ? 'safe' : 'lowstock';
          return {
            ...item,
            stock: totalStock,
            totalPurchased: item.totalPurchased + newQty,
            status,
            lots: [...item.lots, newLot]
          };
        }
        return item;
      }));
    }
  };

  const consumeStock = async (lotId, qty) => {
    if (serverStatus === 'online') {
      await apiRequest('/inventory/consume', 'POST', { lotId, qty });
      await fetchPantry();
    } else {
      // Offline local consume
      setPantryItems(prev => prev.map(item => {
        let lotMatched = false;
        const updatedLots = item.lots.map(lot => {
          if (lot._id === lotId) {
            lotMatched = true;
            const newConsumed = Math.min(lot.qty, lot.consumedQty + qty);
            return { ...lot, consumedQty: newConsumed };
          }
          return lot;
        }).filter(lot => (lot.qty - lot.consumedQty) > 0);

        if (lotMatched) {
          const activeStock = updatedLots.reduce((acc, l) => acc + (l.qty - l.consumedQty), 0);
          const status = activeStock <= item.minStockLevel ? 'lowstock' : 'safe';
          return {
            ...item,
            stock: Number(activeStock.toFixed(2)),
            status,
            lots: updatedLots
          };
        }
        return item;
      }));
    }
  };

  const deleteItem = async (itemId) => {
    if (serverStatus === 'online') {
      await apiRequest(`/inventory/items/${itemId}`, 'DELETE');
      await fetchPantry();
    } else {
      setPantryItems(prev => prev.filter(i => i._id !== itemId));
    }
  };

  const addItemToShoppingList = async (listData) => {
    if (serverStatus === 'online') {
      await apiRequest('/list/add', 'POST', listData);
      await fetchList();
    } else {
      // Offline list insert
      const itemDetails = pantryItems.find(i => i._id === listData.itemId);
      const newEntry = {
        _id: Math.random().toString(),
        itemId: listData.itemId || null,
        customText: listData.customText || '',
        qty: Number(listData.qty || 1),
        unit: listData.unit || 'pieces',
        checked: false,
        source: listData.source || 'manual',
        name: itemDetails ? itemDetails.name : listData.customText,
        category: itemDetails ? itemDetails.category : 'General',
        preferredAisle: itemDetails ? itemDetails.preferredAisle : 'General Aisle'
      };

      setShoppingList(prev => ({
        ...prev,
        entries: [newEntry, ...prev.entries]
      }));
    }
  };

  const toggleListEntry = async (entryId, checked) => {
    if (serverStatus === 'online') {
      await apiRequest(`/list/entry/${entryId}/check`, 'PATCH', { checked });
      await fetchList();
    } else {
      setShoppingList(prev => ({
        ...prev,
        entries: prev.entries.map(e => e._id === entryId ? { ...e, checked } : e)
      }));
    }
  };

  const deleteListEntry = async (entryId) => {
    if (serverStatus === 'online') {
      await apiRequest(`/list/entry/${entryId}`, 'DELETE');
      await fetchList();
    } else {
      setShoppingList(prev => ({
        ...prev,
        entries: prev.entries.filter(e => e._id !== entryId)
      }));
    }
  };

  const clearCheckedItems = async () => {
    if (serverStatus === 'online') {
      await apiRequest('/list/clear-checked', 'POST');
      await fetchList();
    } else {
      setShoppingList(prev => ({
        ...prev,
        entries: prev.entries.filter(e => !e.checked)
      }));
    }
  };

  const autoPopulateRestocks = async () => {
    if (serverStatus === 'online') {
      const result = await apiRequest('/list/auto-populate', 'POST');
      await fetchList();
      return result.message;
    } else {
      // Offline restock engine
      let added = 0;
      pantryItems.forEach(item => {
        const isAlreadyOnList = shoppingList.entries.some(e => e.itemId === item._id && !e.checked);
        if (!isAlreadyOnList && item.status !== 'safe') {
          const newEntry = {
            _id: Math.random().toString(),
            itemId: item._id,
            customText: item.name,
            qty: Math.max(1, item.minStockLevel),
            unit: item.defaultUnit,
            checked: false,
            source: item.status,
            name: item.name,
            category: item.category,
            preferredAisle: item.preferredAisle
          };
          setShoppingList(prev => ({
            ...prev,
            entries: [...prev.entries, newEntry]
          }));
          added++;
        }
      });
      return `Restock routine complete. Added ${added} low-stock/expiring items automatically!`;
    }
  };

  const analyzeRecipeIngredients = async (recipeId, servings) => {
    if (serverStatus === 'online') {
      return await apiRequest('/recipes/scale-cart', 'POST', { recipeId, targetServings: servings });
    } else {
      // Offline mock analysis
      const recipe = recipes.find(r => r._id === recipeId);
      if (!recipe) return null;
      const scaleFactor = servings / recipe.servings;
      const analysis = recipe.ingredients.map(ing => {
        const scaledQty = Number((ing.qty * scaleFactor).toFixed(2));
        const matchedItem = pantryItems.find(i => i._id === ing.itemId || i.name.toLowerCase() === ing.name.toLowerCase());
        const stockQty = matchedItem ? matchedItem.stock : 0;
        const netNeed = Math.max(0, Number((scaledQty - stockQty).toFixed(2)));
        return {
          name: ing.name,
          itemId: matchedItem ? matchedItem._id : null,
          requiredQty: scaledQty,
          stockQty,
          netNeed,
          unit: ing.unit,
          hasEnough: stockQty >= scaledQty
        };
      });
      return {
        recipeId,
        recipeTitle: recipe.title,
        originalServings: recipe.servings,
        targetServings: servings,
        scaleFactor,
        analysis
      };
    }
  };

  const bulkAddRecipeIngredients = async (items) => {
    if (serverStatus === 'online') {
      await apiRequest('/recipes/bulk-cart', 'POST', { items });
      await fetchList();
    } else {
      // Offline local batch carting
      const entriesToAdd = items.filter(i => i.netNeed > 0).map(ing => {
        const itemDetails = pantryItems.find(i => i._id === ing.itemId);
        return {
          _id: Math.random().toString(),
          itemId: ing.itemId || null,
          customText: ing.itemId ? '' : ing.name,
          qty: ing.netNeed,
          unit: ing.unit,
          checked: false,
          source: 'recipe',
          name: ing.name,
          category: itemDetails ? itemDetails.category : 'General',
          preferredAisle: itemDetails ? itemDetails.preferredAisle : 'General Aisle'
        };
      });
      setShoppingList(prev => ({
        ...prev,
        entries: [...entriesToAdd, ...prev.entries]
      }));
    }
  };

  const uploadReceiptOCRText = async (text, store) => {
    if (serverStatus === 'online') {
      const data = await apiRequest('/inventory/ocr-receipt', 'POST', { rawText: text, storeName: store });
      await fetchPantry();
      return data;
    } else {
      // Offline local receipt parser (simulates backend parser)
      const lines = text.split('\n');
      const imported = [];
      lines.forEach(line => {
        if (!line.trim()) return;
        const words = line.trim().split(/\s+/);
        let name = words.filter(w => !/\d/.test(w) && !/Rs|INR|Rs\.|\$/i.test(w)).join(' ');
        let qty = 1;
        let price = 50;
        
        // Simple extraction
        const numbers = words.filter(w => /\d/.test(w));
        if (numbers.length > 0) qty = parseFloat(numbers[0]) || 1;
        if (numbers.length > 1) price = parseFloat(numbers[1]) || 50;

        if (!name || name.length < 2) return;
        name = name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // Categorize
        let category = 'Produce';
        if (/milk|cheese|paneer|curd|butter|egg/i.test(name)) category = 'Dairy';
        else if (/bread|bun|croissant|bakery/i.test(name)) category = 'Bakery';
        else if (/rice|wheat|flour|pulses|dal|grain/i.test(name)) category = 'Grains';

        const newItem = {
          _id: Math.random().toString(),
          name,
          category,
          barcode: '',
          defaultUnit: 'pieces',
          minStockLevel: 2,
          preferredAisle: `Aisle ${category.charAt(0)}`,
          stock: qty,
          totalPurchased: qty,
          status: qty > 2 ? 'safe' : 'lowstock',
          lots: [{
            _id: Math.random().toString(),
            qty,
            consumedQty: 0,
            unit: 'pieces',
            expiryAt: new Date(Date.now() + 5 * 86400000),
            price,
            store: store || 'Grocery Store'
          }]
        };
        imported.push(newItem);
      });

      setPantryItems(prev => [...imported, ...prev]);
      return { importedItems: imported };
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      token,
      pantryItems,
      shoppingList,
      recipes,
      simulatedLogs,
      activePage,
      isLoading,
      errorMsg,
      serverStatus,
      setActivePage,
      login,
      register,
      logout,
      addGroceryItem,
      addLot,
      consumeStock,
      deleteItem,
      addItemToShoppingList,
      toggleListEntry,
      deleteListEntry,
      clearCheckedItems,
      autoPopulateRestocks,
      analyzeRecipeIngredients,
      bulkAddRecipeIngredients,
      uploadReceiptOCRText,
      triggerRefresh: () => { fetchPantry(); fetchList(); }
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
