/**
 * Formatting and safe HTML escaping utilities.
 */

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatRupees(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function getSlotStatusColor(count, max = 10) {
  if (count >= max) return 'red';
  if (count >= 8) return 'amber';
  return 'green';
}

export function getSlotStatusLabel(count, max = 10) {
  if (count >= max) return 'Full • Locked';
  const left = max - count;
  if (count >= 8) return `Filling Fast • ${left} left`;
  return `Open • ${left} left`;
}

