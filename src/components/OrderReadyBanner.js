import { icon } from '../utils/icons.js';
import { escapeHtml } from '../utils/format.js';
import { CURRENT_STUDENT_ID } from '../data/mockSeed.js';

export function renderOrderReadyBanner(state) {
  // Only show student pickup alert on the public Student Portal
  if (state.route === 'staff') return '';

  const readyOrders = state.orders.filter(
    (o) =>
      o.studentId === CURRENT_STUDENT_ID &&
      o.status === 'READY' &&
      !state.dismissedReadyIds.includes(o.id)
  );

  if (readyOrders.length === 0) return '';

  const order = readyOrders[0];
  const itemSummary = order.items.map((i) => `${i.qty}x ${i.name}`).join(', ');
  const pickupLocation =
    order.orderType === 'dine-in'
      ? `Dine-In • Table #${order.tableNumber || 1}`
      : 'Takeaway Pickup Counter';

  return `
    <div class="ready-banner-wrap" role="status" aria-live="polite">
      <div class="order-ready-banner">
        <div class="ready-banner-left">
          <div class="ready-icon-circle">${icon('bell', 20)}</div>
          <div>
            <div class="ready-banner-title">
              <span>Order Ready!</span>
              <span class="ready-token-pill">#${escapeHtml(order.token)}</span>
              <span>• ${escapeHtml(order.slotId)} (${escapeHtml(pickupLocation)})</span>
            </div>
            <div class="ready-banner-sub">
              ${escapeHtml(itemSummary)} — Show your QR token at the counter.
            </div>
          </div>
        </div>
        <div class="ready-banner-actions">
          <button type="button" class="btn-ready-cta" data-action="scroll-to-tracker">
            View Token &amp; QR
          </button>
          <button
            type="button"
            class="btn-ready-dismiss"
            data-action="dismiss-ready-banner"
            data-order-id="${escapeHtml(order.id)}"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `;
}
