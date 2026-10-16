"use client";

import React from "react";

export type ChibiMood = "idle" | "smug" | "panic" | "fried" | "poked";

export interface ChibiSkin {
  id: number;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  skinTone: string;
}

export const CHIBI_SKINS: ChibiSkin[] = [
  {
    id: 0,
    name: "Pháp Sư Trà Sữa",
    primaryColor: "#A855F7",
    secondaryColor: "#FACC15",
    skinTone: "#FDE68A",
  },
  {
    id: 1,
    name: "Chiến Thần Deadline",
    primaryColor: "#3B82F6",
    secondaryColor: "#EF4444",
    skinTone: "#FED7AA",
  },
  {
    id: 2,
    name: "Đạo Sĩ Mèo",
    primaryColor: "#F59E0B",
    secondaryColor: "#10B981",
    skinTone: "#FEF3C7",
  },
  {
    id: 3,
    name: "Cá Mập Cuối Tháng",
    primaryColor: "#06B6D4",
    secondaryColor: "#38BDF8",
    skinTone: "#FDE68A",
  },
  {
    id: 4,
    name: "Ninja Trốn Việc",
    primaryColor: "#10B981",
    secondaryColor: "#A3E635",
    skinTone: "#FED7AA",
  },
  {
    id: 5,
    name: "Hồ Ly Chín Đuôi",
    primaryColor: "#F43F5E",
    secondaryColor: "#FBBF24",
    skinTone: "#FFE4E6",
  },
  {
    id: 6,
    name: "Thần Tài Cyber",
    primaryColor: "#EAB308",
    secondaryColor: "#F97316",
    skinTone: "#FDE68A",
  },
  {
    id: 7,
    name: "Ếch Ngồi Đáy Giếng",
    primaryColor: "#22C55E",
    secondaryColor: "#86EFAC",
    skinTone: "#FEF08A",
  },
];

export function hashNameToSkin(name: string, offset = 0): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) % 1000;
  }
  return (h + offset) % CHIBI_SKINS.length;
}

