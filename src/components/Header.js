import { icon } from '../utils/icons.js';
import { formatRupees } from '../utils/format.js';

export function renderHeader(state) {
  const { route, staffSession, cart, orders, menu } = state;
  const cartQty = cart.reduce((sum, line) => sum + line.qty, 0);
  const cartTotal = cart.reduce((sum, line) => {
    const item = menu.find((m) => m.id === line.itemId);
    return sum + (item ? item.price * line.qty : 0);
  }, 0);

  const pendingKitchenCount = orders.filter(
    (o) => o.status === 'PLACED' || o.status === 'PREPARING'
  ).length;

  // Protected Staff Backend Portal Header (#staff)
  if (route === 'staff') {
    const staffRole = staffSession?.role;

    return `
      <header class="app-header">
        <div class="header-inner">
          <div class="brand-group">
            <div class="brand-logo">${icon('utensils', 18)}</div>
            <div class="brand-text">
              <h1>CampusBite</h1>
              <span class="staff-env-pill">
                ${icon('shield', 12)}
                <span>Staff Portal</span>
              </span>
            </div>
          </div>

          ${
            staffSession
              ? `
            <nav class="role-switcher" aria-label="Staff Portal Role Switcher">
              <button
                type="button"
                class="role-btn ${staffRole === 'kitchen' ? 'active' : ''}"
                data-action="switch-staff-role"
                data-role="kitchen"
                aria-pressed="${staffRole === 'kitchen'}"
              >
                <span class="role-icon">${icon('chef', 14)}</span>
                <span>Kitchen Staff (KDS)</span>
                ${pendingKitchenCount > 0 ? `<span class="role-badge">${pendingKitchenCount}</span>` : ''}
              </button>

              <button
                type="button"
                class="role-btn ${staffRole === 'manager' ? 'active' : ''}"
                data-action="switch-staff-role"
                data-role="manager"
                aria-pressed="${staffRole === 'manager'}"
              >
                <span class="role-icon">${icon('sliders', 14)}</span>
                <span>Canteen Manager</span>
              </button>
            </nav>
          `
              : ''
          }

          <div class="header-actions">
            ${
              staffSession
                ? `
              <button
                type="button"
                class="btn-demo"
                data-action="demo-fill-1230"
                title="Fill 12:30 slot to 9/10 for live judge pitch"
              >
                ${icon('bolt', 14)}
                <span>Demo: Fill 12:30 (9/10)</span>
              </button>
              <button
                type="button"
                class="btn-staff-logout"
                data-action="staff-logout"
              >
                ${icon('logout', 14)}
                <span>Logout / Student View</span>
              </button>
            `
                : `
              <button
                type="button"
                class="btn-staff-portal"
                data-action="go-student-view"
              >
                ${icon('arrowLeft', 14)}
                <span>Student View</span>
              </button>
            `
            }
          </div>
        </div>
      </header>
    `;
  }

  // Public Student Ordering Header (No Staff/Manager tabs exposed)
  return `
    <header class="app-header">
      <div class="header-inner">
        <div class="brand-group">
          <div class="brand-logo">${icon('utensils', 18)}</div>
          <div class="brand-text">
            <h1>CampusBite</h1>
            <span class="live-pill">
              <span class="live-dot" aria-hidden="true"></span>
              <span>Live</span>
            </span>
          </div>
        </div>

        <div class="header-actions">
          <button
            type="button"
            class="btn-demo"
            data-action="demo-fill-1230"
            title="Fill 12:30 slot to 9/10 for live judge pitch"
          >
            ${icon('bolt', 14)}
            <span>Demo Mode: Fill 12:30 Slot (9/10)</span>
          </button>

          <button
            type="button"
            class="btn-reset-icon"
            data-action="reset-demo"
            title="Reset demo data"
            aria-label="Reset demo data"
          >
            ${icon('refresh', 15)}
          </button>

          <button
            type="button"
            class="btn-cart-header"
            data-action="open-cart"
            aria-label="Open Cart Drawer"
          >
            ${icon('cart', 15)}
            <span class="cart-pill-count">${cartQty}</span>
            ${cartTotal > 0 ? `<span>${formatRupees(cartTotal)}</span>` : '<span>Tray</span>'}
          </button>

          <a
            href="#staff"
            class="btn-staff-portal"
            data-action="open-staff-portal"
            title="Open protected Kitchen & Manager backend"
          >
            ${icon('lock', 13)}
            <span>Staff Portal</span>
          </a>
        </div>
      </div>
    </header>
  `;
}
