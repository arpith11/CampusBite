/**
 * Mock Seed Data for CampusBite Canteen Queue & Pre-Order System
 * ---------------------------------------------------------------------------
 * Used when `USE_MOCK_API = true` in `services/apiClient.js`.
 * Provides initial menu catalog, 10-minute slots, and live sample orders.
 */

export const CURRENT_STUDENT_ID = 'stu-demo-01';
export const CURRENT_STUDENT_NAME = 'Aarav • CS-3B';

export const INITIAL_MENU = [
  {
    id: 'item-dosa',
    name: 'Masala Dosa',
    price: 55,
    isVeg: true,
    isNew: false,
    inStock: true,
    calories: 320,
    protein: 8,
    carbs: 48,
    fat: 10,
    prepMins: 6,
    rating: 4.8,
    category: 'South Indian',
    artKey: 'dosa',
    description: 'Crispy golden crepe stuffed with spiced potato masala, coconut chutney & hot sambar.',
    aliases: ['dosa', 'masala dosa', 'plain dosa']
  },
  {
    id: 'item-coffee',
    name: 'Cold Coffee',
    price: 45,
    isVeg: true,
    isNew: false,
    inStock: true,
    calories: 180,
    protein: 5,
    carbs: 26,
    fat: 6,
    prepMins: 3,
    rating: 4.7,
    category: 'Beverages',
    artKey: 'coffee',
    description: 'Chilled espresso blended with milk, ice cubes, and a touch of dark cocoa.',
    aliases: ['cold coffee', 'coffee', 'iced coffee']
  },
  {
    id: 'item-puff',
    name: 'Veg Puff',
    price: 25,
    isVeg: true,
    isNew: false,
    inStock: true,
    calories: 240,
    protein: 5,
    carbs: 28,
    fat: 12,
    prepMins: 2,
    rating: 4.5,
    category: 'Quick Bites',
    artKey: 'puff',
    description: 'Flaky oven-baked pastry filled with spiced peas, carrot, and potato.',
    aliases: ['puff', 'veg puff', 'patties', 'veg patty']
  },
  {
    id: 'item-paneer-roll',
    name: 'Paneer Kathi Roll',
    price: 75,
    isVeg: true,
    isNew: true,
    inStock: true,
    calories: 410,
    protein: 16,
    carbs: 46,
    fat: 17,
    prepMins: 7,
    rating: 4.6,
    category: 'Wraps & Rolls',
    artKey: 'roll',
    description: 'Char-grilled malai paneer cubes, mint chutney & crunchy onions wrapped in flaky paratha.',
    aliases: ['paneer roll', 'kathi roll', 'paneer kathi roll', 'veg roll']
  },
  {
    id: 'item-chicken-wrap',
    name: 'Chicken Tikka Wrap',
    price: 95,
    isVeg: false,
    isNew: true,
    inStock: true,
    calories: 460,
    protein: 28,
    carbs: 42,
    fat: 18,
    prepMins: 8,
    rating: 4.8,
    category: 'Wraps & Rolls',
    artKey: 'wrap',
    description: 'Smoky tandoori chicken strips tossed in garlic yogurt mayo inside toasted tortilla.',
    aliases: ['chicken wrap', 'tikka wrap', 'chicken tikka wrap', 'chicken roll']
  },
  {
    id: 'item-egg-rice',
    name: 'Egg Fried Rice',
    price: 80,
    isVeg: false,
    isNew: false,
    inStock: true,
    calories: 490,
    protein: 18,
    carbs: 64,
    fat: 16,
    prepMins: 8,
    rating: 4.4,
    category: 'Meals',
    artKey: 'rice',
    description: 'Wok-tossed basmati rice with scrambled farm eggs, spring onions, and soy glaze.',
    aliases: ['egg rice', 'egg fried rice', 'fried rice']
  },
  {
    id: 'item-chole',
    name: 'Chole Bhature',
    price: 70,
    isVeg: true,
    isNew: false,
    inStock: true,
    calories: 540,
    protein: 14,
    carbs: 72,
    fat: 21,
    prepMins: 6,
    rating: 4.6,
    category: 'Meals',
    artKey: 'chole',
    description: 'Slow-simmered Amritsari spiced chickpeas served with two fluffy golden bhature.',
    aliases: ['chole', 'chole bhature', 'bhature']
  },
  {
    id: 'item-chai',
    name: 'Masala Chai',
    price: 15,
    isVeg: true,
    isNew: false,
    inStock: true,
    calories: 90,
    protein: 2,
    carbs: 13,
    fat: 3,
    prepMins: 2,
    rating: 4.9,
    category: 'Beverages',
    artKey: 'chai',
    description: 'Freshly brewed Assam tea infused with crushed ginger and green cardamom.',
    aliases: ['chai', 'tea', 'masala chai', 'ginger tea']
  },
  {
    id: 'item-peri-bowl',
    name: 'Peri-Peri Chicken Bowl',
    price: 120,
    isVeg: false,
    isNew: true,
    inStock: true,
    calories: 510,
    protein: 34,
    carbs: 48,
    fat: 18,
    prepMins: 9,
    rating: 4.7,
    category: 'High Protein',
    artKey: 'bowl',
    description: 'Herb rice topped with spicy peri-peri grilled chicken, corn salsa & garlic drizzle.',
    aliases: ['chicken bowl', 'peri peri bowl', 'peri-peri chicken bowl', 'protein bowl']
  },
  {
    id: 'item-samosa',
    name: 'Samosa Plate (2 pcs)',
    price: 30,
    isVeg: true,
    isNew: false,
    inStock: true,
    calories: 290,
    protein: 6,
    carbs: 38,
    fat: 13,
    prepMins: 2,
    rating: 4.5,
    category: 'Quick Bites',
    artKey: 'samosa',
    description: 'Crisp triangle samosas served hot with tangy tamarind and fresh mint chutneys.',
    aliases: ['samosa', 'samosas', 'samosa plate']
  },
  {
    id: 'item-fries',
    name: 'Loaded Cheese Fries',
    price: 65,
    isVeg: true,
    isNew: false,
    inStock: false,
    calories: 420,
    protein: 9,
    carbs: 50,
    fat: 20,
    prepMins: 5,
    rating: 4.3,
    category: 'Quick Bites',
    artKey: 'fries',
    description: 'Crispy salted fries drizzled with warm cheddar jalapeño sauce.',
    aliases: ['fries', 'cheese fries', 'loaded fries', 'loaded cheese fries']
  }
];

