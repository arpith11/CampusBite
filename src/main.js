import {
  apiClient,
  setApiUserRole,
  getStaffSession,
  setStaffSession,
  clearStaffSession
} from './services/apiClient.js';
import { CURRENT_STUDENT_ID, CURRENT_STUDENT_NAME } from './data/mockSeed.js';
import { parsePlainLanguageOrder } from './utils/nlpOrderParser.js';
import { escapeHtml } from './utils/format.js';
import { icon } from './utils/icons.js';

import { renderHeader } from './components/Header.js';
import { renderOrderReadyBanner } from './components/OrderReadyBanner.js';
import { renderCartDrawer } from './components/CartDrawer.js';
import { renderDishDetailModal } from './components/DishDetailModal.js';
import { renderStudentView, renderNlpLivePreview } from './views/StudentView.js';
import { renderKitchenView } from './views/KitchenView.js';
import { renderManagerView } from './views/ManagerView.js';
import { renderStaffLoginView } from './views/StaffLoginView.js';

const appRoot = document.getElementById('app-root');
const toastRoot = document.getElementById('toast-root');

function resolveRouteFromHash() {
  const hash = (window.location.hash || '').toLowerCase();
  return hash === '#staff' || hash === '#/staff' ? 'staff' : 'student';
}

const initialStaffSession = getStaffSession();

const state = {
  route: resolveRouteFromHash(), // 'student' | 'staff'
  staffSession: initialStaffSession, // null | { role: 'kitchen' | 'manager', token }
  staffLoginRole: 'kitchen',
  staffLoginPin: '',
  staffLoginError: null,
  menu: [],
  slots: [],
  orders: [],
  menuFilter: 'all', // 'all' | 'veg' | 'non-veg' | 'new'
  orderType: 'takeaway', // 'takeaway' | 'dine-in'
  selectedSlotId: '12:30',
  kdsBatchSlot: 'all',
  cart: [], // [{ itemId, qty }]
  studentName: CURRENT_STUDENT_NAME,
  isCartOpen: false,
  isSubmittingOrder: false,
  activeDishModalId: null,
  nlpQuery: '',
  nlpFeedback: null,
  slotSuggestion: null,
  flashSlotId: null,
  shakeSlotId: null,
  dismissedReadyIds: []
};

/* ==========================================================================
   Toast Notifications
   ========================================================================== */

