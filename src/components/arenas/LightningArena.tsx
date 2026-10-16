"use client";

import React, { useEffect, useState, useRef } from "react";
import { Shield, Plus, X, Sparkles } from "lucide-react";
import { RarityTier } from "@/data/presets";
import { soundEngine } from "@/lib/sound";
import ChibiAvatar, { ChibiMood } from "@/components/ChibiAvatar";

interface LightningArenaProps {
  players: string[];
  isSpinning: boolean;
  targetVictimIndex: number | null;
  targetRarity: RarityTier | null;
  pityPlayer: string | null;
  keoId: string;
  skinOffsets: Record<string, number>;
  onCycleSkin: (name: string) => void;
  onAddPlayer?: (name: string) => void;
  onRemovePlayer?: (idx: number) => void;
  onAnimationComplete: () => void;
}

const SHORT_DODGE_BUBBLES = [
  "Mặt dày né sét! 😎",
  "Bận họp rồi! 🛡️",
  "Lêu lêu hụt nhé!",
  "Khiên Kim Cương!",
  "Đẩy qua đứa kế! 👉",
];

const SHORT_HIT_BUBBLES = [
  "Á đù khét lẹt! ⚡",
  "Tê tái tâm hồn!",
  "Sao đánh tui?! 😱",
  "Xém cháy tóc mái!",
];

const POKE_BUBBLES = [
  "Đừng chọc! Đổi skin nè ✨",
  "Á! Nhột nha đạo hữu!",
  "Hôm nay tui miễn nhiễm!",
  "Bấm nữa sét đánh giờ!",
];

