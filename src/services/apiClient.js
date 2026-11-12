/**
 * Centralized API Client for CampusBite Frontend
 * ---------------------------------------------------------------------------
 * Toggle `USE_MOCK_API` to `false` when plugging into the backend REST/WS API.
 * All UI components talk ONLY to this service layer, so no component refactoring
 * is required when migrating from localStorage mock mode to live endpoints.
 */

import {
  INITIAL_MENU,
  INITIAL_SLOTS_META,
  INITIAL_ORDERS,
  buildDemoFillOrdersFor1230
} from '../data/mockSeed.js';

const USE_MOCK_API = true;

const API_BASE_URL = 'http://localhost:5000/api';
const WS_BASE_URL = 'ws://localhost:5000/ws/updates';
const STORAGE_KEY = 'campusbite_mock_db_v1';
const STAFF_SESSION_KEY = 'campusbite_staff_session_v1';
const UPDATE_EVENT = 'campusbite:db-update';
const DEMO_STAFF_PIN = '1234';

let activeRole = 'student'; // 'student' | 'kitchen' | 'manager'

export function setApiUserRole(role) {
  activeRole = role;
}

export function isMockApiEnabled() {
  return USE_MOCK_API;
}

/* ==========================================================================
   Staff Session Helpers (sessionStorage) & Auth Headers
   ========================================================================== */

export function getStaffSession() {
  try {
    const raw = sessionStorage.getItem(STAFF_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.token && (parsed.role === 'kitchen' || parsed.role === 'manager')) {
      return parsed;
    }
  } catch {
    // Ignore invalid sessionStorage data
  }
  return null;
}

export function setStaffSession(session) {
  try {
    sessionStorage.setItem(STAFF_SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage write errors
  }
}

export function clearStaffSession() {
  try {
    sessionStorage.removeItem(STAFF_SESSION_KEY);
  } catch {
    // Ignore storage removal errors
  }
}

function getStudentAuthToken() {
  try {
    return localStorage.getItem('campusbite_auth_token') || 'demo-student-jwt-token';
  } catch {
    return 'demo-student-jwt-token';
  }
}

/**
 * Single centralized HTTP request wrapper for backend REST calls.
 * - For public/student routes: attaches Student Authorization token + x-user-role.
 * - For Staff Portal mutations (`staffAuth: true` — updateOrderStatus, toggleItemStock,
 *   addMenuItem): attaches `Authorization: Bearer <staff_token>` and `x-staff-role`.
 */
async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, staffAuth = false } = options;
  const staffSession = getStaffSession();

  const authHeaders = staffAuth
    ? {
        // Backend middleware verifies staff JWT + role privileges (`kitchen` | `manager`)
        Authorization: `Bearer ${staffSession?.token || 'unauthenticated-staff-token'}`,
        'x-staff-role': staffSession?.role || activeRole
      }
    : {
        Authorization: `Bearer ${getStudentAuthToken()}`,
        'x-user-role': activeRole
      };

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...headers
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || `API request failed (${response.status})`);
    error.status = response.status;
    error.code = payload.code || 'API_ERROR';
    error.details = payload.details || null;
    throw error;
  }

  return payload;
}

/* ==========================================================================
   LocalStorage Mock Database Engine (Offline Fallback & Cross-Tab Live Sync)
   ========================================================================== */

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function loadMockDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.menu) && Array.isArray(parsed.orders)) {
        return parsed;
      }
    }
  } catch {
    // Ignore malformed localStorage and fall back to fresh seed
  }

  const seeded = {
    menu: clone(INITIAL_MENU),
    slotsMeta: clone(INITIAL_SLOTS_META),
    orders: clone(INITIAL_ORDERS)
  };
  saveMockDb(seeded, false);
  return seeded;
}

function saveMockDb(db, notify = true) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Fallback gracefully if storage quota exceeded
  }
  if (notify && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT, { detail: { timestamp: Date.now() } }));
  }
}

