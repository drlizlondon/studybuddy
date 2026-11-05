import React, { useMemo } from "react";
import { renderCompanionAvatarSvg } from "./avatarMarkup.js";
import { PIP_STANDING_DATA_URI, PIP_WORKING_DATA_URI } from "./pipAssets.js";
import "./pip.css";

// The five things Pip does at his desk, and the face each one wears.
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

function AnimatedFace({ face, cx, cy, scale }) {
  const isThinking = face === "thinking";
  const isHappy = face === "happy";

  return (
    <g
      className={`pip-live-face pip-live-face--${face}`}
      transform={`translate(${cx} ${cy}) scale(${scale})`}
      aria-hidden="true"
    >
      {/* Soft screen surface glow */}
      <rect
        x="-54"
        y="-48"
        width="108"
        height="92"
        rx="26"
        fill="rgba(243, 238, 255, 0.45)"
        className="pip-screen-sheen"
      />

      {/* Cheeks blush */}
      <ellipse className="pip-blush pip-blush-left" cx="-32" cy="14" rx="7" ry="3.5" fill="#FFA5C7" opacity="0.45" />
      <ellipse className="pip-blush pip-blush-right" cx="32" cy="14" rx="7" ry="3.5" fill="#FFA5C7" opacity="0.45" />

      {/* Eyes */}
      {isHappy ? (
        <g className="pip-eyes-happy">
          <path d="M-29 -6 Q-22 -17 -15 -6" stroke="#24143D" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <path d="M15 -6 Q22 -17 29 -6" stroke="#24143D" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        </g>
      ) : isThinking ? (
        <g className="pip-eyes-thinking">
          <g className="pip-eye pip-eye-left pip-eye--focused">
            <circle cx="-22" cy="-3" r="7.5" fill="#24143D" />
            <circle cx="-20" cy="-4" r="2.2" fill="#FFFFFF" opacity="0.9" />
            <path d="M-28 -13 L-15 -10" stroke="#24143D" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <g className="pip-eye pip-eye-right pip-eye--focused">
            <circle cx="22" cy="-3" r="7.5" fill="#24143D" />
            <circle cx="20" cy="-4" r="2.2" fill="#FFFFFF" opacity="0.9" />
            <path d="M28 -13 L15 -10" stroke="#24143D" strokeWidth="2.4" strokeLinecap="round" />
          </g>
        </g>
      ) : (
        <g className="pip-eyes-idle">
          <g className="pip-eye pip-eye-left">
            <circle cx="-22" cy="-6" r="8" fill="#24143D" />
            <circle cx="-20" cy="-8" r="2.8" fill="#FFFFFF" opacity="0.9" />
          </g>
          <g className="pip-eye pip-eye-right">
            <circle cx="22" cy="-6" r="8" fill="#24143D" />
            <circle cx="24" cy="-8" r="2.8" fill="#FFFFFF" opacity="0.9" />
          </g>
        </g>
      )}

      {/* Mouth */}
      {isHappy ? (
        <path
          className="pip-mouth pip-mouth--happy"
          d="M-13 11 Q0 24 13 11 Q0 16 -13 11"
          fill="#7C5CFC"
          stroke="#24143D"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
      ) : isThinking ? (
        <path
          className="pip-mouth pip-mouth--concentrated"
          d="M-8 15 Q0 14 8 15"
          stroke="#24143D"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <path
          className="pip-mouth pip-mouth--idle"
          d="M-10 14 Q0 19 10 14"
          stroke="#24143D"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

export function DeskScene({ state = "reading", theme = "day" }) {
  const safeState = PIP_STATES.includes(state) ? state : "reading";
  const face = FACE[safeState];
  const isWorking = safeState === "reading" || safeState === "writing";

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

      {/* Soft ground shadow under the desk. */}
      <ellipse className="ds-ground-shadow" cx="200" cy="268" rx="190" ry="14" fill="url(#pip-ground-shadow)" />

      {/* Lamp glow sits behind everything; it only shows in the evening. */}
      <circle className="ds-lamp-glow" cx="96" cy="140" r="104" fill="url(#pip-lamp-glow)" />

      {/* Desk and lamp props */}
      <g className="ds-desk">
        <rect className="ds-desk-leg" x="40" y="250" width="14" height="18" rx="3" />
        <rect className="ds-desk-leg" x="346" y="250" width="14" height="18" rx="3" />
        <rect className="ds-desk-front" x="26" y="210" width="348" height="44" rx="6" />
        <rect className="ds-desk-top" x="14" y="196" width="372" height="16" rx="7" />
        <rect className="ds-desk-edge" x="20" y="206" width="360" height="3" rx="1.5" />
      </g>

      {/* Contact shadows */}
      <ellipse className="ds-contact" cx="200" cy="208" rx="62" ry="4" />
      <ellipse className="ds-contact" cx="64" cy="204" rx="26" ry="3.5" />
      <ellipse className="ds-contact" cx="306" cy="204" rx="22" ry="3.5" />

      {/* Lamp on the desk */}
      <g className="ds-lamp">
        <ellipse className="ds-lamp-base" cx="64" cy="201" rx="22" ry="5" />
        <path className="ds-lamp-arm" d="M64 200 L58 154 L92 124" fill="none" />
        <path className="ds-lamp-shade" d="M80 112 L118 122 L106 146 L72 134 Z" />
        <circle className="ds-lamp-bulb" cx="95" cy="138" r="6" />
      </g>

      {/* Pip 3D character with approved mini arms and responsive animated screen face */}
      <g className="ds-pip pip-character">
        {isWorking ? (
          <g className="pip-pose pip-pose--working">
            <image
              className="pip-body pip-body--working"
              href={PIP_WORKING_DATA_URI}
              x="95"
              y="49"
              width="270"
              height="157"
            />
            <AnimatedFace face={face} cx={200} cy={104} scale={0.46} />
          </g>
        ) : (
          <g className="pip-pose pip-pose--standing">
            <image
              className="pip-body pip-body--standing"
              href={PIP_STANDING_DATA_URI}
              x="134"
              y="48"
              width="118"
              height="158"
            />
            <AnimatedFace face={face} cx={200} cy={108} scale={0.46} />
          </g>
        )}
      </g>

      {/* Mug and steam for standing state */}
      {!isWorking && (
        <g className="ds-mug">
          <path className="ds-steam ds-steam-1" d="M300 170 Q296 162 301 156" fill="none" />
          <path className="ds-steam ds-steam-2" d="M312 170 Q308 160 314 154" fill="none" />
          <rect className="ds-mug-body" x="290" y="174" width="32" height="28" rx="6" />
          <path className="ds-mug-handle" d="M322 180 Q336 182 322 194" fill="none" />
          <rect className="ds-mug-rim" x="290" y="174" width="32" height="5" rx="2.5" />
        </g>
      )}
    </svg>
  );
}

// Pip's face on its own (used beside his speech). Decorative: the message text carries the meaning.
export function PipFace({ state = "reading" }) {
  const face = FACE[state] ?? "idle";
  return (
    <span
      className="pip-face"
      dangerouslySetInnerHTML={{
        __html: renderCompanionAvatarSvg(face, 36).replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"')
      }}
    />
  );
}
