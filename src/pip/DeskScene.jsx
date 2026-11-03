import React, { useMemo } from "react";
import { renderCompanionAvatarSvg } from "./avatarMarkup.js";
import "./pip.css";

// The five things Pip does at his desk, and the BPP face each one wears.
export const PIP_STATES = ["settling", "reading", "writing", "engaging", "break"];

const FACE = {
  settling: "idle",
  reading: "idle",
  writing: "thinking",
  engaging: "happy",
  break: "idle"
};

const STATE_LABEL = {
  settling: "settling in",
  reading: "reading",
  writing: "writing",
  engaging: "turning to you",
  break: "taking a break"
};

// The shared avatar is rendered as its own markup string. The scene is the one
// labelled graphic, so the nested copy is hidden from assistive tech.
const avatarFor = (face) =>
  renderCompanionAvatarSvg(face, 120).replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"');

export function DeskScene({ state = "reading", theme = "day" }) {
  const safeState = PIP_STATES.includes(state) ? state : "reading";
  const avatar = useMemo(() => avatarFor(FACE[safeState]), [safeState]);

  return (
    <svg
      className={`pip-scene pip-scene--${safeState} pip-scene--${theme}`}
      data-pip-state={safeState}
      data-theme={theme}
      viewBox="0 70 400 210"
      role="img"
      aria-label={`Pip at his desk, ${STATE_LABEL[safeState]}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="pip-ground-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pip-lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFC875" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#FFB45A" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FFB45A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Soft ground shadow under the desk and its props. */}
      <ellipse className="ds-ground-shadow" cx="200" cy="268" rx="190" ry="14" fill="url(#pip-ground-shadow)" />

      {/* Lamp glow sits behind everything; it only shows in the evening. */}
      <circle className="ds-lamp-glow" cx="96" cy="140" r="104" fill="url(#pip-lamp-glow)" />

      <g className="ds-pip">
        <g transform="translate(140 92)" dangerouslySetInnerHTML={{ __html: avatar }} />
      </g>

      {/* Desk */}
      <g className="ds-desk">
        <rect className="ds-desk-leg" x="40" y="250" width="14" height="18" rx="3" />
        <rect className="ds-desk-leg" x="346" y="250" width="14" height="18" rx="3" />
        <rect className="ds-desk-front" x="26" y="210" width="348" height="44" rx="6" />
        <rect className="ds-desk-top" x="14" y="196" width="372" height="16" rx="7" />
        <rect className="ds-desk-edge" x="20" y="206" width="360" height="3" rx="1.5" />
      </g>

      {/* Contact shadows for each prop. */}
      <ellipse className="ds-contact" cx="200" cy="208" rx="62" ry="4" />
      <ellipse className="ds-contact" cx="64" cy="204" rx="26" ry="3.5" />
      <ellipse className="ds-contact" cx="306" cy="204" rx="22" ry="3.5" />

      {/* Lamp */}
      <g className="ds-lamp">
        <ellipse className="ds-lamp-base" cx="64" cy="201" rx="22" ry="5" />
        <path className="ds-lamp-arm" d="M64 200 L58 154 L92 124" fill="none" />
        <path className="ds-lamp-shade" d="M80 112 L118 122 L106 146 L72 134 Z" />
        <circle className="ds-lamp-bulb" cx="95" cy="138" r="6" />
      </g>

      {/* Book, with a page that turns every ~20 s while Pip reads. */}
      <g className="ds-book">
        <path className="ds-page ds-page-left" d="M146 204 L200 208 L200 194 L150 190 Z" />
        <path className="ds-page ds-page-right" d="M200 208 L254 204 L250 190 L200 194 Z" />
        <path className="ds-page-lines" d="M156 196 L194 199 M156 201 L194 204 M206 199 L244 196 M206 204 L244 201" />
        <path className="ds-turn-page" d="M200 208 L254 204 L250 190 L200 194 Z" />
        <path className="ds-spine" d="M200 194 L200 208" />
      </g>

      {/* Pen resting on the desk; in `writing` Pip's arm holds it on the page. */}
      <path className="ds-pen-rest" d="M262 203 L284 199" />
      <g className="ds-writer">
        <path className="ds-arm" d="M246 150 Q268 178 232 194" fill="none" />
        <path className="ds-pen" d="M232 194 L222 203" />
      </g>

      {/* Mug and steam */}
      <g className="ds-mug">
        <path className="ds-steam ds-steam-1" d="M300 170 Q296 162 301 156" fill="none" />
        <path className="ds-steam ds-steam-2" d="M312 170 Q308 160 314 154" fill="none" />
        <rect className="ds-mug-body" x="290" y="174" width="32" height="28" rx="6" />
        <path className="ds-mug-handle" d="M322 180 Q336 182 322 194" fill="none" />
        <rect className="ds-mug-rim" x="290" y="174" width="32" height="5" rx="2.5" />
      </g>

      {/* Light tint that follows day or evening. */}
      <rect className="ds-tint" x="0" y="70" width="400" height="210" />
    </svg>
  );
}

// Pip's face on its own (used beside his speech). Decorative: the message text carries the meaning.
export function PipFace({ state = "reading" }) {
  const face = FACE[state] ?? "idle";
  return <span className="pip-face" dangerouslySetInnerHTML={{ __html: renderCompanionAvatarSvg(face, 36).replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"') }} />;
}