export const INITIAL_SLOTS_META = [
  { id: '12:20', label: '12:20 PM', maxFoodOrders: 10, maxDineInTables: 10 },
  { id: '12:30', label: '12:30 PM', maxFoodOrders: 10, maxDineInTables: 10 },
  { id: '12:40', label: '12:40 PM', maxFoodOrders: 10, maxDineInTables: 10 },
  { id: '12:50', label: '12:50 PM', maxFoodOrders: 10, maxDineInTables: 10 }
];

export const INITIAL_ORDERS = [
  {
    id: 'ord-101',
    token: '4821',
    studentId: CURRENT_STUDENT_ID,
    studentName: CURRENT_STUDENT_NAME,
    slotId: '12:20',
    orderType: 'dine-in',
    tableNumber: 3,
    status: 'PREPARING',
    createdAt: '2026-11-12T10:48:00+05:30',
    items: [
      { itemId: 'item-dosa', name: 'Masala Dosa', qty: 1, price: 55 },
      { itemId: 'item-coffee', name: 'Cold Coffee', qty: 1, price: 45 }
    ],
    totalAmount: 100
  },
  {
    id: 'ord-102',
    token: '3914',
    studentId: 'stu-02',
    studentName: 'Diya • EC-2A',
    slotId: '12:20',
    orderType: 'takeaway',
    tableNumber: null,
    status: 'PREPARING',
    createdAt: '2026-11-12T10:49:00+05:30',
    items: [
      { itemId: 'item-puff', name: 'Veg Puff', qty: 2, price: 25 },
      { itemId: 'item-chai', name: 'Masala Chai', qty: 2, price: 15 }
    ],
    totalAmount: 80
  },
  {
    id: 'ord-103',
    token: '5107',
    studentId: 'stu-03',
    studentName: 'Rohan • ME-4A',
    slotId: '12:20',
    orderType: 'dine-in',
    tableNumber: 1,
    status: 'READY',
    createdAt: '2026-11-12T10:45:00+05:30',
    items: [{ itemId: 'item-chole', name: 'Chole Bhature', qty: 1, price: 70 }],
    totalAmount: 70
  },
  {
    id: 'ord-104',
    token: '6240',
    studentId: 'stu-04',
    studentName: 'Meera • AI-1B',
    slotId: '12:20',
    orderType: 'takeaway',
    tableNumber: null,
    status: 'PLACED',
    createdAt: '2026-11-12T10:52:00+05:30',
    items: [{ itemId: 'item-chicken-wrap', name: 'Chicken Tikka Wrap', qty: 1, price: 95 }],
    totalAmount: 95
  },
  {
    id: 'ord-201',
    token: '7318',
    studentId: 'stu-05',
    studentName: 'Kabir • CS-2C',
    slotId: '12:30',
    orderType: 'dine-in',
    tableNumber: 2,
    status: 'PLACED',
    createdAt: '2026-11-12T10:54:00+05:30',
    items: [
      { itemId: 'item-dosa', name: 'Masala Dosa', qty: 2, price: 55 },
      { itemId: 'item-coffee', name: 'Cold Coffee', qty: 1, price: 45 }
    ],
    totalAmount: 155
  },
  {
    id: 'ord-202',
    token: '7492',
    studentId: 'stu-06',
    studentName: 'Ananya • IS-3A',
    slotId: '12:30',
    orderType: 'takeaway',
    tableNumber: null,
    status: 'PREPARING',
    createdAt: '2026-11-12T10:55:00+05:30',
    items: [
      { itemId: 'item-puff', name: 'Veg Puff', qty: 2, price: 25 },
      { itemId: 'item-paneer-roll', name: 'Paneer Kathi Roll', qty: 1, price: 75 }
    ],
    totalAmount: 125
  },
  {
    id: 'ord-203',
    token: '7655',
    studentId: 'stu-07',
    studentName: 'Vikram • CV-3B',
    slotId: '12:30',
    orderType: 'dine-in',
    tableNumber: 4,
    status: 'PLACED',
    createdAt: '2026-11-12T10:56:00+05:30',
    items: [{ itemId: 'item-peri-bowl', name: 'Peri-Peri Chicken Bowl', qty: 1, price: 120 }],
    totalAmount: 120
  },
  {
    id: 'ord-301',
    token: '8112',
    studentId: 'stu-08',
    studentName: 'Neha • BT-2B',
    slotId: '12:40',
    orderType: 'takeaway',
    tableNumber: null,
    status: 'PLACED',
    createdAt: '2026-11-12T10:57:00+05:30',
    items: [
      { itemId: 'item-samosa', name: 'Samosa Plate (2 pcs)', qty: 2, price: 30 },
      { itemId: 'item-chai', name: 'Masala Chai', qty: 2, price: 15 }
    ],
    totalAmount: 90
  },
  {
    id: 'ord-302',
    token: '8290',
    studentId: 'stu-09',
    studentName: 'Siddharth • CS-4A',
    slotId: '12:40',
    orderType: 'dine-in',
    tableNumber: 1,
    status: 'PLACED',
    createdAt: '2026-11-12T10:58:00+05:30',
    items: [{ itemId: 'item-egg-rice', name: 'Egg Fried Rice', qty: 1, price: 80 }],
    totalAmount: 80
  },
  {
    id: 'ord-401',
    token: '9043',
    studentId: 'stu-10',
    studentName: 'Priya • MBA-1',
    slotId: '12:50',
    orderType: 'dine-in',
    tableNumber: 1,
    status: 'PLACED',
    createdAt: '2026-11-12T10:59:00+05:30',
    items: [{ itemId: 'item-dosa', name: 'Masala Dosa', qty: 1, price: 55 }],
    totalAmount: 55
  }
];

