import { icon } from '../utils/icons.js';
import { escapeHtml } from '../utils/format.js';

export function renderStaffLoginView(state) {
  const { staffLoginRole, staffLoginPin, staffLoginError } = state;

  return `
    <div class="staff-login-wrap view-enter">
      <section class="staff-login-card" aria-label="Staff Portal Authentication">
        <div class="staff-login-icon">
          ${icon('lock', 24)}
        </div>

        <h2>Staff Backend Portal</h2>
        <p class="staff-login-sub">
          Protected access for Kitchen Display (KDS) &amp; Canteen Manager controls.
        </p>

        <form class="staff-login-form" data-action="submit-staff-login">
          <div class="form-field">
            <label>Select Staff Role</label>
            <div class="staff-role-pick">
              <button
                type="button"
                class="staff-pick-btn ${staffLoginRole === 'kitchen' ? 'active' : ''}"
                data-action="pick-login-role"
                data-role="kitchen"
                aria-pressed="${staffLoginRole === 'kitchen'}"
              >
                ${icon('chef', 16)}
                <span>Kitchen Staff</span>
              </button>

              <button
                type="button"
                class="staff-pick-btn ${staffLoginRole === 'manager' ? 'active' : ''}"
                data-action="pick-login-role"
                data-role="manager"
                aria-pressed="${staffLoginRole === 'manager'}"
              >
                ${icon('sliders', 16)}
                <span>Canteen Manager</span>
              </button>
            </div>
          </div>

          <div class="form-field">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <label for="staff-pin-input">Staff PIN</label>
              <button
                type="button"
                class="demo-pin-hint-btn"
                data-action="fill-demo-pin"
              >
                Demo PIN: <strong>1234</strong> (Click to fill)
              </button>
            </div>
            <input
              id="staff-pin-input"
              name="pin"
              type="password"
              inputmode="numeric"
              maxlength="6"
              class="form-input staff-pin-input"
              value="${escapeHtml(staffLoginPin)}"
              data-action="input-staff-pin"
              placeholder="Enter PIN (1234)"
              autocomplete="off"
              required
            />
          </div>

          ${
            staffLoginError
              ? `<div class="staff-login-error" role="alert">${icon('alert', 15)} <span>${escapeHtml(staffLoginError)}</span></div>`
              : ''
          }

          <button type="submit" class="btn-primary-full">
            Unlock ${staffLoginRole === 'manager' ? 'Manager' : 'Kitchen KDS'} Dashboard
          </button>
        </form>

        <button
          type="button"
          class="staff-back-link"
          data-action="go-student-view"
        >
          ${icon('arrowLeft', 14)}
          <span>Return to Public Student Page</span>
        </button>
      </section>
    </div>
  `;
}

