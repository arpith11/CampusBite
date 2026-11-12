/**
 * High-contrast food photography assets with zero-dependency inline SVG fallbacks
 * so cards render cleanly both in full demo and offline fallback mode.
 */

const PHOTO_KEYS = new Set([
  'dosa',
  'coffee',
  'puff',
  'roll',
  'wrap',
  'rice',
  'chole',
  'chai',
  'bowl',
  'samosa',
  'fries',
  'custom'
]);

function escAttr(str) {
  return String(str ?? 'CampusBite dish')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

export function getDishArt(artKey, isVeg = true, altText = 'CampusBite dish') {
  const artMap = {
    dosa: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="64" r="46" fill="#E2E8F0"/>
        <circle cx="60" cy="62" r="42" fill="#FFFFFF"/>
        <path d="M22 72 L96 42 Q104 54 90 70 L28 84 Q18 80 22 72Z" fill="#D97706"/>
        <path d="M24 71 L94 44 Q98 51 87 63 L28 77 Z" fill="#F59E0B"/>
        <path d="M36 66 L82 49" stroke="#B45309" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 4"/>
        <circle cx="42" cy="40" r="10" fill="#10B981"/>
        <circle cx="42" cy="40" r="7.5" fill="#ECFDF5"/>
        <circle cx="66" cy="36" r="11" fill="#EA580C"/>
        <circle cx="66" cy="36" r="8" fill="#F97316"/>
      </svg>`,

    coffee: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="100" rx="28" ry="6" fill="#CBD5E1" opacity="0.6"/>
        <path d="M68 14 L62 42" stroke="#F97316" stroke-width="5" stroke-linecap="round"/>
        <path d="M40 38 L80 38 L73 96 Q60 101 47 96 Z" fill="#78350F"/>
        <path d="M41 44 L79 44 L75 78 Q60 82 45 78 Z" fill="#B45309"/>
        <path d="M37 38 Q60 22 83 38 Z" fill="#FFFBEB" stroke="#E2E8F0" stroke-width="2"/>
        <rect x="48" y="48" width="10" height="10" rx="2" fill="#FEF3C7" opacity="0.7" transform="rotate(14 53 53)"/>
        <rect x="63" y="54" width="9" height="9" rx="2" fill="#FEF3C7" opacity="0.6" transform="rotate(-12 67 58)"/>
        <path d="M44 66 Q60 72 76 66" stroke="#FDE68A" stroke-width="2" fill="none" opacity="0.5"/>
      </svg>`,

    puff: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="64" r="44" fill="#F1F5F9"/>
        <circle cx="60" cy="62" r="39" fill="#FFFFFF"/>
        <path d="M26 70 Q42 36 86 44 Q98 62 82 82 Q44 90 26 70Z" fill="#D97706"/>
        <path d="M30 66 Q45 40 83 47 Q91 60 79 77 Q45 82 30 66Z" fill="#F59E0B"/>
        <path d="M38 59 Q58 51 75 58" stroke="#FDE68A" stroke-width="3" stroke-linecap="round" fill="none"/>
        <path d="M36 69 Q56 62 76 69" stroke="#B45309" stroke-width="2" stroke-linecap="round" fill="none"/>
        <circle cx="76" cy="40" r="8" fill="#DC2626"/>
        <circle cx="76" cy="40" r="5" fill="#EF4444"/>
      </svg>`,

    roll: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="64" r="44" fill="#E2E8F0"/>
        <circle cx="60" cy="62" r="39" fill="#FFFFFF"/>
        <g transform="rotate(-24 60 62)">
          <rect x="24" y="46" width="72" height="32" rx="14" fill="#FDE68A" stroke="#D97706" stroke-width="2"/>
          <rect x="24" y="46" width="38" height="32" rx="10" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
          <circle cx="78" cy="56" r="5" fill="#10B981"/>
          <circle cx="84" cy="66" r="5" fill="#EA580C"/>
          <circle cx="72" cy="66" r="4" fill="#F59E0B"/>
        </g>
      </svg>`,

    wrap: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="64" r="44" fill="#E2E8F0"/>
        <circle cx="60" cy="62" r="39" fill="#FFFFFF"/>
        <g transform="rotate(-20 60 62)">
          <rect x="22" y="44" width="74" height="34" rx="15" fill="#FDBA74" stroke="#C2410C" stroke-width="2"/>
          <rect x="22" y="44" width="36" height="34" rx="10" fill="#FFF7ED" stroke="#FB923C" stroke-width="1.5"/>
          <circle cx="78" cy="55" r="5.5" fill="#DC2626"/>
          <circle cx="85" cy="65" r="5" fill="#10B981"/>
          <circle cx="71" cy="66" r="4.5" fill="#EA580C"/>
        </g>
      </svg>`,

    rice: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="88" rx="34" ry="8" fill="#CBD5E1"/>
        <path d="M24 58 Q60 32 96 58 Z" fill="#FDE68A"/>
        <path d="M22 58 Q60 70 98 58 L88 86 Q60 94 32 86 Z" fill="#1E293B"/>
        <circle cx="48" cy="48" r="4" fill="#10B981"/>
        <circle cx="66" cy="46" r="5" fill="#F97316"/>
        <circle cx="58" cy="54" r="4" fill="#F59E0B"/>
        <circle cx="76" cy="53" r="3.5" fill="#EF4444"/>
        <line x1="72" y1="22" x2="54" y2="50" stroke="#9A3412" stroke-width="3" stroke-linecap="round"/>
        <line x1="82" y1="24" x2="60" y2="50" stroke="#9A3412" stroke-width="3" stroke-linecap="round"/>
      </svg>`,

    chole: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="64" r="45" fill="#E2E8F0"/>
        <circle cx="60" cy="62" r="41" fill="#FFFFFF"/>
        <ellipse cx="47" cy="66" rx="22" ry="16" fill="#F59E0B" stroke="#B45309" stroke-width="2"/>
        <ellipse cx="47" cy="64" rx="16" ry="10" fill="#FCD34D" opacity="0.6"/>
        <circle cx="78" cy="52" r="15" fill="#9A3412"/>
        <circle cx="78" cy="52" r="12" fill="#C2410C"/>
        <circle cx="75" cy="50" r="2.5" fill="#FDE68A"/>
        <circle cx="82" cy="55" r="2.5" fill="#FDE68A"/>
        <circle cx="76" cy="78" r="8" fill="#10B981"/>
      </svg>`,

    chai: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="94" rx="34" ry="8" fill="#E2E8F0"/>
        <path d="M36 46 L84 46 L77 88 Q60 95 43 88 Z" fill="#C2410C"/>
        <ellipse cx="60" cy="46" rx="24" ry="6" fill="#FDE68A"/>
        <ellipse cx="60" cy="46" rx="20" ry="4.5" fill="#B45309"/>
        <path d="M48 34 Q44 26 50 18" stroke="#94A3B8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M62 32 Q58 24 64 16" stroke="#94A3B8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M74 35 Q70 27 76 19" stroke="#94A3B8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      </svg>`,

    bowl: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="88" rx="34" ry="8" fill="#CBD5E1"/>
        <path d="M22 56 Q60 32 98 56 Z" fill="#FFF7ED"/>
        <circle cx="46" cy="48" r="9" fill="#10B981"/>
        <circle cx="68" cy="46" r="10" fill="#EF4444"/>
        <circle cx="58" cy="54" r="8" fill="#F59E0B"/>
        <path d="M22 56 Q60 70 98 56 L88 86 Q60 94 32 86 Z" fill="#EA580C"/>
      </svg>`,

    samosa: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="64" r="44" fill="#E2E8F0"/>
        <circle cx="60" cy="62" r="40" fill="#FFFFFF"/>
        <polygon points="48,36 74,76 26,76" fill="#D97706" stroke="#B45309" stroke-width="2" stroke-linejoin="round"/>
        <polygon points="74,40 96,76 54,76" fill="#F59E0B" stroke="#B45309" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="42" cy="82" r="8" fill="#10B981"/>
        <circle cx="80" cy="82" r="8" fill="#EF4444"/>
      </svg>`,

    fries: `
      <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="60" cy="96" rx="28" ry="6" fill="#CBD5E1"/>
        <rect x="40" y="26" width="8" height="36" rx="3" fill="#FBBF24" transform="rotate(-8 44 44)"/>
        <rect x="52" y="22" width="8" height="40" rx="3" fill="#F59E0B"/>
        <rect x="64" y="25" width="8" height="38" rx="3" fill="#FBBF24" transform="rotate(7 68 44)"/>
        <rect x="74" y="30" width="8" height="34" rx="3" fill="#F59E0B" transform="rotate(14 78 46)"/>
        <path d="M36 52 L84 52 L77 92 Q60 97 43 92 Z" fill="#EF4444"/>
        <path d="M44 52 Q60 62 76 52" stroke="#FDE047" stroke-width="5" stroke-linecap="round" fill="none"/>
      </svg>`
  };

  // Fallback appetizing platter SVG for offline / broken asset recovery
  const accent = isVeg ? '#34D399' : '#F87171';
  const fill = isVeg ? '#E5A93C' : '#EA580C';
  const svgFallback =
    artMap[artKey] ||
    `
    <svg class="dish-art" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="64" r="45" fill="#1C2620"/>
      <circle cx="60" cy="62" r="41" fill="#243129"/>
      <circle cx="60" cy="62" r="26" fill="${fill}" opacity="0.9"/>
      <circle cx="52" cy="56" r="7" fill="#FDE68A"/>
      <circle cx="68" cy="60" r="8" fill="${accent}"/>
      <circle cx="58" cy="70" r="6" fill="#F5F7F5"/>
    </svg>`;

  const photoKey = PHOTO_KEYS.has(artKey) ? artKey : 'custom';

  return `
    <img
      class="dish-photo"
      src="./assets/dishes/${photoKey}.jpg"
      alt="${escAttr(altText)}"
      loading="lazy"
      onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='grid';"
    />
    <span class="dish-art-fallback">${svgFallback}</span>
  `;
}

