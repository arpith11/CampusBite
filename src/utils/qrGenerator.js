/**
 * Deterministic 21x21 QR-style SVG matrix generator for 4-digit pickup tokens.
 * Zero external network calls required during live demos.
 */

function hashSeed(input) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function isFinderZone(row, col, size) {
  const topLeft = row < 7 && col < 7;
  const topRight = row < 7 && col >= size - 7;
  const bottomLeft = row >= size - 7 && col < 7;
  return topLeft || topRight || bottomLeft;
}

function drawFinder(ox, oy) {
  return `
    <rect x="${ox}" y="${oy}" width="7" height="7" rx="1" fill="#0F172A"/>
    <rect x="${ox + 1}" y="${oy + 1}" width="5" height="5" rx="0.6" fill="#FFFFFF"/>
    <rect x="${ox + 2}" y="${oy + 2}" width="3" height="3" rx="0.4" fill="#0F172A"/>
  `;
}

export function renderTokenQR(tokenText = '0000') {
  const size = 21;
  let seed = hashSeed(String(tokenText));
  const cells = [];

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      if (isFinderZone(r, c, size)) continue;
      // Timing pattern row/col 6
      if (r === 6 || c === 6) {
        if ((r + c) % 2 === 0) {
          cells.push(`<rect x="${c}" y="${r}" width="0.92" height="0.92" rx="0.15" fill="#0F172A"/>`);
        }
        continue;
      }
      // Deterministic PRNG bit for data modules
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      if ((seed & 0x1) === 1 || (seed & 0x4) === 4) {
        cells.push(`<rect x="${c}" y="${r}" width="0.92" height="0.92" rx="0.18" fill="#0F172A"/>`);
      }
    }
  }

  return `
    <svg viewBox="-1 -1 ${size + 2} ${size + 2}" width="100%" height="100%" role="img" aria-label="Pickup QR for token ${tokenText}">
      <rect x="-1" y="-1" width="${size + 2}" height="${size + 2}" fill="#FFFFFF"/>
      ${drawFinder(0, 0)}
      ${drawFinder(size - 7, 0)}
      ${drawFinder(0, size - 7)}
      ${cells.join('')}
    </svg>
  `;
}

