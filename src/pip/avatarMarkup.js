/**
 * Copied unchanged (types removed only) from:
 *   repo:   big-picture-planner
 *   path:   src/components/Companion/avatarMarkup.ts
 *   commit: 814c68e8eb4526a65e91617166daf43a77925737 (814c68e8)
 * One shared Pip design across both products (founder ruling, 3 Nov 2026).
 * Do not redesign: same body, same purple #7C5CFC, same four faces.
 */

/**
 * Pip's avatar — pure SVG-string builder (Packet 17.1, v1).
 *
 * A screen-head robot, brand purple (`#7C5CFC`, BPP's `accent-primary`). The
 * screen is the expression surface; every state below is a different face
 * drawn inside the same body. Kept as a pure function (no JSX) for two
 * reasons: it is the single source of truth CompanionAvatar.tsx renders via
 * `dangerouslySetInnerHTML` (a static, hardcoded template — never user
 * input, so that's safe here), and it can be unit-tested with plain
 * `node --test` the same way this repo's other pure modules are
 * (scripts/companionAvatar.test.mjs) — the repo has no jsdom/RTL harness for
 * real React rendering, so a JSX component could not be exercised this way.
 *
 * Animation is CSS only (keyframes in src/index.css), never a library —
 * this module only decides WHICH elements exist per state; how they move is
 * entirely in CSS classnames.
 */

/** Every state this module knows how to draw — the avatar test iterates this list. */
export const COMPANION_AVATAR_STATES = ['idle', 'thinking', 'happy', 'empty'];

/** Human-readable label per state, used for the accessible name and nowhere else. */
export const COMPANION_AVATAR_STATE_LABEL = {
  idle: 'idle',
  thinking: 'thinking',
  happy: 'found something good',
  empty: 'nothing fits right now',
};

/** BPP's brand purple (tailwind.config.js `accent.primary`) — the one colour this avatar draws in. */
export const COMPANION_PURPLE = '#7C5CFC';
const SCREEN_BG = '#F3EEFF';
const MUTED_LINE = '#B9ACF6';

const faceMarkup = (state) => {
  switch (state) {
    case 'thinking':
      return `<g class="companion-face companion-face-thinking">
        <circle class="companion-dot companion-dot-1" cx="46" cy="53" r="4.5" fill="${COMPANION_PURPLE}" />
        <circle class="companion-dot companion-dot-2" cx="60" cy="53" r="4.5" fill="${COMPANION_PURPLE}" />
        <circle class="companion-dot companion-dot-3" cx="74" cy="53" r="4.5" fill="${COMPANION_PURPLE}" />
      </g>`;
    case 'happy':
      return `<g class="companion-face companion-face-happy">
        <path d="M40 50 Q46 42 52 50" stroke="${COMPANION_PURPLE}" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M68 50 Q74 42 80 50" stroke="${COMPANION_PURPLE}" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M44 61 Q60 75 76 61" stroke="${COMPANION_PURPLE}" stroke-width="4" fill="none" stroke-linecap="round" />
      </g>`;
    case 'empty':
      return `<g class="companion-face companion-face-empty">
        <line x1="42" y1="53" x2="50" y2="53" stroke="${MUTED_LINE}" stroke-width="4" stroke-linecap="round" />
        <line x1="70" y1="53" x2="78" y2="53" stroke="${MUTED_LINE}" stroke-width="4" stroke-linecap="round" />
        <line x1="48" y1="66" x2="72" y2="66" stroke="${MUTED_LINE}" stroke-width="4" stroke-linecap="round" />
      </g>`;
    case 'idle':
    default:
      return `<g class="companion-face companion-face-idle">
        <circle class="companion-eye companion-eye-left" cx="46" cy="52" r="5" fill="${COMPANION_PURPLE}" />
        <circle class="companion-eye companion-eye-right" cx="74" cy="52" r="5" fill="${COMPANION_PURPLE}" />
        <path d="M48 66 Q60 70 72 66" stroke="${COMPANION_PURPLE}" stroke-width="3.5" fill="none" stroke-linecap="round" />
      </g>`;
  }
};

/**
 * Render Pip at a given expression state as a self-contained SVG markup
 * string. `size` sets both width and height (viewBox stays fixed at
 * 0 0 120 120 so the drawing never distorts).
 */
export const renderCompanionAvatarSvg = (state, size = 72) => `<svg viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="Pip the planning companion — ${COMPANION_AVATAR_STATE_LABEL[state]}" class="companion-avatar companion-avatar--${state}" xmlns="http://www.w3.org/2000/svg">
  <line x1="60" y1="10" x2="60" y2="22" stroke="${COMPANION_PURPLE}" stroke-width="3" stroke-linecap="round" />
  <circle class="companion-antenna-tip" cx="60" cy="8" r="4.5" fill="${COMPANION_PURPLE}" />
  <rect x="6" y="72" width="14" height="10" rx="5" fill="${COMPANION_PURPLE}" />
  <rect x="100" y="72" width="14" height="10" rx="5" fill="${COMPANION_PURPLE}" />
  <rect x="18" y="60" width="84" height="46" rx="18" fill="${COMPANION_PURPLE}" />
  <rect x="14" y="20" width="92" height="66" rx="24" fill="${COMPANION_PURPLE}" />
  <rect x="24" y="30" width="72" height="46" rx="16" fill="${SCREEN_BG}" class="companion-screen" />
  ${faceMarkup(state)}
</svg>`;
