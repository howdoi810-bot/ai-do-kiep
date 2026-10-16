"use client";

import React, { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  ArenaMode,
  DEFAULT_SQUADS,
  KEO_PRESETS,
  RARITY_TIERS,
  SavedSquad,
  getAutoKeoByHour,
} from "@/data/presets";
import {
  TribulationOutcome,
  calculateKarmaBillSplit,
  pickVictimWithFairness,
  rollRarityTier,
} from "@/lib/rng";
import { soundEngine } from "@/lib/sound";
import {
  HistoryRecord,
  PlayerKarmaStat,
  clearKarmaStats,
  deleteSquadFromStorage,
  getGlobalSpinCount,
  getHistoryLog,
  getKarmaLeaderboard,
  getLastVictim,
  getSavedSquads,
  incrementGlobalSpinCount,
  recordTribulationResult,
  saveSquadToStorage,
} from "@/lib/storage";
import Header from "@/components/Header";
import ModeToolbar from "@/components/ModeToolbar";
import LightningArena from "@/components/arenas/LightningArena";
import CsReelArena from "@/components/arenas/CsReelArena";
import BombArena from "@/components/arenas/BombArena";
import ControlDock from "@/components/ControlDock";
import VerdictModal from "@/components/VerdictModal";
import LeaderboardModal from "@/components/LeaderboardModal";