/**
 * Generates realistic orders for 12:30 when presenter clicks
 * "Demo Mode: Fill 12:30 Slot (9/10)" so KDS batch counts and slot load
 * both match 9/10 cleanly (e.g., 8x Masala Dosa, 5x Veg Puff, 4x Cold Coffee).
 */
export function buildDemoFillOrdersFor1230() {
  return [
    {
      id: 'demo-1230-1',
      token: '7101',
      studentId: 'stu-demo-rush-1',
      studentName: 'Kabir • CS-2C',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 1,
      status: 'PREPARING',
      createdAt: new Date().toISOString(),
      items: [
        { itemId: 'item-dosa', name: 'Masala Dosa', qty: 2, price: 55 },
        { itemId: 'item-coffee', name: 'Cold Coffee', qty: 1, price: 45 }
      ],
      totalAmount: 155
    },
    {
      id: 'demo-1230-2',
      token: '7102',
      studentId: 'stu-demo-rush-2',
      studentName: 'Ananya • IS-3A',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 2,
      status: 'PREPARING',
      createdAt: new Date().toISOString(),
      items: [
        { itemId: 'item-dosa', name: 'Masala Dosa', qty: 2, price: 55 },
        { itemId: 'item-puff', name: 'Veg Puff', qty: 1, price: 25 }
      ],
      totalAmount: 135
    },
    {
      id: 'demo-1230-3',
      token: '7103',
      studentId: 'stu-demo-rush-3',
      studentName: 'Vikram • CV-3B',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 3,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      items: [
        { itemId: 'item-dosa', name: 'Masala Dosa', qty: 1, price: 55 },
        { itemId: 'item-coffee', name: 'Cold Coffee', qty: 1, price: 45 }
      ],
      totalAmount: 100
    },
    {
      id: 'demo-1230-4',
      token: '7104',
      studentId: 'stu-demo-rush-4',
      studentName: 'Tanvi • AI-2A',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 4,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      items: [
        { itemId: 'item-puff', name: 'Veg Puff', qty: 2, price: 25 },
        { itemId: 'item-dosa', name: 'Masala Dosa', qty: 1, price: 55 }
      ],
      totalAmount: 105
    },
    {
      id: 'demo-1230-5',
      token: '7105',
      studentId: 'stu-demo-rush-5',
      studentName: 'Arjun • EC-3C',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 5,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      items: [{ itemId: 'item-paneer-roll', name: 'Paneer Kathi Roll', qty: 1, price: 75 }],
      totalAmount: 75
    },
    {
      id: 'demo-1230-6',
      token: '7106',
      studentId: 'stu-demo-rush-6',
      studentName: 'Riya • CS-1A',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 6,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      items: [
        { itemId: 'item-dosa', name: 'Masala Dosa', qty: 1, price: 55 },
        { itemId: 'item-puff', name: 'Veg Puff', qty: 2, price: 25 }
      ],
      totalAmount: 105
    },
    {
      id: 'demo-1230-7',
      token: '7107',
      studentId: 'stu-demo-rush-7',
      studentName: 'Karan • ME-2B',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 7,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      items: [{ itemId: 'item-chicken-wrap', name: 'Chicken Tikka Wrap', qty: 1, price: 95 }],
      totalAmount: 95
    },
    {
      id: 'demo-1230-8',
      token: '7108',
      studentId: 'stu-demo-rush-8',
      studentName: 'Ishita • BT-3A',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 8,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      items: [
        { itemId: 'item-dosa', name: 'Masala Dosa', qty: 1, price: 55 },
        { itemId: 'item-coffee', name: 'Cold Coffee', qty: 1, price: 45 }
      ],
      totalAmount: 100
    },
    {
      id: 'demo-1230-9',
      token: '7109',
      studentId: 'stu-demo-rush-9',
      studentName: 'Dev • IS-4B',
      slotId: '12:30',
      orderType: 'dine-in',
      tableNumber: 9,
      status: 'PLACED',
      createdAt: new Date().toISOString(),
      items: [{ itemId: 'item-coffee', name: 'Cold Coffee', qty: 1, price: 45 }],
      totalAmount: 45
    }
  ];
}

