// Approved 3D Pip character assets with mini arms (founder approved 4 Nov 2026).
// Clean transparent WebP assets with 100% blanked screen surface for live SVG face rendering.
const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

export const PIP_STANDING_DATA_URI = assetUrl("images/pip/pip-standing.webp");
export const PIP_WORKING_DATA_URI = assetUrl("images/pip/pip-working.webp");
