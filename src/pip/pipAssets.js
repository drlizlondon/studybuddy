// Approved 3D Pip companion and prop assets (Stage 1 Golden Benchmark, 5 Nov 2026).
// Clean transparent WebP assets with 100% blanked screen surface for live SVG face rendering.
const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

export const PIP_COMPANION_DATA_URI = assetUrl("images/pip/pip-companion.webp");
export const PROP_LAPTOP_DATA_URI = assetUrl("images/pip/prop-laptop.webp");
export const PIP_STANDING_DATA_URI = assetUrl("images/pip/pip-standing.webp");
export const PIP_WORKING_DATA_URI = assetUrl("images/pip/pip-working.webp");