export default function HomePage() {
  const [mode, setMode] = useState<ArenaMode>("lightning");
  const [players, setPlayers] = useState<string[]>(DEFAULT_SQUADS[0].members);
  const [skinOffsets, setSkinOffsets] = useState<Record<string, number>>({});
  const [selectedKeoId, setSelectedKeoId] = useState<string>("trasua");
  const [customKeoText, setCustomKeoText] = useState<string>("");

  // Bill-splitting state
  const [enableBillSplit, setEnableBillSplit] = useState<boolean>(false);
  const [billAmount, setBillAmount] = useState<number>(300000);
  const [billSplitMode, setBillSplitMode] = useState<"single" | "karma">(
    "karma"
  );

  // Fairness & Meta state
  const [enablePityShield, setEnablePityShield] = useState<boolean>(true);
  const [lastVictim, setLastVictim] = useState<string | null>(null);
  const [savedSquads, setSavedSquads] = useState<SavedSquad[]>(DEFAULT_SQUADS);
  const [globalCount, setGlobalCount] = useState<number>(148520);
  const [volume, setVolume] = useState<number>(0.75);

  // Spin & Verdict state
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [pendingOutcome, setPendingOutcome] =
    useState<TribulationOutcome | null>(null);
  const [showVerdictModal, setShowVerdictModal] = useState<boolean>(false);

  // Leaderboard modal state
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [karmaStats, setKarmaStats] = useState<PlayerKarmaStat[]>([]);
  const [historyLog, setHistoryLog] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    setGlobalCount(getGlobalSpinCount());
    setSavedSquads(getSavedSquads());
    setLastVictim(getLastVictim());
    setKarmaStats(getKarmaLeaderboard());
    setHistoryLog(getHistoryLog());
    setVolume(soundEngine.getVolume());

    const currentHour = new Date().getHours();
    const autoKeo = getAutoKeoByHour(currentHour);
    setSelectedKeoId(autoKeo);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const teamParam = params.get("team");
      const keoParam = params.get("keo");
      const customParam = params.get("custom");
      const billParam = params.get("bill");

      if (teamParam) {
        const parsedTeam = teamParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (parsedTeam.length >= 2) {
          setPlayers(parsedTeam.slice(0, 16));
        }
      }
      if (keoParam && KEO_PRESETS.some((k) => k.id === keoParam)) {
        setSelectedKeoId(keoParam);
      }
      if (customParam) {
        setCustomKeoText(customParam);
      }
      if (billParam && !Number.isNaN(Number(billParam))) {
        setEnableBillSplit(true);
        setBillAmount(Math.max(1000, Number(billParam)));
      }
    }
  }, []);

  const activeKeo =
    KEO_PRESETS.find((k) => k.id === selectedKeoId) || KEO_PRESETS[0];
  const displayKeoTitle = customKeoText.trim() || activeKeo.shortLabel;

  const handleCycleSkin = (name: string) => {
    setSkinOffsets((prev) => ({
      ...prev,
      [name]: ((prev[name] || 0) + 1) % 8,
    }));
  };

  const handleQuickAddPlayer = (name: string) => {
    if (players.some((p) => p.toLowerCase() === name.toLowerCase())) return;
    setPlayers((prev) => [...prev, name].slice(0, 16));
  };

  const handleQuickRemovePlayer = (idx: number) => {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    soundEngine.setVolume(val);
    if (val > 0) {
      soundEngine.playTick(1.1);
    }
  };

  const handleShareRoomLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("keo", selectedKeoId);
    url.searchParams.set("team", players.join(","));
    if (customKeoText.trim()) {
      url.searchParams.set("custom", customKeoText.trim());
    }
    if (enableBillSplit) {
      url.searchParams.set("bill", String(billAmount));
    }
    window.history.replaceState({}, "", url.toString());
    navigator.clipboard?.writeText(url.toString()).catch(() => {});
  };

  const handleSaveCurrentSquad = (name: string) => {
    const newSquad: SavedSquad = {
      id: `squad-${Date.now()}`,
      name,
      emoji: activeKeo.emoji,
      members: players,
    };
    const updated = saveSquadToStorage(newSquad);
    setSavedSquads(updated);
  };

  const handleDeleteSavedSquad = (id: string) => {
    const updated = deleteSquadFromStorage(id);
    setSavedSquads(updated);
  };

  const handleStartTribulation = () => {
    if (isSpinning || players.length < 2) return;

    const { victim, victimIndex, pityAppliedTo } = pickVictimWithFairness(
      players,
      lastVictim,
      enablePityShield
    );
    const rarity = rollRarityTier();
    const verdictText =
      activeKeo.verdicts[
        Math.floor(Math.random() * activeKeo.verdicts.length)
      ];

    const billShares = enableBillSplit
      ? calculateKarmaBillSplit(
          players,
          victimIndex,
          billAmount,
          billSplitMode,
          rarity
        )
      : undefined;

    setPendingOutcome({
      victim,
      victimIndex,
      rarity,
      verdictText,
      pityAppliedTo,
      billShares,
    });
    setShowVerdictModal(false);
    setIsSpinning(true);
  };

  const handleAnimationComplete = useCallback(() => {
    setIsSpinning(false);
    if (!pendingOutcome) return;

    soundEngine.playVerdictReveal();

    try {
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 },
        colors: [pendingOutcome.rarity.color, "#FACC15", "#F43F5E"],
      });
    } catch {
      // ignore
    }

    const victimBillPaid = pendingOutcome.billShares?.find(
      (s) => s.isPrimaryVictim
    )?.amount;

    recordTribulationResult({
      players,
      victim: pendingOutcome.victim,
      rarityKey: pendingOutcome.rarity.key,
      rarityBadge: pendingOutcome.rarity.badge,
      rarityColor: pendingOutcome.rarity.color,
      keoLabel: displayKeoTitle,
      keoEmoji: activeKeo.emoji,
      mode,
      victimBillPaid,
    });

    setGlobalCount(incrementGlobalSpinCount());
    setLastVictim(pendingOutcome.victim);
    setKarmaStats(getKarmaLeaderboard());
    setHistoryLog(getHistoryLog());
    setShowVerdictModal(true);
  }, [pendingOutcome, players, displayKeoTitle, activeKeo.emoji, mode]);

  const handleClearStats = () => {
    clearKarmaStats();
    setKarmaStats([]);
    setHistoryLog([]);
    setLastVictim(null);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#181c3a] via-[#090d16] to-[#05070c]">
      {/* Header */}
      <Header
        globalCount={globalCount}
        volume={volume}
        onVolumeChange={handleVolumeChange}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onShareRoomLink={handleShareRoomLink}
        karmaCount={karmaStats.reduce((sum, s) => sum + s.struckCount, 0)}
      />

      {/* STAGE-FIRST GAME LAYOUT */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center space-y-4 px-3 py-4 sm:px-4 sm:py-6">
        {/* Top Row: Mode Switcher + Visual Kèo Badge */}
        <div className="flex flex-col items-center gap-3">
          <ModeToolbar
            mode={mode}
            onSelectMode={setMode}
            disabled={isSpinning}
          />
        </div>

        {/* CENTERPIECE INTERACTIVE ARENA STAGE */}
        {mode === "lightning" && (
          <LightningArena
            players={players}
            isSpinning={isSpinning}
            targetVictimIndex={pendingOutcome?.victimIndex ?? null}
            targetRarity={pendingOutcome?.rarity ?? null}
            pityPlayer={enablePityShield ? lastVictim : null}
            keoId={selectedKeoId}
            skinOffsets={skinOffsets}
            onCycleSkin={handleCycleSkin}
            onAddPlayer={handleQuickAddPlayer}
            onRemovePlayer={handleQuickRemovePlayer}
            onAnimationComplete={handleAnimationComplete}
          />
        )}

        {mode === "reel" && (
          <CsReelArena
            players={players}
            isSpinning={isSpinning}
            targetVictimIndex={pendingOutcome?.victimIndex ?? null}
            targetRarity={pendingOutcome?.rarity ?? null}
            keoId={selectedKeoId}
            skinOffsets={skinOffsets}
            onCycleSkin={handleCycleSkin}
            onAnimationComplete={handleAnimationComplete}
          />
        )}

        {mode === "bomb" && (
          <BombArena
            players={players}
            isSpinning={isSpinning}
            targetVictimIndex={pendingOutcome?.victimIndex ?? null}
            targetRarity={pendingOutcome?.rarity ?? null}
            keoId={selectedKeoId}
            skinOffsets={skinOffsets}
            onCycleSkin={handleCycleSkin}
            onAnimationComplete={handleAnimationComplete}
          />
        )}

        {/* SLEEK FLOATING GAME DOCK (Kèo Icons + Quick Pills + Giant Action Button) */}
        <ControlDock
          mode={mode}
          isSpinning={isSpinning}
          onStartTribulation={handleStartTribulation}
          players={players}
          onChangePlayers={setPlayers}
          selectedKeoId={selectedKeoId}
          onSelectKeoId={setSelectedKeoId}
          customKeoText={customKeoText}
          onChangeCustomKeoText={setCustomKeoText}
          enableBillSplit={enableBillSplit}
          onToggleBillSplit={setEnableBillSplit}
          billAmount={billAmount}
          onChangeBillAmount={setBillAmount}
          billSplitMode={billSplitMode}
          onChangeBillSplitMode={setBillSplitMode}
          enablePityShield={enablePityShield}
          onTogglePityShield={setEnablePityShield}
          lastVictim={lastVictim}
          savedSquads={savedSquads}
          onSaveCurrentSquad={handleSaveCurrentSquad}
          onDeleteSavedSquad={handleDeleteSavedSquad}
        />

        {/* COMPACT 1-LINE VISUAL RARITY ODDS BAR */}
        <div className="mx-auto flex flex-wrap items-center justify-center gap-2 pt-1">
          {Object.values(RARITY_TIERS).map((tier) => (
            <div
              key={tier.key}
              className="flex items-center gap-1.5 rounded-full border border-slate-800/90 bg-slate-900/70 px-2.5 py-1 text-[10px] font-bold"
              title={tier.title}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tier.color }}
              />
              <span style={{ color: tier.color }} className="font-black">
                {tier.badge}
              </span>
              <span className="font-mono text-slate-400">{tier.weight}%</span>
            </div>
          ))}
        </div>
      </main>

      {/* Verdict Poster Modal ("Sớ Độ Kiếp") */}
      <VerdictModal
        isOpen={showVerdictModal}
        onClose={() => setShowVerdictModal(false)}
        onSpinAgain={handleStartTribulation}
        outcome={pendingOutcome}
        keoId={selectedKeoId}
        keoTitle={displayKeoTitle}
        keoEmoji={activeKeo.emoji}
        actionButtonText={activeKeo.actionButtonText}
        skinOffset={
          pendingOutcome ? skinOffsets[pendingOutcome.victim] || 0 : 0
        }
        totalBill={enableBillSplit ? billAmount : undefined}
      />

      {/* Leaderboard Modal ("Bảng Phong Thần") */}
      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        stats={karmaStats}
        history={historyLog}
        onClearStats={handleClearStats}
      />
    </div>
  );
}
