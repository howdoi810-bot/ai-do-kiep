"use client";

import React, { useEffect, useState, useRef } from "react";
import { RARITY_TIERS, RarityKey, RarityTier } from "@/data/presets";
import { soundEngine } from "@/lib/sound";
import ChibiAvatar, { ChibiMood } from "@/components/ChibiAvatar";

interface CsReelArenaProps {
  players: string[];
  isSpinning: boolean;
  targetVictimIndex: number | null;
  targetRarity: RarityTier | null;
  keoId: string;
  skinOffsets: Record<string, number>;
  onCycleSkin: (name: string) => void;
  onAnimationComplete: () => void;
}

interface ReelCard {
  slotId: number;
  name: string;
  rarity: RarityTier;
}

const CARD_WIDTH = 196;
const CARD_GAP = 14;
const STEP_PX = CARD_WIDTH + CARD_GAP;
const WINNING_SLOT_INDEX = 46;
const TOTAL_SLOTS = 58;

const RARITY_KEYS: RarityKey[] = [
  "common",
  "rare",
  "epic",
  "legendary",
  "mythic",
];

export default function CsReelArena({
  players,
  isSpinning,
  targetVictimIndex,
  targetRarity,
  keoId,
  skinOffsets,
  onCycleSkin,
  onAnimationComplete,
}: CsReelArenaProps) {
  const [cards, setCards] = useState<ReelCard[]>([]);
  const [translateX, setTranslateX] = useState(0);
  const [transitionCss, setTransitionCss] = useState("none");
  const [landedSlot, setLandedSlot] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (isSpinning) return;
    const safePlayers = players.length > 0 ? players : ["Đạo Hữu"];
    const initial: ReelCard[] = Array.from({ length: TOTAL_SLOTS }, (_, idx) => {
      const pName = safePlayers[idx % safePlayers.length];
      const rKey = RARITY_KEYS[(idx * 3) % RARITY_KEYS.length];
      return {
        slotId: idx,
        name: pName,
        rarity: RARITY_TIERS[rKey],
      };
    });
    setCards(initial);
    setTransitionCss("none");
    setTranslateX(0);
    setLandedSlot(null);
  }, [players, isSpinning]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isSpinning || targetVictimIndex === null || players.length === 0) {
      return;
    }

    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setLandedSlot(null);

    const victimName = players[targetVictimIndex];
    const finalRarity = targetRarity || RARITY_TIERS.legendary;

    const generated: ReelCard[] = Array.from(
      { length: TOTAL_SLOTS },
      (_, idx) => {
        if (idx === WINNING_SLOT_INDEX) {
          return {
            slotId: idx,
            name: victimName,
            rarity: finalRarity,
          };
        }
        if (idx === WINNING_SLOT_INDEX - 1 && players.length > 1) {
          const decoyName =
            players[(targetVictimIndex + 1) % players.length];
          return {
            slotId: idx,
            name: decoyName,
            rarity: RARITY_TIERS.mythic,
          };
        }
        const randPlayer =
          players[Math.floor(Math.random() * players.length)];
        const randRarity =
          RARITY_TIERS[
            RARITY_KEYS[Math.floor(Math.random() * RARITY_KEYS.length)]
          ];
        return {
          slotId: idx,
          name: randPlayer,
          rarity: randRarity,
        };
      }
    );

    setCards(generated);
    setTransitionCss("none");
    setTranslateX(0);

    const containerWidth = containerRef.current?.clientWidth || 720;
    const centerOffset = containerWidth / 2 - CARD_WIDTH / 2;

    const jitter = (Math.random() * 0.48 - 0.24) * CARD_WIDTH;
    const targetX = -(WINNING_SLOT_INDEX * STEP_PX - centerOffset + jitter);
    const snapCenterX = -(WINNING_SLOT_INDEX * STEP_PX - centerOffset);

    const startTimer = setTimeout(() => {
      setTransitionCss(
        "transform 5.6s cubic-bezier(0.06, 0.85, 0.14, 1)"
      );
      setTranslateX(targetX);
    }, 40);
    timersRef.current.push(startTimer);

    let elapsed = 60;
    let interval = 45;
    while (elapsed < 5350) {
      const clickTime = elapsed;
      const pitch = 0.85 + Math.min(0.4, (5350 - elapsed) / 12000);
      const t = setTimeout(() => {
        soundEngine.playTick(pitch);
      }, clickTime);
      timersRef.current.push(t);
      elapsed += interval;
      interval = Math.floor(interval * 1.075);
    }

    const snapTimer = setTimeout(() => {
      soundEngine.playLightning(true);
      setTransitionCss("transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)");
      setTranslateX(snapCenterX);
      setLandedSlot(WINNING_SLOT_INDEX);
    }, 5680);
    timersRef.current.push(snapTimer);

    const doneTimer = setTimeout(() => {
      onAnimationComplete();
    }, 6380);
    timersRef.current.push(doneTimer);
  }, [isSpinning, targetVictimIndex, targetRarity, players, onAnimationComplete]);

  return (
    <section
      aria-label="Hòm Tế Thần CS2"
      className="relative overflow-hidden rounded-3xl border border-purple-500/35 bg-gradient-to-b from-[#161233] via-[#0b0d1b] to-[#070912] p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.85)]"
    >
      {/* Reel Window */}
      <div
        ref={containerRef}
        className="relative h-64 w-full overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-[#060810] shadow-inner"
      >
        {/* Center Golden Laser Selector Line */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-1.5 -translate-x-1/2 bg-gradient-to-b from-amber-300 via-amber-400 to-rose-500 shadow-[0_0_22px_#facc15]">
          <div className="absolute -top-1.5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 rounded-xs bg-amber-300 shadow-[0_0_14px_#facc15]" />
          <div className="absolute -bottom-1.5 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 rounded-xs bg-amber-300 shadow-[0_0_14px_#facc15]" />
        </div>

        {/* Left & Right Vignette Fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 sm:w-32 bg-gradient-to-r from-[#060810] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 sm:w-32 bg-gradient-to-l from-[#060810] to-transparent" />

        {/* Horizontal Track */}
        <div
          className="flex h-full items-center"
          style={{
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: transitionCss,
            willChange: "transform",
          }}
        >
          {cards.map((card) => {
            const isWinner = landedSlot === card.slotId;
            const isNearMissSurvivor =
              landedSlot !== null && card.slotId !== landedSlot;

            let cardMood: ChibiMood = "idle";
            if (isWinner) cardMood = "fried";
            else if (isNearMissSurvivor) cardMood = "smug";

            return (
              <div
                key={card.slotId}
                onClick={() => {
                  if (!isSpinning) {
                    soundEngine.playPoke();
                    onCycleSkin(card.name);
                  }
                }}
                style={{
                  width: `${CARD_WIDTH}px`,
                  marginRight: `${CARD_GAP}px`,
                  background: card.rarity.bgGradient,
                  borderColor: isWinner ? "#FACC15" : `${card.rarity.color}88`,
                  boxShadow: isWinner
                    ? `0 0 40px ${card.rarity.glow}`
                    : "none",
                }}
                className={`group relative flex h-56 shrink-0 flex-col items-center justify-between overflow-hidden rounded-2xl border-2 p-3 transition-transform cursor-pointer ${
                  isWinner ? "scale-105 ring-2 ring-amber-300" : ""
                }`}
              >
                {/* Rarity Header Pill */}
                <div className="flex w-full items-center justify-between">
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-black tracking-wider text-slate-950"
                    style={{ backgroundColor: card.rarity.color }}
                  >
                    {card.rarity.badge}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    #{card.slotId + 1}
                  </span>
                </div>

                {/* Illustrated Chibi Character */}
                <div className="my-auto">
                  <ChibiAvatar
                    name={card.name}
                    skinOffset={skinOffsets[card.name] || 0}
                    mood={cardMood}
                    keoId={keoId}
                    size="md"
                  />
                </div>

                {/* Player Name & Bottom Rarity Strip */}
                <div className="w-full text-center">
                  <p className="line-clamp-1 text-base font-black text-white">
                    {card.name}
                  </p>
                  <div
                    className="mt-1.5 h-1.5 w-full rounded-full"
                    style={{ backgroundColor: card.rarity.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
