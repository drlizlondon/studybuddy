import React from "react";
import { renderCompanionAvatarSvg } from "./avatarMarkup.js";
import { PIP_COMPANION_DATA_URI, PROP_LAPTOP_DATA_URI } from "./pipAssets.js";
import "./pip.css";

// The five things Pip does at his desk, and the face each one wears.
export const PIP_STATES = ["settling", "reading", "writing", "engaging", "break"];

const FACE = {
  settling: "idle",
  reading: "focusing",
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
  const isFocusing = face === "focusing";
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
      <ellipse className="pip-blush pip-blush-left" cx="-32" cy="14" rx="7" ry="3.5" fill="#FFA5C7" opacity={isHappy ? 0.65 : 0.45} />
      <ellipse className="pip-blush pip-blush-right" cx="32" cy="14" rx="7" ry="3.5" fill="#FFA5C7" opacity={isHappy ? 0.65 : 0.45} />

      {/* Eyes */}
      {isHappy ? (
        <g className="pip-eyes-happy">
          <circle cx="-22" cy="-6" r="8" fill="#24143D" />
          <circle cx="-20" cy="-8" r="2.8" fill="#FFFFFF" opacity="0.95" />
          <circle cx="-24" cy="-4" r="1.4" fill="#FFFFFF" opacity="0.75" />
          <circle cx="22" cy="-6" r="8" fill="#24143D" />
          <circle cx="24" cy="-8" r="2.8" fill="#FFFFFF" opacity="0.95" />
          <circle cx="20" cy="-4" r="1.4" fill="#FFFFFF" opacity="0.75" />
        </g>
      ) : isFocusing ? (
        <g className="pip-eyes-focusing">
          <ellipse cx="-22" cy="0" rx="7.5" ry="6.5" fill="#24143D" />
          <circle cx="-20" cy="2" r="2.2" fill="#FFFFFF" opacity="0.9" />
          <ellipse cx="22" cy="0" rx="7.5" ry="6.5" fill="#24143D" />
          <circle cx="20" cy="2" r="2.2" fill="#FFFFFF" opacity="0.9" />
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
      ) : isFocusing ? (
        <path
          className="pip-mouth pip-mouth--focusing"
          d="M-8 15 Q0 17 8 15"
          stroke="#24143D"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
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
  const isBreak = safeState === "break";

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
        <radialGradient id="pip-contact-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2e1a0d" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#2e1a0d" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2e1a0d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pip-laptop-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a0e07" stopOpacity="0.55" />
          <stop offset="65%" stopColor="#1a0e07" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1a0e07" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Desk contact shadows on the room tabletop */}
      <ellipse className="ds-contact" cx="200" cy="208" rx="76" ry="6" fill="url(#pip-contact-shadow)" />
      <ellipse className="ds-contact ds-contact-laptop" cx="200" cy="216" rx="60" ry="5" fill="url(#pip-laptop-shadow)" />

      {/* Pip 3D companion character */}
      <g className="ds-pip pip-character">
        <g className={`pip-pose pip-pose--${isWorking ? "working" : "standing"}`}>
          <image
            className="pip-body pip-companion-model"
            href={PIP_COMPANION_DATA_URI}
            x="100"
            y="48"
            width="200"
            height="188"
          />
          <AnimatedFace face={face} cx={200} cy={140} scale={0.46} />
        </g>
      </g>

      {/* Decoupled Laptop Prop (sits in front of Pip on the wooden desk) */}
      <g className="ds-laptop">
        <image
          className="pip-laptop-prop"
          href={PROP_LAPTOP_DATA_URI}
          x="136"
          y="152"
          width="128"
          height="64"
        />
      </g>

      {/* Mug and steam for break state */}
      {isBreak && (
        <g className="ds-mug">
          <ellipse cx="295" cy="207" rx="16" ry="3" fill="url(#pip-contact-shadow)" />
          <path className="ds-steam ds-steam-1" d="M295 174 Q291 166 296 160" fill="none" />
          <path className="ds-steam ds-steam-2" d="M303 174 Q299 164 305 158" fill="none" />
          <rect className="ds-mug-body" x="282" y="178" width="26" height="24" rx="5" />
          <path className="ds-mug-handle" d="M308 183 Q318 185 308 195" fill="none" />
          <rect className="ds-mug-rim" x="282" y="178" width="26" height="4" rx="2" />
        </g>
      )}
    </svg>
  );
}

// Pip's face on its own (used beside his speech). Decorative: the message text carries the meaning.
export function PipFace({ state = "reading" }) {
  const avatarFace = state === "writing" ? "thinking" : state === "engaging" ? "happy" : "idle";
  return (
    <span
      className="pip-face"
      dangerouslySetInnerHTML={{
        __html: renderCompanionAvatarSvg(avatarFace, 36).replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true"')
      }}
    />
  );
}