function showToast(title, message = '', variant = 'info', duration = 3800) {
  const toastEl = document.createElement('div');
  toastEl.className = `toast toast-${variant}`;
  toastEl.innerHTML = `
    <div style="margin-top:2px;color:${
      variant === 'success'
        ? 'var(--emerald-500)'
        : variant === 'warning'
        ? 'var(--amber-500)'
        : variant === 'error'
        ? 'var(--crimson-500)'
        : 'var(--brand-400)'
    }">
      ${icon(variant === 'success' ? 'checkCircle' : variant === 'error' || variant === 'warning' ? 'alert' : 'sparkles', 18)}
    </div>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-msg">${escapeHtml(message)}</div>` : ''}
    </div>
    <button type="button" class="toast-close" aria-label="Dismiss notification">${icon('close', 14)}</button>
  `;

  toastEl.querySelector('.toast-close').addEventListener('click', () => toastEl.remove());
  toastRoot.appendChild(toastEl);

  window.setTimeout(() => {
    if (toastEl.isConnected) toastEl.remove();
  }, duration);
}

/* ==========================================================================
   Navigation & Auth Helpers
   ========================================================================== */

function navigateTo(route) {
  const targetHash = route === 'staff' ? '#staff' : '';
  if (window.location.hash !== targetHash) {
    if (targetHash) {
      window.location.hash = targetHash;
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }
  state.route = route;
  state.isCartOpen = false;
  state.activeDishModalId = null;

  if (route === 'staff' && state.staffSession) {
    setApiUserRole(state.staffSession.role);
  } else {
    setApiUserRole('student');
  }
  renderApp();
}

/* ==========================================================================
   Slot Availability & Auto-Suggestion Helpers
   ========================================================================== */

function isSlotFullForMode(slot, mode) {
  if (!slot) return true;
  if (slot.isFoodFull) return true;
  if (mode === 'dine-in' && slot.isTablesFull) return true;
  return false;
}

function findNextOpenSlot(slots, preferredId, mode) {
  const idx = slots.findIndex((s) => s.id === preferredId);
  const ordered =
    idx >= 0 ? [...slots.slice(idx + 1), ...slots.slice(0, idx)] : [...slots];
  return ordered.find((s) => !isSlotFullForMode(s, mode)) || null;
}

function ensureValidSelectedSlot() {
  const current = state.slots.find((s) => s.id === state.selectedSlotId);
  if (current && !isSlotFullForMode(current, state.orderType)) return;
  const fallback = state.slots.find((s) => !isSlotFullForMode(s, state.orderType));
  if (fallback) state.selectedSlotId = fallback.id;
}

function trySelectSlot(requestedSlotId, mode = state.orderType) {
  const target = state.slots.find((s) => s.id === requestedSlotId);
  if (!target) return { selected: state.selectedSlotId, redirected: false };

  if (!isSlotFullForMode(target, mode)) {
    state.selectedSlotId = target.id;
    state.slotSuggestion = null;
    triggerSlotFlash(target.id);
    return { selected: target.id, redirected: false };
  }

  state.shakeSlotId = target.id;
  window.setTimeout(() => {
    state.shakeSlotId = null;
    renderApp();
  }, 480);

  const nextOpen = findNextOpenSlot(state.slots, target.id, mode);
  if (nextOpen) {
    state.selectedSlotId = nextOpen.id;
    state.slotSuggestion = {
      fullSlotId: target.id,
      suggestedSlotId: nextOpen.id,
      message: `${target.id} is full (10/10). Automatically selected next available slot: ${nextOpen.id}.`
    };
    triggerSlotFlash(nextOpen.id);
    showToast(
      `Slot ${target.id} is Full (10/10)`,
      `Suggested & highlighted next open slot: ${nextOpen.id}.`,
      'warning'
    );
    return { selected: nextOpen.id, redirected: true, suggestedSlotId: nextOpen.id };
  }

  state.slotSuggestion = {
    fullSlotId: target.id,
    suggestedSlotId: null,
    message: `All slots are currently full for ${mode}. Try switching to Takeaway or Reset Demo.`
  };
  showToast('All Slots Full', 'Try switching mode or resetting demo.', 'error');
  return { selected: state.selectedSlotId, redirected: true, suggestedSlotId: null };
}

function triggerSlotFlash(slotId) {
  state.flashSlotId = slotId;
  window.setTimeout(() => {
    if (state.flashSlotId === slotId) {
      state.flashSlotId = null;
      renderApp();
    }
  }, 950);
}

/* ==========================================================================
   Cart & Ordering Operations
   ========================================================================== */

function addToCart(itemId, qty = 1) {
  const dish = state.menu.find((m) => m.id === itemId);
  if (!dish || !dish.inStock) {
    showToast('Unavailable', 'This dish is currently out of stock.', 'warning');
    return;
  }
  const existing = state.cart.find((c) => c.itemId === itemId);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({ itemId, qty });
  }
}

function updateCartQty(itemId, delta) {
  const idx = state.cart.findIndex((c) => c.itemId === itemId);
  if (idx === -1) return;
  state.cart[idx].qty += delta;
  if (state.cart[idx].qty <= 0) {
    state.cart.splice(idx, 1);
  }
}

function handleNlpSubmit() {
  const query = state.nlpQuery.trim();
  if (!query) {
    showToast('Type an order first', 'Example: 2 masala dosa and 1 cold coffee for 12:30 dine-in', 'warning');
    return;
  }

  const parsed = parsePlainLanguageOrder(
    query,
    state.menu,
    state.slots.map((s) => s.id)
  );

  if (parsed.items.length === 0 && parsed.outOfStockItems.length === 0) {
    state.nlpFeedback = {
      hasWarning: true,
      message: 'Could not recognize a dish name. Try "2 masala dosa and 1 cold coffee for 12:30 dine-in".'
    };
    renderApp();
    return;
  }

  if (parsed.orderType) {
    state.orderType = parsed.orderType;
  }

  for (const entry of parsed.items) {
    addToCart(entry.item.id, entry.quantity);
  }

  let slotNote = `Slot ${state.selectedSlotId}`;
  if (parsed.slotId) {
    const slotOutcome = trySelectSlot(parsed.slotId, state.orderType);
    if (slotOutcome.redirected && slotOutcome.suggestedSlotId) {
      slotNote = `${parsed.slotId} full → auto-selected ${slotOutcome.suggestedSlotId}`;
    } else {
      slotNote = `Slot ${slotOutcome.selected}`;
    }
  } else {
    ensureValidSelectedSlot();
    triggerSlotFlash(state.selectedSlotId);
  }

  const addedSummary = parsed.items.map((e) => `${e.quantity}× ${e.item.name}`).join(', ');
  const oosSummary = parsed.outOfStockItems.map((e) => e.item.name).join(', ');
  const modeLabel = state.orderType === 'dine-in' ? 'Dine-In' : 'Takeaway';

  if (parsed.items.length > 0 && !oosSummary) {
    state.nlpFeedback = {
      hasWarning: false,
      message: `Added ${addedSummary} • ${slotNote} (${modeLabel}).`
    };
    showToast('Smart Order Added', `${addedSummary} added for ${slotNote} (${modeLabel}).`, 'success');
  } else if (parsed.items.length > 0 && oosSummary) {
    state.nlpFeedback = {
      hasWarning: true,
      message: `Added ${addedSummary} (${slotNote}). Skipped out-of-stock: ${oosSummary}.`
    };
    showToast('Partial Smart Order Added', `Out of stock: ${oosSummary}`, 'warning');
  } else {
    state.nlpFeedback = {
      hasWarning: true,
      message: `${oosSummary} is currently out of stock. Try another dish!`
    };
    showToast('Item Out of Stock', `${oosSummary} is currently paused.`, 'error');
  }

  renderApp();
}

/* ==========================================================================
   Data Sync & Master Render
   ========================================================================== */

async function syncAllData(syncMeta = {}) {
  const [menu, slots, orders] = await Promise.all([
    apiClient.getMenu('all'),
    apiClient.getSlots(),
    apiClient.getOrders()
  ]);

  const hadPriorOrders = state.orders.length > 0;
  const prevReadyIds = new Set(
    state.orders
      .filter((o) => o.studentId === CURRENT_STUDENT_ID && o.status === 'READY')
      .map((o) => o.id)
  );

  state.menu = menu;
  state.slots = slots;
  state.orders = orders;

  const newlyReady = orders.find(
    (o) =>
      o.studentId === CURRENT_STUDENT_ID &&
      o.status === 'READY' &&
      !prevReadyIds.has(o.id)
  );

  if (newlyReady && hadPriorOrders) {
    state.dismissedReadyIds = state.dismissedReadyIds.filter((id) => id !== newlyReady.id);
    if (syncMeta.type === 'CROSS_TAB_SYNC' && state.route === 'student') {
      showToast(
        `Order Ready! • #${newlyReady.token}`,
        `Ready for pickup at ${newlyReady.slotId}!`,
        'success',
        5500
      );
    }
  }

  ensureValidSelectedSlot();
  renderApp();
}