interface ChibiAvatarProps {
  name: string;
  skinOffset?: number;
  mood?: ChibiMood;
  keoId?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function ChibiAvatar({
  name,
  skinOffset = 0,
  mood = "idle",
  keoId = "trasua",
  size = "md",
  className = "",
}: ChibiAvatarProps) {
  const skinIndex = hashNameToSkin(name, skinOffset);
  const skin = CHIBI_SKINS[skinIndex];

  const sizeClasses = {
    sm: "w-14 h-14",
    md: "w-20 h-20 sm:w-24 sm:h-24",
    lg: "w-28 h-28 sm:w-32 sm:h-32",
    xl: "w-36 h-36 sm:w-44 sm:h-44",
  }[size];

  const isFried = mood === "fried";
  const isPanic = mood === "panic";
  const isSmug = mood === "smug";
  const isPoked = mood === "poked";

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses} ${
        isPanic
          ? "animate-[wiggle_0.18s_ease-in-out_infinite]"
          : isPoked
            ? "scale-110 -translate-y-1 transition-transform"
            : isFried
              ? "animate-bounce"
              : "transition-transform duration-300 group-hover:scale-105"
      } ${className}`}
    >
      {/* Glowing Forcefield Shield when Smug/Dodging */}
      {isSmug && (
        <div className="pointer-events-none absolute -inset-2 rounded-full border-2 border-dashed border-teal-300 bg-teal-400/15 shadow-[0_0_25px_rgba(45,212,191,0.6)] animate-spin" />
      )}

      {/* Electric Shock Aura when Fried */}
      {isFried && (
        <div className="pointer-events-none absolute -inset-2 rounded-full border-2 border-amber-300 bg-rose-500/25 shadow-[0_0_35px_rgba(250,204,21,0.85)] animate-pulse" />
      )}

      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full overflow-visible drop-shadow-[0_6px_12px_rgba(0,0,0,0.5)]"
      >
        {/* Shadow under character */}
        <ellipse
          cx="60"
          cy="112"
          rx="32"
          ry="6"
          fill="rgba(0,0,0,0.45)"
        />

        {/* Crispy Electrocuted Afro Cloud (Behind Head when Fried) */}
        {isFried && (
          <g className="animate-pulse">
            <circle cx="35" cy="36" r="18" fill="#1E293B" stroke="#FACC15" strokeWidth="2" />
            <circle cx="60" cy="24" r="22" fill="#0F172A" stroke="#FACC15" strokeWidth="2" />
            <circle cx="85" cy="36" r="18" fill="#1E293B" stroke="#FACC15" strokeWidth="2" />
            <circle cx="28" cy="56" r="14" fill="#0F172A" />
            <circle cx="92" cy="56" r="14" fill="#0F172A" />
            {/* Smoke puffs */}
            <circle cx="22" cy="18" r="6" fill="#94A3B8" opacity="0.7" />
            <circle cx="96" cy="14" r="8" fill="#94A3B8" opacity="0.6" />
            <circle cx="60" cy="4" r="7" fill="#CBD5E1" opacity="0.5" />
          </g>
        )}

        {/* Body / Cultivator Robe */}
        <path
          d="M32 106C32 84 44 74 60 74C76 74 88 84 88 106H32Z"
          fill={isFried ? "#1E293B" : skin.primaryColor}
          stroke={isFried ? "#FACC15" : "#0F172A"}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Robe Collar V-Neck */}
        <path
          d="M46 75L60 92L74 75"
          stroke={isFried ? "#F43F5E" : skin.secondaryColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-Ray Ribcage Flash when Fried! */}
        {isFried && (
          <g stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round">
            <line x1="60" y1="78" x2="60" y2="102" />
            <path d="M48 84H72" />
            <path d="M50 91H70" />
            <path d="M52 98H68" />
          </g>
        )}

        {/* Head Base */}
        <circle
          cx="60"
          cy="52"
          r="26"
          fill={isFried ? "#334155" : skin.skinTone}
          stroke={isFried ? "#FACC15" : "#0F172A"}
          strokeWidth="3.5"
        />

        {/* Skin-Specific Headgear (when not fried into an afro) */}
        {!isFried && (
          <>
            {skinIndex === 0 && (
              /* Pháp Sư Trà Sữa: Mystic Boba Wizard Hat */
              <g>
                <path
                  d="M26 36L60 6L94 36H26Z"
                  fill="#7E22CE"
                  stroke="#0F172A"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
                <ellipse cx="60" cy="36" rx="36" ry="7" fill="#9333EA" stroke="#0F172A" strokeWidth="3" />
                <circle cx="52" cy="24" r="3.5" fill="#1E1B4B" />
                <circle cx="65" cy="20" r="3.5" fill="#1E1B4B" />
                <circle cx="60" cy="29" r="3.5" fill="#1E1B4B" />
              </g>
            )}
            {skinIndex === 1 && (
              /* Chiến Thần Deadline: Red Headband + Spiky Hair + Tie */
              <g>
                <path
                  d="M34 38C36 22 50 18 60 18C70 18 84 22 86 38"
                  fill="#1E293B"
                  stroke="#0F172A"
                  strokeWidth="3"
                />
                <rect x="33" y="30" width="54" height="8" rx="4" fill="#EF4444" stroke="#0F172A" strokeWidth="2.5" />
                <path d="M58 88L60 105L63 88" fill="#EF4444" />
              </g>
            )}
            {skinIndex === 2 && (
              /* Đạo Sĩ Mèo: Cute Cat Ears + Taoist Talisman */
              <g>
                <polygon points="34,36 28,14 48,26" fill="#F59E0B" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
                <polygon points="86,36 92,14 72,26" fill="#F59E0B" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
                <rect x="54" y="20" width="12" height="18" rx="2" fill="#FEF08A" stroke="#0F172A" strokeWidth="2" />
                <line x1="60" y1="23" x2="60" y2="35" stroke="#EF4444" strokeWidth="2" />
              </g>
            )}
            {skinIndex === 3 && (
              /* Cá Mập Cuối Tháng: Shark Fin Hood */
              <g>
                <path
                  d="M32 44C32 22 46 14 60 14C74 14 88 22 88 44"
                  fill="#0284C7"
                  stroke="#0F172A"
                  strokeWidth="3"
                />
                <path d="M56 14L62 2L70 16Z" fill="#0284C7" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
              </g>
            )}
            {skinIndex === 4 && (
              /* Ninja Trốn Việc: Stealth Bandana + Leaf */
              <g>
                <path d="M34 38C36 22 84 22 86 38Z" fill="#0F172A" />
                <rect x="33" y="31" width="54" height="9" rx="3" fill="#10B981" stroke="#0F172A" strokeWidth="2.5" />
                <circle cx="60" cy="35.5" r="3" fill="#ECFDF5" />
              </g>
            )}
            {skinIndex === 5 && (
              /* Hồ Ly Chín Đuôi: Fox Ears & Gold Crown */
              <g>
                <polygon points="35,34 24,10 50,25" fill="#F43F5E" stroke="#0F172A" strokeWidth="3" />
                <polygon points="85,34 96,10 70,25" fill="#F43F5E" stroke="#0F172A" strokeWidth="3" />
                <polygon points="48,26 60,12 72,26" fill="#FACC15" stroke="#0F172A" strokeWidth="2.5" />
              </g>
            )}
            {skinIndex === 6 && (
              /* Thần Tài Cyber: Imperial Gold Winged Hat */
              <g>
                <ellipse cx="24" cy="30" rx="10" ry="4" fill="#FACC15" stroke="#0F172A" strokeWidth="2.5" />
                <ellipse cx="96" cy="30" rx="10" ry="4" fill="#FACC15" stroke="#0F172A" strokeWidth="2.5" />
                <rect x="38" y="16" width="44" height="18" rx="6" fill="#DC2626" stroke="#0F172A" strokeWidth="3" />
                <circle cx="60" cy="25" r="5" fill="#FACC15" />
              </g>
            )}
            {skinIndex === 7 && (
              /* Ếch Ngồi Đáy Giếng: Frog Eyes Hood */
              <g>
                <circle cx="43" cy="22" r="10" fill="#22C55E" stroke="#0F172A" strokeWidth="3" />
                <circle cx="77" cy="22" r="10" fill="#22C55E" stroke="#0F172A" strokeWidth="3" />
                <circle cx="43" cy="22" r="4" fill="#0F172A" />
                <circle cx="77" cy="22" r="4" fill="#0F172A" />
              </g>
            )}
          </>
        )}

        {/* FACIAL EXPRESSIONS BY MOOD */}
        {isFried ? (
          /* FRIED MOOD: Dizzy X_X Eyes + Jagged Shocked Mouth + Lightning Bolts */
          <g>
            <path d="M42 46L52 56M52 46L42 56" stroke="#FEF08A" strokeWidth="4" strokeLinecap="round" />
            <path d="M68 46L78 56M78 46L68 56" stroke="#FEF08A" strokeWidth="4" strokeLinecap="round" />
            <path
              d="M46 66L52 62L58 67L64 62L70 67L75 63"
              stroke="#FEF08A"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        ) : isSmug ? (
          /* SMUG DODGE MOOD: Pixel "Deal With It" Sunglasses + Confident Smirk */
          <g>
            <rect x="34" y="44" width="22" height="12" rx="2" fill="#0F172A" stroke="#F8FAFC" strokeWidth="2" />
            <rect x="64" y="44" width="22" height="12" rx="2" fill="#0F172A" stroke="#F8FAFC" strokeWidth="2" />
            <line x1="56" y1="48" x2="64" y2="48" stroke="#F8FAFC" strokeWidth="3" />
            <line x1="38" y1="48" x2="46" y2="48" stroke="#38BDF8" strokeWidth="2.5" />
            <line x1="68" y1="48" x2="76" y2="48" stroke="#38BDF8" strokeWidth="2.5" />
            <path d="M52 65C56 68 65 67 70 62" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        ) : isPanic ? (
          /* PANIC MOOD: Wide Shaking Eyes + Screaming O Mouth + Sweat Drops */
          <g>
            <circle cx="47" cy="50" r="6.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            <circle cx="73" cy="50" r="6.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
            <circle cx="47" cy="50" r="2.5" fill="#0F172A" />
            <circle cx="73" cy="50" r="2.5" fill="#0F172A" />
            <ellipse cx="60" cy="65" rx="7" ry="8" fill="#EF4444" stroke="#0F172A" strokeWidth="2.5" />
            {/* Flying Sweat Drop */}
            <path
              d="M92 36C92 36 98 44 98 48C98 51.3 95.3 54 92 54C88.7 54 86 51.3 86 48C86 44 92 36 92 36Z"
              fill="#38BDF8"
              stroke="#0F172A"
              strokeWidth="2"
            />
          </g>
        ) : (
          /* IDLE / POKED MOOD: Cute Anime Eyes + Blush + Happy Smile */
          <g>
            <circle cx="47" cy="50" r="4.5" fill="#0F172A" />
            <circle cx="73" cy="50" r="4.5" fill="#0F172A" />
            <circle cx="45.5" cy="48.5" r="1.8" fill="#FFFFFF" />
            <circle cx="71.5" cy="48.5" r="1.8" fill="#FFFFFF" />
            <ellipse cx="39" cy="56" rx="4.5" ry="2.5" fill="#F43F5E" opacity="0.45" />
            <ellipse cx="81" cy="56" rx="4.5" ry="2.5" fill="#F43F5E" opacity="0.45" />
            {isPoked ? (
              <circle cx="60" cy="63" r="5" fill="#F43F5E" stroke="#0F172A" strokeWidth="2.5" />
            ) : (
              <path
                d="M53 61C55 65 65 65 67 61"
                stroke="#0F172A"
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}
          </g>
        )}

        {/* KÈO PROP BADGE IN HAND WHEN FRIED (OR SUBTLE PROP) */}
        {isFried && (
          <g transform="translate(76, 68)">
            <circle cx="18" cy="18" r="18" fill="#FACC15" stroke="#0F172A" strokeWidth="3" />
            <text
              x="18"
              y="25"
              textAnchor="middle"
              fontSize="20"
            >
              {keoId === "tratien"
                ? "💸"
                : keoId === "caphe"
                  ? "☕"
                  : keoId === "banhau"
                    ? "🍻"
                    : keoId === "dondep"
                      ? "🧹"
                      : keoId === "ganhteam"
                        ? "🎤"
                        : "🧋"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
