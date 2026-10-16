"use client";

import React, { useEffect, useState, useRef } from "react";
import { RarityTier } from "@/data/presets";
import { soundEngine } from "@/lib/sound";
import ChibiAvatar, { ChibiMood } from "@/components/ChibiAvatar";

interface BombArenaProps {
  players: string[];
  isSpinning: boolean;
  targetVictimIndex: number | null;
  targetRarity: RarityTier | null;
  keoId: string;
  skinOffsets: Record<string, number>;
  onCycleSkin: (name: string) => void;
  onAnimationComplete: () => void;
}

const PANIC_BUBBLES = [
  "Né ra coi!! 😱",
  "Đừng đưa tao!!",
  "Cầm hộ cái! 💣",
  "Sắp nổ rồi má ơi!",
  "Chuyền lẹ!! 🔥",
];

export default function BombArena({
  players,
  isSpinning,
  targetVictimIndex,
  targetRarity,
  keoId,
  skinOffsets,
  onCycleSkin,
  onAnimationComplete,
}: BombArenaProps) {
  const [holderIdx, setHolderIdx] = useState<number | null>(null);
  const [exploded, setExploded] = useState(false);
  const [passStep, setPassStep] = useState(0);
  const [bubble, setBubble] = useState("");
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isSpinning || targetVictimIndex === null || players.length === 0) {
      if (!isSpinning && !exploded) {
        setHolderIdx(null);
        setPassStep(0);
      }
      return;
    }

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setExploded(false);
    setPassStep(0);

    const passCount = 18;
    const sequence: number[] = [];
    let curr = Math.floor(Math.random() * players.length);

    for (let i = 0; i < passCount - 1; i++) {
      curr =
        (curr +
          1 +
          Math.floor(Math.random() * Math.max(1, players.length - 1))) %
        players.length;
      sequence.push(curr);
    }
    if (
      players.length > 1 &&
      sequence[sequence.length - 1] === targetVictimIndex
    ) {
      sequence[sequence.length - 1] =
        (targetVictimIndex + 1) % players.length;
    }
    sequence.push(targetVictimIndex);

    let timeAccumulator = 120;
    sequence.forEach((pIdx, step) => {
      const urgency = step / passCount;
      const delay = timeAccumulator;
      const stepDuration =
        step < passCount - 3 ? Math.max(175, 410 - step * 18) : 490;
      timeAccumulator += stepDuration;

      const t = setTimeout(() => {
        setHolderIdx(pIdx);
        setPassStep(step);
        if (step < sequence.length - 1) {
          soundEngine.playBombBeep(urgency);
          setBubble(
            PANIC_BUBBLES[Math.floor(Math.random() * PANIC_BUBBLES.length)]
          );
        } else {
          soundEngine.playLightning(true);
          setExploded(true);
          setBubble("💥 BÙM!! BANH XÁC!");
        }
      }, delay);

      timersRef.current.push(t);
    });

    const finishTimer = setTimeout(() => {
      onAnimationComplete();
    }, timeAccumulator + 900);
    timersRef.current.push(finishTimer);
  }, [isSpinning, targetVictimIndex, players, onAnimationComplete, exploded]);

  // Calculate circular coordinates (in %) for each player around the ring table
  const count = Math.max(1, players.length);
  const getPlayerCoords = (index: number) => {
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
    const radiusX = count <= 4 ? 34 : 38;
    const radiusY = count <= 4 ? 32 : 35;
    return {
      x: 50 + radiusX * Math.cos(angle),
      y: 52 + radiusY * Math.sin(angle),
    };
  };

  const bombCoords =
    holderIdx !== null ? getPlayerCoords(holderIdx) : { x: 50, y: 52 };
  const bombScale = 1 + (passStep / 18) * 0.45;

  return (
    <section
      aria-label="Truyền Bom Nghiệp Chướng"
      className="relative overflow-hidden rounded-3xl border border-rose-500/35 bg-gradient-to-b from-[#250e18] via-[#100914] to-[#080a12] p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.85)]"
    >
      {/* 2D Circular Ritual Table Stage */}
      <div className="relative mx-auto h-[370px] sm:h-[430px] w-full max-w-3xl">
        {/* Sacred Ring Circle on Floor */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 sm:h-72 sm:w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-rose-500/30 bg-rose-950/15 shadow-[inset_0_0_50px_rgba(244,63,94,0.2)]" />

        {/* FLYING ANIMATED SPIRIT BOMB */}
        <div
          style={{
            left: `${bombCoords.x}%`,
            top: `${bombCoords.y}%`,
            transform: `translate(-50%, -50%) scale(${exploded ? 1.8 : bombScale})`,
          }}
          className="pointer-events-none absolute z-30 transition-all duration-200 ease-out"
        >
          {exploded ? (
            /* Cartoon Explosion Burst SVG */
            <svg
              viewBox="0 0 120 120"
              className="h-28 w-28 animate-ping text-amber-400 drop-shadow-[0_0_30px_#f43f5e]"
            >
              <polygon
                points="60,4 73,34 106,18 88,49 118,66 85,77 100,108 67,92 52,118 42,88 10,98 28,69 2,50 35,42 24,12 52,32"
                fill="#FACC15"
                stroke="#F43F5E"
                strokeWidth="4"
              />
            </svg>
          ) : (
            /* Sparking Spirit Bomb SVG */
            <div className="relative flex items-center justify-center">
              <svg
                viewBox="0 0 90 90"
                className={`h-16 w-16 sm:h-20 sm:w-20 drop-shadow-[0_0_20px_rgba(244,63,94,0.9)] ${
                  isSpinning ? "animate-bounce" : ""
                }`}
              >
                {/* Fuse */}
                <path
                  d="M52 22C58 10 70 10 76 16"
                  stroke="#FDE047"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Spark at tip of fuse */}
                <circle
                  cx="76"
                  cy="16"
                  r="6"
                  fill="#FACC15"
                  className="animate-ping"
                />
                <circle cx="76" cy="16" r="5" fill="#FEF08A" />
                {/* Bomb Body */}
                <circle
                  cx="44"
                  cy="52"
                  r="26"
                  fill={passStep > 12 ? "#DC2626" : "#1E293B"}
                  stroke="#F43F5E"
                  strokeWidth="3.5"
                />
                {/* Skull Warning Symbol on Bomb */}
                <text
                  x="44"
                  y="59"
                  textAnchor="middle"
                  fontSize="20"
                  fill="#FACC15"
                >
                  💣
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* PLAYERS STANDING AROUND THE CIRCLE */}
        {players.map((name, idx) => {
          const coords = getPlayerCoords(idx);
          const isHolding = holderIdx === idx;
          const isBoom = isHolding && exploded;

          let mood: ChibiMood = "idle";
          if (isBoom) mood = "fried";
          else if (isHolding) mood = "panic";
          else if (exploded) mood = "smug";

          return (
            <div
              key={`${name}-${idx}`}
              onClick={() => {
                if (!isSpinning) {
                  soundEngine.playPoke();
                  onCycleSkin(name);
                }
              }}
              style={{
                left: `${coords.x}%`,
                top: `${coords.y}%`,
              }}
              className={`group absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center transition-transform duration-200 cursor-pointer ${
                isBoom
                  ? "z-20 scale-115"
                  : isHolding
                    ? "z-20 scale-110"
                    : "z-10 hover:scale-105"
              }`}
            >
              {/* Panic Speech Bubble */}
              {isHolding && bubble && (
                <div className="pointer-events-none absolute -top-7 z-30 whitespace-nowrap rounded-xl border border-rose-400 bg-slate-950 px-2.5 py-0.5 text-[11px] font-black text-rose-300 shadow-lg animate-bounce">
                  {bubble}
                </div>
              )}

              {/* Final Rarity Badge */}
              {isBoom && targetRarity && (
                <span
                  style={{ backgroundColor: targetRarity.color }}
                  className="mb-1 rounded-full px-2.5 py-0.5 text-[10px] font-black text-slate-950 shadow"
                >
                  {targetRarity.badge}
                </span>
              )}

              <ChibiAvatar
                name={name}
                skinOffset={skinOffsets[name] || 0}
                mood={mood}
                keoId={keoId}
                size="sm"
              />

              <span
                className={`mt-1 rounded-full border px-2.5 py-0.5 text-xs font-black shadow ${
                  isBoom
                    ? "border-amber-300 bg-rose-600 text-white"
                    : isHolding
                      ? "border-rose-400 bg-rose-950 text-rose-200"
                      : "border-slate-700 bg-slate-900/90 text-slate-200"
                }`}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