function renderApp() {
  let viewHtml = '';

  if (state.route === 'staff') {
    if (!state.staffSession) {
      viewHtml = renderStaffLoginView(state);
    } else if (state.staffSession.role === 'manager') {
      viewHtml = renderManagerView(state);
    } else {
      viewHtml = renderKitchenView(state);
    }
  } else {
    viewHtml = renderStudentView(state);
  }

  appRoot.innerHTML = `
    ${renderHeader(state)}
    ${renderOrderReadyBanner(state)}
    <main class="main-container">
      ${viewHtml}
    </main>
    ${state.route === 'student' ? renderCartDrawer(state) : ''}
    ${state.route === 'student' ? renderDishDetailModal(state) : ''}
  `;
}

/* ==========================================================================
   Global Event Delegation
   ========================================================================== */

document.addEventListener('click', async (event) => {
  const stopNode = event.target.closest('[data-stop-propagation="true"]');
  const actionEl = event.target.closest('[data-action]');

  if (stopNode && !actionEl) return;
  if (!actionEl) return;

  const action = actionEl.dataset.action;

  switch (action) {
    case 'open-staff-portal': {
      event.preventDefault();
      navigateTo('staff');
      break;
    }

    case 'go-student-view': {
      navigateTo('student');
      break;
    }

    case 'pick-login-role': {
      state.staffLoginRole = actionEl.dataset.role === 'manager' ? 'manager' : 'kitchen';
      state.staffLoginError = null;
      renderApp();
      break;
    }

    case 'fill-demo-pin': {
      state.staffLoginPin = '1234';
      state.staffLoginError = null;
      renderApp();
      document.getElementById('staff-pin-input')?.focus();
      break;
    }

    case 'switch-staff-role': {
      if (!state.staffSession) break;
      const nextStaffRole = actionEl.dataset.role === 'manager' ? 'manager' : 'kitchen';
      if (nextStaffRole !== state.staffSession.role) {
        const updatedSession = { ...state.staffSession, role: nextStaffRole };
        setStaffSession(updatedSession);
        state.staffSession = updatedSession;
        setApiUserRole(nextStaffRole);
        renderApp();
      }
      break;
    }

    case 'staff-logout': {
      clearStaffSession();
      state.staffSession = null;
      state.staffLoginPin = '';
      state.staffLoginError = null;
      navigateTo('student');
      showToast('Signed Out', 'Returned to Student Ordering Page.', 'info');
      break;
    }

    case 'demo-fill-1230': {
      await apiClient.fillSlotForDemo('12:30', 9);
      state.kdsBatchSlot = '12:30';
      state.selectedSlotId = '12:30';
      state.slotSuggestion = null;
      await syncAllData();
      triggerSlotFlash('12:30');
      showToast(
        'Demo Mode: 12:30 Filled to 9/10',
        'Slot 12:30 is now Amber (Filling Fast). Place 1 order to hit 10/10 & lock!',
        'warning',
        5000
      );
      break;
    }

    case 'reset-demo': {
      await apiClient.resetDemoState();
      state.cart = [];
      state.nlpQuery = '';
      state.nlpFeedback = null;
      state.slotSuggestion = null;
      state.dismissedReadyIds = [];
      state.kdsBatchSlot = 'all';
      state.selectedSlotId = '12:30';
      await syncAllData();
      showToast('Demo Dataset Reset', 'Restored clean initial campus canteen data.', 'info');
      break;
    }

    case 'open-cart': {
      state.isCartOpen = true;
      renderApp();
      break;
    }

    case 'close-cart': {
      state.isCartOpen = false;
      renderApp();
      break;
    }

    case 'use-nlp-example': {
      state.nlpQuery = actionEl.dataset.example || '';
      handleNlpSubmit();
      break;
    }

    case 'clear-nlp': {
      state.nlpQuery = '';
      state.nlpFeedback = null;
      renderApp();
      document.getElementById('nlp-order-input')?.focus();
      break;
    }

    case 'set-menu-filter': {
      state.menuFilter = actionEl.dataset.filter || 'all';
      renderApp();
      break;
    }

    case 'add-to-cart': {
      addToCart(actionEl.dataset.itemId, 1);
      renderApp();
      break;
    }

    case 'inc-cart': {
      updateCartQty(actionEl.dataset.itemId, 1);
      renderApp();
      break;
    }

    case 'dec-cart': {
      updateCartQty(actionEl.dataset.itemId, -1);
      renderApp();
      break;
    }

    case 'open-dish-modal': {
      state.activeDishModalId = actionEl.dataset.itemId || null;
      renderApp();
      break;
    }

    case 'close-dish-modal': {
      state.activeDishModalId = null;
      renderApp();
      break;
    }

    case 'set-order-type': {
      const nextMode = actionEl.dataset.orderType;
      if (nextMode && nextMode !== state.orderType) {
        state.orderType = nextMode;
        state.slotSuggestion = null;
        ensureValidSelectedSlot();
        renderApp();
      }
      break;
    }

    case 'select-slot': {
      const slotId = actionEl.dataset.slotId;
      trySelectSlot(slotId, state.orderType);
      renderApp();
      break;
    }

    case 'place-order': {
      if (state.isSubmittingOrder || state.cart.length === 0) break;
      state.isSubmittingOrder = true;
      renderApp();

      try {
        const order = await apiClient.createOrder({
          studentId: CURRENT_STUDENT_ID,
          studentName: state.studentName.trim() || CURRENT_STUDENT_NAME,
          slotId: state.selectedSlotId,
          orderType: state.orderType,
          items: state.cart.map((c) => ({ itemId: c.itemId, qty: c.qty }))
        });

        state.cart = [];
        state.isCartOpen = false;
        state.nlpFeedback = null;
        state.slotSuggestion = null;
        await syncAllData();

        showToast(
          `Order Confirmed • #${order.token}`,
          `Booked ${order.slotId} (${
            order.orderType === 'dine-in' ? `Table #${order.tableNumber}` : 'Takeaway'
          }).`,
          'success',
          4600
        );

        document.getElementById('live-order-tracker')?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      } catch (err) {
        if (err.code === 'SLOT_FULL' || err.code === 'TABLES_FULL') {
          trySelectSlot(state.selectedSlotId, state.orderType);
        } else {
          showToast('Order Failed', err.message, 'error');
        }
      } finally {
        state.isSubmittingOrder = false;
        renderApp();
      }
      break;
    }

    case 'scroll-to-tracker': {
      document.getElementById('live-order-tracker')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      break;
    }

    case 'dismiss-ready-banner': {
      const id = actionEl.dataset.orderId;
      if (id && !state.dismissedReadyIds.includes(id)) {
        state.dismissedReadyIds.push(id);
        renderApp();
      }
      break;
    }

    case 'collect-order': {
      const orderId = actionEl.dataset.orderId;
      await apiClient.updateOrderStatus(orderId, 'COLLECTED');
      await syncAllData();
      showToast('Order Picked Up', 'Enjoy your meal!', 'success');
      break;
    }

    case 'set-kds-batch-slot': {
      state.kdsBatchSlot = actionEl.dataset.slotId || 'all';
      renderApp();
      break;
    }

    case 'update-order-status': {
      const orderId = actionEl.dataset.orderId;
      const nextStatus = actionEl.dataset.status;
      const updated = await apiClient.updateOrderStatus(orderId, nextStatus);
      if (nextStatus === 'READY' && updated.studentId === CURRENT_STUDENT_ID) {
        state.dismissedReadyIds = state.dismissedReadyIds.filter((id) => id !== updated.id);
      }
      await syncAllData();
      showToast(
        `Ticket #${updated.token} → ${nextStatus}`,
        nextStatus === 'READY'
          ? 'Student Live Status & Order Ready alert updated!'
          : nextStatus === 'COLLECTED'
          ? 'Marked Picked Up.'
          : 'Kitchen ticket updated.',
        nextStatus === 'READY' || nextStatus === 'COLLECTED' ? 'success' : 'info'
      );
      break;
    }

    case 'toggle-stock': {
      const itemId = actionEl.dataset.itemId;
      const nextVal = actionEl.dataset.nextVal === 'true';
      const updated = await apiClient.toggleItemStock(itemId, { inStock: nextVal });
      await syncAllData();
      showToast(
        updated.name,
        updated.inStock ? 'Marked In Stock on Student Menu' : 'Marked Out of Stock (Overlay active)',
        updated.inStock ? 'success' : 'warning'
      );
      break;
    }

    case 'toggle-new-flag': {
      const itemId = actionEl.dataset.itemId;
      const nextVal = actionEl.dataset.nextVal === 'true';
      const updated = await apiClient.toggleItemStock(itemId, { isNew: nextVal });
      await syncAllData();
      showToast(
        updated.name,
        updated.isNew ? 'Featured with NEW ribbon & New Updates tab' : 'Removed NEW ribbon',
        'info'
      );
      break;
    }

    default:
      break;
  }
});