export default function LightningArena({
  players,
  isSpinning,
  targetVictimIndex,
  targetRarity,
  pityPlayer,
  keoId,
  skinOffsets,
  onCycleSkin,
  onAddPlayer,
  onRemovePlayer,
  onAnimationComplete,
}: LightningArenaProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [strikeType, setStrikeType] = useState<
    "dodge" | "hit" | "fakeout" | "final" | null
  >(null);
  const [bubbleText, setBubbleText] = useState<string>("");
  const [pokedIdx, setPokedIdx] = useState<number | null>(null);
  const [screenFlash, setScreenFlash] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isSpinning || targetVictimIndex === null || players.length === 0) {
      if (!isSpinning && strikeType !== "final") {
        setActiveIdx(null);
        setStrikeType(null);
      }
      return;
    }

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPokedIdx(null);

    const stepTimings = [
      300, 700, 1100, 1500, 1950, 2400, 2900, 3450, 4050, 4750, 5500,
    ];
    const totalSteps = stepTimings.length;

    const decoyIdx =
      players.length > 1
        ? (targetVictimIndex +
            1 +
            Math.floor(Math.random() * (players.length - 1))) %
          players.length
        : targetVictimIndex;

    stepTimings.forEach((delay, step) => {
      const t = setTimeout(() => {
        if (step < totalSteps - 2) {
          const randIdx = Math.floor(Math.random() * players.length);
          const isDodge = Math.random() > 0.45;
          setActiveIdx(randIdx);

          if (isDodge) {
            soundEngine.playShieldDodge();
            setStrikeType("dodge");
            setBubbleText(
              SHORT_DODGE_BUBBLES[
                Math.floor(Math.random() * SHORT_DODGE_BUBBLES.length)
              ]
            );
          } else {
            soundEngine.playLightning(false);
            setStrikeType("hit");
            setBubbleText(
              SHORT_HIT_BUBBLES[
                Math.floor(Math.random() * SHORT_HIT_BUBBLES.length)
              ]
            );
          }
        } else if (step === totalSteps - 2) {
          // Fake-out step
          soundEngine.playShieldDodge();
          setActiveIdx(decoyIdx);
          setStrikeType("fakeout");
          setBubbleText("Phút 90 bẻ lái!! 🌪️😎");
        } else {
          // Final strike
          soundEngine.playLightning(true);
          setScreenFlash(true);
          setTimeout(() => setScreenFlash(false), 380);
          setActiveIdx(targetVictimIndex);
          setStrikeType("final");
          setBubbleText("⚡ ĐỘ KIẾP THÀNH CÔNG!! 💀");
        }
      }, delay);

      timersRef.current.push(t);
    });

    const finishTimer = setTimeout(() => {
      onAnimationComplete();
    }, 6350);
    timersRef.current.push(finishTimer);
  }, [isSpinning, targetVictimIndex, players, onAnimationComplete, strikeType]);

  const handleCharacterClick = (name: string, idx: number) => {
    if (isSpinning) {
      soundEngine.playLightning(false);
      return;
    }
    soundEngine.playPoke();
    onCycleSkin(name);
    setPokedIdx(idx);
    setBubbleText(
      POKE_BUBBLES[Math.floor(Math.random() * POKE_BUBBLES.length)]
    );
    setTimeout(() => {
      setPokedIdx((prev) => (prev === idx ? null : prev));
    }, 1100);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim() || !onAddPlayer) return;
    onAddPlayer(quickName.trim());
    setQuickName("");
    setShowAddInput(false);
  };

  // Compute Thunder God cloud horizontal position (15% to 85%)
  const cloudXPercent =
    activeIdx !== null && players.length > 0
      ? 18 + ((activeIdx % 4) / Math.max(1, Math.min(3, players.length - 1))) * 64
      : 50;

  return (
    <section
      aria-label="Đài Thiên Lôi Độ Kiếp"
      className={`relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-[#111833] via-[#090d1a] to-[#070911] p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.85)] transition-transform duration-150 ${
        screenFlash ? "scale-[1.01] ring-2 ring-amber-300" : ""
      }`}
    >
      {screenFlash && (
        <div className="pointer-events-none fixed inset-0 z-40 bg-amber-200/40 mix-blend-screen" />
      )}

      {/* ANIMATED SKY & THUNDER GOD BOSS CLOUD */}
      <div className="relative mb-6 h-24 sm:h-28 w-full overflow-visible rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-[#1e1b4b]/60 to-transparent">
        {/* Background twinkling stars / storm aura */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.18),transparent_70%)]" />

        {/* Hint pill in corner */}
        <div className="absolute top-2.5 right-3 z-20 hidden sm:flex items-center gap-1 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold text-slate-300 border border-slate-700/70">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Chạm vào nhân vật để đổi trang phục!</span>
        </div>

        {/* Gliding Thunder God Boss Cloud */}
        <div
          style={{ left: `${cloudXPercent}%` }}
          className=" absolute top-2 z-20 -translate-x-1/2 transition-all duration-300 ease-out"
        >
          <div className="relative flex flex-col items-center">
            {/* Boss Cloud SVG */}
            <svg
              viewBox="0 0 180 80"
              className={`h-16 w-36 sm:h-20 sm:w-44 drop-shadow-[0_0_20px_rgba(250,204,21,0.45)] ${
                isSpinning ? "animate-bounce" : ""
              }`}
            >
              <path
                d="M42 66H140C156 66 168 54 168 39C168 25 157 14 143 13C136 4 124 0 110 2C98 -4 80 0 72 10C62 6 48 10 43 20C28 21 16 33 16 47C16 58 28 66 42 66Z"
                fill="#1E1B4B"
                stroke={strikeType === "final" ? "#FACC15" : "#818CF8"}
                strokeWidth="3.5"
              />
              {/* Glowing Thunder God Eyes */}
              <polygon
                points="68,34 84,40 70,44"
                fill={strikeType ? "#FACC15" : "#38BDF8"}
              />
              <polygon
                points="112,34 96,40 110,44"
                fill={strikeType ? "#FACC15" : "#38BDF8"}
              />
              {/* Angry Lightning Brow */}
              <path
                d="M64 28L90 36L116 28"
                stroke="#FACC15"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Jagged Lightning Beam shooting down when active */}
            {activeIdx !== null && (
              <svg
                viewBox="0 0 80 140"
                className="pointer-events-none -mt-3 h-20 w-14 animate-pulse overflow-visible"
              >
                <path
                  d="M40 0L18 48H44L22 98H48L28 140"
                  stroke={
                    strikeType === "dodge" || strikeType === "fakeout"
                      ? "#2DD4BF"
                      : "#FACC15"
                  }
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  className="drop-shadow-[0_0_16px_#FACC15]"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* INTERACTIVE CHARACTER PEDESTALS STAGE */}
      <div className="relative z-10 grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
        {players.map((name, idx) => {
          const isTarget = activeIdx === idx;
          const isFinalVictim = strikeType === "final" && isTarget;
          const isDodging =
            (strikeType === "dodge" || strikeType === "fakeout") && isTarget;
          const isHit = strikeType === "hit" && isTarget;
          const isPoked = pokedIdx === idx;

          let mood: ChibiMood = "idle";
          if (isFinalVictim) mood = "fried";
          else if (isDodging) mood = "smug";
          else if (isHit) mood = "panic";
          else if (isPoked) mood = "poked";
          else if (isSpinning && strikeType === "final") mood = "smug";

          const hasPity =
            pityPlayer &&
            pityPlayer.trim().toLowerCase() === name.trim().toLowerCase();

          return (
            <div
              key={`${name}-${idx}`}
              onClick={() => handleCharacterClick(name, idx)}
              className={`group relative flex flex-col items-center justify-between rounded-3xl border-2 p-3.5 pt-5 transition-all duration-200 cursor-pointer select-none ${
                isFinalVictim
                  ? "scale-105 border-amber-400 bg-gradient-to-b from-amber-500/35 via-rose-600/30 to-slate-950 shadow-[0_0_45px_rgba(250,204,21,0.65)] ring-2 ring-amber-300"
                  : isDodging
                    ? "scale-[1.03] border-teal-400 bg-teal-950/45 shadow-[0_0_30px_rgba(45,212,191,0.45)]"
                    : isHit
                      ? "scale-[1.03] border-rose-400 bg-rose-950/50 shadow-[0_0_30px_rgba(244,63,94,0.5)]"
                      : "border-slate-800/90 bg-slate-900/60 hover:border-amber-400/50 hover:bg-slate-900/90"
              }`}
            >
              {/* Remove Player Quick Button (Top Right on Hover) */}
              {!isSpinning && players.length > 2 && onRemovePlayer && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlayer(idx);
                  }}
                  className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-slate-800/90 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500 hover:text-white cursor-pointer"
                  title={`Xóa ${name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}

              {/* Pity Shield Badge */}
              {hasPity && (
                <span
                  className="absolute top-2 left-2 z-20 flex items-center gap-0.5 rounded-full border border-teal-400/50 bg-teal-950/90 px-2 py-0.5 text-[10px] font-extrabold text-teal-300 shadow"
                  title="Kim Bài Miễn Tử (-55% tỉ lệ bị sét đánh)"
                >
                  <Shield className="h-3 w-3" />
                  Miễn Tử
                </span>
              )}

              {/* Final Rarity Crown Badge */}
              {isFinalVictim && targetRarity && (
                <span
                  style={{ backgroundColor: targetRarity.color }}
                  className="absolute -top-3 z-30 rounded-full px-3 py-0.5 text-[10px] font-black tracking-wider text-slate-950 shadow-lg"
                >
                  {targetRarity.badge}
                </span>
              )}

              {/* COMIC SPEECH BUBBLE POPUP */}
              {(isTarget || isPoked) && bubbleText && (
                <div className="pointer-events-none absolute -top-3.5 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-xl border border-amber-300 bg-slate-950 px-2.5 py-1 text-[11px] font-extrabold text-amber-300 shadow-xl animate-bounce">
                  {bubbleText}
                </div>
              )}

              {/* EXPRESSIVE CHIBI CHARACTER */}
              <div className="my-1">
                <ChibiAvatar
                  name={name}
                  skinOffset={skinOffsets[name] || 0}
                  mood={mood}
                  keoId={keoId}
                  size="md"
                />
              </div>

              {/* Floating Mystical Pedestal Base + Name */}
              <div className="mt-1 w-full text-center">
                <div className="mx-auto mb-1.5 h-2 w-16 rounded-full bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
                <p className="line-clamp-1 text-sm sm:text-base font-black text-white">
                  {name}
                </p>
              </div>
            </div>
          );
        })}

        {/* Direct On-Stage "+ Thêm Đạo Hữu" Card */}
        {!isSpinning && players.length < 16 && onAddPlayer && (
          <div className="flex min-h-[168px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-700/80 bg-slate-900/30 p-3 transition hover:border-amber-400/60 hover:bg-slate-900/60">
            {showAddInput ? (
              <form
                onSubmit={handleQuickAddSubmit}
                className="flex w-full flex-col gap-2 px-1"
              >
                <input
                  type="text"
                  autoFocus
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="Tên đạo hữu..."
                  className="w-full rounded-xl border border-amber-400/60 bg-slate-950 px-3 py-2 text-center text-xs font-bold text-white focus:outline-none"
                />
                <div className="flex gap-1.5">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-amber-400 py-1.5 text-xs font-black text-slate-950 cursor-pointer"
                  >
                    Thêm
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddInput(false)}
                    className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 cursor-pointer"
                  >
                    Huỷ
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddInput(true)}
                className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-400 hover:text-amber-300 cursor-pointer"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-xs font-extrabold">Thêm Đạo Hữu</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