function computeSlotsFromDb(db) {
  return db.slotsMeta.map((slot) => {
    const slotOrders = db.orders.filter(
      (ord) => ord.slotId === slot.id && ord.status !== 'CANCELLED'
    );
    const foodOrdersCount = slotOrders.length;
    const dineInTablesCount = slotOrders.filter((ord) => ord.orderType === 'dine-in').length;

    return {
      ...slot,
      foodOrdersCount,
      dineInTablesCount,
      isFoodFull: foodOrdersCount >= slot.maxFoodOrders,
      isTablesFull: dineInTablesCount >= slot.maxDineInTables
    };
  });
}

function generateUniqueToken(existingOrders) {
  const used = new Set(existingOrders.map((o) => o.token));
  for (let i = 0; i < 40; i += 1) {
    const candidate = String(Math.floor(1000 + Math.random() * 9000));
    if (!used.has(candidate)) return candidate;
  }
  return String(Date.now()).slice(-4);
}

/* ==========================================================================
   Public & Staff Protected API Client Methods
   ========================================================================== */

export const apiClient = {
  /**
   * Authenticate Staff Portal access using PIN & role (`kitchen` | `manager`).
   * // TODO: Connect Backend Endpoint -> POST /api/staff/login
   */
  async authenticateStaff({ pin, role }) {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> const res = await request('/staff/login', { method: 'POST', body: { pin, role } });
      const res = await request('/staff/login', {
        method: 'POST',
        body: { pin, role }
      });
      setStaffSession(res);
      return res;
    }

    const cleanPin = String(pin || '').trim();
    if (cleanPin !== DEMO_STAFF_PIN) {
      const err = new Error('Invalid Staff PIN. Use demo PIN 1234.');
      err.code = 'INVALID_PIN';
      throw err;
    }

    const validRole = role === 'manager' ? 'manager' : 'kitchen';
    const session = {
      role: validRole,
      token: `staff-${validRole}-jwt-${Date.now().toString(36)}`,
      authenticatedAt: new Date().toISOString()
    };
    setStaffSession(session);
    setApiUserRole(validRole);
    return clone(session);
  },

  /**
   * Fetch canteen menu items with optional filter (`all` | `veg` | `non-veg` | `new`).
   * // TODO: Connect Backend Endpoint -> GET /api/menu
   */
  async getMenu(filter = 'all') {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> return request(`/menu?filter=${encodeURIComponent(filter)}`);
      return request(`/menu?filter=${encodeURIComponent(filter)}`);
    }

    const db = loadMockDb();
    let items = db.menu;
    if (filter === 'veg') items = items.filter((i) => i.isVeg);
    else if (filter === 'non-veg') items = items.filter((i) => !i.isVeg);
    else if (filter === 'new') items = items.filter((i) => i.isNew);
    return clone(items);
  },

  /**
   * Fetch 10-minute pickup & dine-in slot capacities.
   * // TODO: Connect Backend Endpoint -> GET /api/slots
   */
  async getSlots() {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> return request('/slots');
      return request('/slots');
    }

    const db = loadMockDb();
    return computeSlotsFromDb(db);
  },

  /**
   * Fetch orders (optionally filtered by studentId, slotId, or status).
   * // TODO: Connect Backend Endpoint -> GET /api/orders
   */
  async getOrders(filters = {}) {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> return request('/orders?...');
      const params = new URLSearchParams(filters).toString();
      return request(`/orders${params ? `?${params}` : ''}`);
    }

    const db = loadMockDb();
    let list = db.orders;
    if (filters.studentId) {
      list = list.filter((o) => o.studentId === filters.studentId);
    }
    if (filters.slotId) {
      list = list.filter((o) => o.slotId === filters.slotId);
    }
    if (filters.status) {
      list = list.filter((o) => o.status === filters.status);
    }
    return clone(list).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Place a new pre-order into a load-balanced slot & reserve table if dine-in.
   * // TODO: Connect Backend Endpoint -> POST /api/orders
   */
  async createOrder(orderPayload) {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> return request('/orders', { method: 'POST', body: orderPayload });
      return request('/orders', { method: 'POST', body: orderPayload });
    }

    const db = loadMockDb();
    const slots = computeSlotsFromDb(db);
    const targetSlot = slots.find((s) => s.id === orderPayload.slotId);

    if (!targetSlot) {
      throw new Error(`Invalid pickup slot: ${orderPayload.slotId}`);
    }
    if (targetSlot.isFoodFull) {
      const err = new Error(`Slot ${targetSlot.id} is full (10/10 food orders).`);
      err.code = 'SLOT_FULL';
      throw err;
    }
    if (orderPayload.orderType === 'dine-in' && targetSlot.isTablesFull) {
      const err = new Error(`All 10 dine-in tables in ${targetSlot.id} are reserved.`);
      err.code = 'TABLES_FULL';
      throw err;
    }

    const verifiedItems = [];
    let totalAmount = 0;

    for (const line of orderPayload.items || []) {
      const menuItem = db.menu.find((m) => m.id === line.itemId);
      if (!menuItem) throw new Error(`Dish not found: ${line.itemId}`);
      if (!menuItem.inStock) throw new Error(`${menuItem.name} just went out of stock.`);

      const qty = Math.max(1, Number(line.qty || line.quantity || 1));
      verifiedItems.push({
        itemId: menuItem.id,
        name: menuItem.name,
        qty,
        price: menuItem.price
      });
      totalAmount += menuItem.price * qty;
    }

    if (verifiedItems.length === 0) {
      throw new Error('Cannot place an empty order.');
    }

    const tableNumber =
      orderPayload.orderType === 'dine-in' ? targetSlot.dineInTablesCount + 1 : null;

    const newOrder = {
      id: `ord-${Date.now().toString(36)}`,
      token: generateUniqueToken(db.orders),
      studentId: orderPayload.studentId,
      studentName: orderPayload.studentName || 'Campus Student',
      slotId: targetSlot.id,
      orderType: orderPayload.orderType === 'dine-in' ? 'dine-in' : 'takeaway',
      tableNumber,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      items: verifiedItems,
      totalAmount
    };

    db.orders.unshift(newOrder);
    saveMockDb(db);
    return clone(newOrder);
  },

  /**
   * Staff Protected Action (`kitchen` | `manager`):
   * Update order lifecycle status (`PLACED` -> `PREPARING` -> `READY` -> `COLLECTED`).
   * // TODO: Connect Backend Endpoint -> PATCH /api/orders/:orderId/status (sends Authorization + x-staff-role)
   */
  async updateOrderStatus(orderId, status) {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> requires staff Authorization Bearer token & x-staff-role header
      return request(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status },
        staffAuth: true
      });
    }

    const db = loadMockDb();
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found.`);
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    saveMockDb(db);
    return clone(order);
  },

  /**
   * Staff Protected Action (`manager`):
   * Toggle item stock (`inStock`) or `"New Update"` flag (`isNew`) from Manager Dashboard.
   * // TODO: Connect Backend Endpoint -> PATCH /api/menu/:itemId (sends Authorization + x-staff-role)
   */
  async toggleItemStock(itemId, updates) {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> requires staff Authorization Bearer token & x-staff-role header
      return request(`/menu/${itemId}`, {
        method: 'PATCH',
        body: updates,
        staffAuth: true
      });
    }

    const db = loadMockDb();
    const item = db.menu.find((m) => m.id === itemId);
    if (!item) {
      throw new Error(`Menu item ${itemId} not found.`);
    }
    if (typeof updates.inStock === 'boolean') item.inStock = updates.inStock;
    if (typeof updates.isNew === 'boolean') item.isNew = updates.isNew;

    saveMockDb(db);
    return clone(item);
  },

  /**
   * Staff Protected Action (`manager`):
   * Publish a brand-new food item from Canteen Manager Dashboard.
   * // TODO: Connect Backend Endpoint -> POST /api/menu (sends Authorization + x-staff-role)
   */
  async addMenuItem(itemPayload) {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> requires staff Authorization Bearer token & x-staff-role header
      return request('/menu', {
        method: 'POST',
        body: itemPayload,
        staffAuth: true
      });
    }

    const db = loadMockDb();
    const cleanName = String(itemPayload.name || '').trim();
    if (!cleanName) throw new Error('Dish name is required.');

    const newItem = {
      id: `item-${Date.now().toString(36)}`,
      name: cleanName,
      price: Math.max(1, Number(itemPayload.price) || 50),
      isVeg: Boolean(itemPayload.isVeg),
      isNew: itemPayload.isNew !== undefined ? Boolean(itemPayload.isNew) : true,
      inStock: true,
      calories: Math.max(20, Number(itemPayload.calories) || 300),
      protein: Math.max(1, Number(itemPayload.protein) || 10),
      carbs: Math.round(((Number(itemPayload.calories) || 300) * 0.5) / 4),
      fat: Math.round(((Number(itemPayload.calories) || 300) * 0.25) / 9),
      prepMins: Math.max(2, Number(itemPayload.prepMins) || 6),
      rating: 4.8,
      category: itemPayload.isVeg ? 'Veg Specials' : 'Chef Specials',
      artKey: 'custom',
      description:
        itemPayload.description ||
        `Freshly prepared ${cleanName} added live by the Canteen Manager.`,
      aliases: [cleanName.toLowerCase()]
    };

    db.menu.unshift(newItem);
    saveMockDb(db);
    return clone(newItem);
  },

  // Alias preserved for backwards compatibility
  createMenuItem(itemPayload) {
    return this.addMenuItem(itemPayload);
  },

  /**
   * Pitch Helper: Sets slot `12:30` to exact 9/10 capacity (Amber / Filling Fast).
   * // TODO: Connect Backend Endpoint -> POST /api/demo/fill-slot
   */
  async fillSlotForDemo(slotId = '12:30', targetCount = 9) {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> return request('/demo/fill-slot', { method: 'POST', body: { slotId, targetCount } });
      return request('/demo/fill-slot', {
        method: 'POST',
        body: { slotId, targetCount }
      });
    }

    const db = loadMockDb();
    const otherOrders = db.orders.filter((o) => o.slotId !== slotId);
    const fillOrders = buildDemoFillOrdersFor1230().slice(0, targetCount);

    db.orders = [...fillOrders, ...otherOrders];
    saveMockDb(db);
    return computeSlotsFromDb(db);
  },

  /**
   * Restores initial seed dataset in localStorage for repeat demo runs.
   */
  async resetDemoState() {
    if (!USE_MOCK_API) {
      // TODO: Connect Backend Endpoint -> return request('/demo/reset', { method: 'POST' });
      return request('/demo/reset', { method: 'POST' });
    }

    const seeded = {
      menu: clone(INITIAL_MENU),
      slotsMeta: clone(INITIAL_SLOTS_META),
      orders: clone(INITIAL_ORDERS)
    };
    saveMockDb(seeded);
    return seeded;
  },

  /**
   * Real-time cross-tab sync (Mock Mode via `storage` event) or WebSocket in production.
   * // TODO: Connect Backend WebSocket -> ws://.../ws/updates
   */
  subscribeToUpdates(onUpdate) {
    if (!USE_MOCK_API) {
      // TODO: Replace with authenticated WebSocket / SSE listener
      const staffSession = getStaffSession();
      const wsRole = staffSession?.role || activeRole;
      const ws = new WebSocket(`${WS_BASE_URL}?role=${encodeURIComponent(wsRole)}`);
      ws.addEventListener('message', (evt) => {
        try {
          onUpdate(JSON.parse(evt.data));
        } catch {
          onUpdate({ type: 'SYNC_REQUIRED' });
        }
      });
      return () => ws.close();
    }

    const handleLocal = () => onUpdate({ type: 'LOCAL_SYNC' });
    const handleStorage = (evt) => {
      // Instantaneously syncs Student Page (Tab 1) <-> Staff Portal (Tab 2)
      if (!evt.key || evt.key === STORAGE_KEY) {
        onUpdate({ type: 'CROSS_TAB_SYNC' });
      }
    };

    window.addEventListener(UPDATE_EVENT, handleLocal);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(UPDATE_EVENT, handleLocal);
      window.removeEventListener('storage', handleStorage);
    };
  }
};