document.addEventListener('input', (event) => {
  const action = event.target.dataset.action;

  if (action === 'input-nlp') {
    state.nlpQuery = event.target.value;
    const clearBtn = document.getElementById('nlp-clear-btn');
    if (clearBtn) {
      clearBtn.hidden = !state.nlpQuery;
    }
    const previewMount = document.getElementById('nlp-preview-mount');
    if (previewMount) {
      previewMount.innerHTML = renderNlpLivePreview(state.nlpQuery, state.menu, state.slots);
    }
  } else if (action === 'update-student-name') {
    state.studentName = event.target.value;
  } else if (action === 'input-staff-pin') {
    state.staffLoginPin = event.target.value;
    state.staffLoginError = null;
  }
});

document.addEventListener('change', (event) => {
  const action = event.target.dataset.action;

  if (action === 'change-order-type-select') {
    state.orderType = event.target.value;
    ensureValidSelectedSlot();
    renderApp();
  } else if (action === 'change-slot-select') {
    trySelectSlot(event.target.value, state.orderType);
    renderApp();
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  const action = form.dataset.action;
  if (!action) return;
  event.preventDefault();

  if (action === 'submit-nlp') {
    handleNlpSubmit();
  } else if (action === 'submit-staff-login') {
    const fd = new FormData(form);
    const pin = String(fd.get('pin') || state.staffLoginPin || '').trim();

    try {
      const session = await apiClient.authenticateStaff({
        pin,
        role: state.staffLoginRole
      });
      state.staffSession = session;
      state.staffLoginPin = '';
      state.staffLoginError = null;
      renderApp();
      showToast(
        'Staff Portal Unlocked',
        `Signed in as ${session.role === 'manager' ? 'Canteen Manager' : 'Kitchen Staff (KDS)'}.`,
        'success'
      );
    } catch (err) {
      state.staffLoginError = err.message;
      renderApp();
      document.getElementById('staff-pin-input')?.focus();
    }
  } else if (action === 'publish-menu-item') {
    const fd = new FormData(form);
    const created = await apiClient.addMenuItem({
      name: fd.get('name'),
      price: Number(fd.get('price')),
      isVeg: fd.get('isVeg') === 'true',
      calories: Number(fd.get('calories')),
      protein: Number(fd.get('protein')) || 12,
      isNew: fd.get('isNew') === 'on'
    });

    await syncAllData();
    showToast(
      `Published: ${created.name}`,
      'Now live in Student Menu & Plain-Language Order Parser!',
      'success'
    );
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    if (state.activeDishModalId) {
      state.activeDishModalId = null;
      renderApp();
    } else if (state.isCartOpen) {
      state.isCartOpen = false;
      renderApp();
    }
  }
});

window.addEventListener('hashchange', () => {
  state.route = resolveRouteFromHash();
  if (state.route === 'staff' && state.staffSession) {
    setApiUserRole(state.staffSession.role);
  } else {
    setApiUserRole('student');
  }
  renderApp();
});

/* ==========================================================================
   Bootstrap Application
   ========================================================================== */

(async function init() {
  if (state.route === 'staff' && state.staffSession) {
    setApiUserRole(state.staffSession.role);
  } else {
    setApiUserRole('student');
  }
  await syncAllData();
  apiClient.subscribeToUpdates((evt) => {
    syncAllData(evt);
  });
})();
