# CampusBite Backend Integration — `API_CONTRACT.md`

This document specifies the exact HTTP REST & WebSocket contract consumed by `src/services/apiClient.js`.
To switch the frontend from mock `localStorage` mode to your live backend, set:

```js
// src/services/apiClient.js
const USE_MOCK_API = false;
const API_BASE_URL = 'http://localhost:5000/api';
const WS_BASE_URL = 'ws://localhost:5000/ws/updates';
```

---

## 1. Global Headers & Error Format

Every REST request sent by `request()` includes:

- **Public / Student Requests (`getMenu`, `getSlots`, `getOrders`, `createOrder`):**
```http
Content-Type: application/json
Authorization: Bearer <student_token>
x-user-role: student
```

- **Protected Staff Backend Requests (`updateOrderStatus`, `toggleItemStock`, `addMenuItem`):**
```http
Content-Type: application/json
Authorization: Bearer <staff_token>
x-staff-role: kitchen | manager
```

### Standard Error Response (`4xx` / `5xx`)

```json
{
  "code": "SLOT_FULL",
  "message": "Slot 12:30 is full (10/10 food orders).",
  "details": {
    "slotId": "12:30",
    "suggestedSlotId": "12:40"
  }
}
```

Recommended error codes: `SLOT_FULL` (`409`), `TABLES_FULL` (`409`), `ITEM_OUT_OF_STOCK` (`409`), `INVALID_PIN` (`401`), `UNAUTHORIZED` (`401`), `FORBIDDEN` (`403`), `NOT_FOUND` (`404`).

---

## 2. Endpoints

### `POST /api/staff/login`
Authenticates Kitchen Staff or Canteen Manager via PIN and returns a staff JWT token.

**Request Body:**
```json
{
  "pin": "1234",
  "role": "kitchen"
}
```

**Response `200 OK`:**
```json
{
  "role": "kitchen",
  "token": "staff-kitchen-jwt-token",
  "authenticatedAt": "2026-11-12T11:40:00+05:30"
}
```

---

### `GET /api/menu`
Returns all canteen dishes (optionally filtered by `?filter=all|veg|non-veg|new`).

**Response `200 OK`:**
```json
[
  {
    "id": "item-dosa",
    "name": "Masala Dosa",
    "price": 55,
    "isVeg": true,
    "isNew": false,
    "inStock": true,
    "calories": 320,
    "protein": 8,
    "carbs": 48,
    "fat": 10,
    "prepMins": 6,
    "rating": 4.8,
    "category": "South Indian",
    "artKey": "dosa",
    "description": "Crispy golden crepe stuffed with spiced potato masala, coconut chutney & hot sambar.",
    "aliases": ["dosa", "masala dosa"]
  }
]
```

---

### `POST /api/menu` *(Role: `manager`)*
Creates and publishes a new food item to the live menu.

**Request Body:**
```json
{
  "name": "Paneer Butter Bowl",
  "price": 85,
  "isVeg": true,
  "calories": 380,
  "protein": 14,
  "isNew": true
}
```

**Response `201 Created`:** Returns the created menu item object matching the `GET /api/menu` schema.

---

### `PATCH /api/menu/:itemId` *(Role: `manager`)*
Toggles stock availability (`inStock`) or New badge (`isNew`).

**Request Body:**
```json
{
  "inStock": false,
  "isNew": true
}
```

**Response `200 OK`:** Returns the updated menu item object.

---

### `GET /api/slots`
Returns real-time capacity counters for the 10-minute pickup & dine-in slots (`12:20`, `12:30`, `12:40`, `12:50`).

**Response `200 OK`:**
```json
[
  {
    "id": "12:20",
    "label": "12:20 PM",
    "maxFoodOrders": 10,
    "maxDineInTables": 10,
    "foodOrdersCount": 4,
    "dineInTablesCount": 2,
    "isFoodFull": false,
    "isTablesFull": false
  },
  {
    "id": "12:30",
    "label": "12:30 PM",
    "maxFoodOrders": 10,
    "maxDineInTables": 10,
    "foodOrdersCount": 9,
    "dineInTablesCount": 9,
    "isFoodFull": false,
    "isTablesFull": false
  }
]
```

---

### `GET /api/orders`
Returns orders sorted newest-first. Supports optional query params: `?studentId=...&slotId=...&status=...`.

**Response `200 OK`:**
```json
[
  {
    "id": "ord-101",
    "token": "4821",
    "studentId": "stu-demo-01",
    "studentName": "Aarav • CS-3B",
    "slotId": "12:20",
    "orderType": "dine-in",
    "tableNumber": 3,
    "status": "PREPARING",
    "createdAt": "2026-11-12T10:48:00+05:30",
    "items": [
      { "itemId": "item-dosa", "name": "Masala Dosa", "qty": 1, "price": 55 },
      { "itemId": "item-coffee", "name": "Cold Coffee", "qty": 1, "price": 45 }
    ],
    "totalAmount": 100
  }
]
```

---

### `POST /api/orders` *(Role: `student`)*
Atomically validates item stock and slot limits (`maxFoodOrders = 10`, `maxDineInTables = 10` if `orderType === "dine-in"`), generates a unique 4-digit `token`, assigns `tableNumber` if `dine-in`, and creates the order.

**Request Body:**
```json
{
  "studentId": "stu-demo-01",
  "studentName": "Aarav • CS-3B",
  "slotId": "12:30",
  "orderType": "dine-in",
  "items": [
    { "itemId": "item-dosa", "qty": 2 },
    { "itemId": "item-coffee", "qty": 1 }
  ]
}
```

**Response `201 Created`:** Returns the newly created order object (with `token`, `tableNumber`, `status: "PLACED"`, `totalAmount`).
**Response `409 Conflict`:** If `foodOrdersCount >= 10` (`code: "SLOT_FULL"`) or `dineInTablesCount >= 10` (`code: "TABLES_FULL"`).

---

### `PATCH /api/orders/:orderId/status` *(Role: `staff` | `student`)*
Transitions an order through lifecycle states: `PLACED` -> `PREPARING` -> `READY` -> `COLLECTED`.

**Request Body:**
```json
{
  "status": "READY"
}
```

**Response `200 OK`:** Returns the updated order object.

---

### `POST /api/demo/fill-slot` *(Optional Hackathon Pitch Endpoint)*
Sets a target slot (e.g., `12:30`) to `9/10` capacity for live demos.

**Request Body:**
```json
{
  "slotId": "12:30",
  "targetCount": 9
}
```

**Response `200 OK`:** Returns the updated `GET /api/slots` array.

---

## 3. Real-Time WebSocket Contract (`WS /ws/updates`)

When `USE_MOCK_API = false`, `apiClient.subscribeToUpdates()` connects to `ws://localhost:5000/ws/updates?role=<activeRole>` and triggers a UI refresh whenever any of these JSON messages arrive:

```json
{
  "type": "ORDER_STATUS_UPDATED",
  "payload": {
    "orderId": "ord-101",
    "status": "READY",
    "slotId": "12:20"
  }
}
```

Supported event `type` strings:
- `ORDER_CREATED`
- `ORDER_STATUS_UPDATED`
- `MENU_UPDATED`
- `SLOT_UPDATED`

