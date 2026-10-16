"use client";

import { DEFAULT_SQUADS, RarityKey, SavedSquad } from "@/data/presets";

export interface PlayerKarmaStat {
  name: string;
  struckCount: number;
  survivedCount: number;
  totalBillPaid: number;
  lastStruckAt: string | null;
  highestRarity: RarityKey;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  keoLabel: string;
  keoEmoji: string;
  victim: string;
  rarityBadge: string;
  rarityColor: string;
  mode: string;
  totalPlayers: number;
  billAmount?: number;
}

export interface BankConfig {
  bankBin: string;
  accountNo: string;
  accountName: string;
}

const KEYS = {
  GLOBAL_COUNTER: "adk_total_spins",
  SAVED_SQUADS: "adk_saved_squads",
  KARMA_STATS: "adk_karma_stats",
  HISTORY: "adk_history_log",
  LAST_VICTIM: "adk_last_victim",
  BANK_CONFIG: "adk_bank_config",
};

const RARITY_RANK: Record<RarityKey, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythic: 5,
};

export function getGlobalSpinCount(): number {
  if (typeof window === "undefined") return 148290;
  const raw = window.localStorage.getItem(KEYS.GLOBAL_COUNTER);
  if (!raw) {
    const seed = 148290 + Math.floor(Math.random() * 450);
    window.localStorage.setItem(KEYS.GLOBAL_COUNTER, String(seed));
    return seed;
  }
  return parseInt(raw, 10) || 148290;
}

export function incrementGlobalSpinCount(): number {
  const next = getGlobalSpinCount() + 1;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEYS.GLOBAL_COUNTER, String(next));
  }
  return next;
}

export function getSavedSquads(): SavedSquad[] {
  if (typeof window === "undefined") return DEFAULT_SQUADS;
  try {
    const raw = window.localStorage.getItem(KEYS.SAVED_SQUADS);
    if (!raw) return DEFAULT_SQUADS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SQUADS;
  } catch {
    return DEFAULT_SQUADS;
  }
}

export function saveSquadToStorage(squad: SavedSquad): SavedSquad[] {
  const current = getSavedSquads();
  const filtered = current.filter((s) => s.id !== squad.id);
  const updated = [squad, ...filtered].slice(0, 12);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEYS.SAVED_SQUADS, JSON.stringify(updated));
  }
  return updated;
}

export function deleteSquadFromStorage(id: string): SavedSquad[] {
  const current = getSavedSquads().filter((s) => s.id !== id);
  const next = current.length > 0 ? current : DEFAULT_SQUADS;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEYS.SAVED_SQUADS, JSON.stringify(next));
  }
  return next;
}

export function getLastVictim(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(KEYS.LAST_VICTIM);
}

export function getKarmaLeaderboard(): PlayerKarmaStat[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEYS.KARMA_STATS);
    if (!raw) return [];
    const map: Record<string, PlayerKarmaStat> = JSON.parse(raw);
    return Object.values(map).sort(
      (a, b) => b.struckCount - a.struckCount || b.totalBillPaid - a.totalBillPaid
    );
  } catch {
    return [];
  }
}

export function getHistoryLog(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function recordTribulationResult(params: {
  players: string[];
  victim: string;
  rarityKey: RarityKey;
  rarityBadge: string;
  rarityColor: string;
  keoLabel: string;
  keoEmoji: string;
  mode: string;
  victimBillPaid?: number;
}) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(KEYS.LAST_VICTIM, params.victim);

  // Update Karma Stats
  let statsMap: Record<string, PlayerKarmaStat> = {};
  try {
    const existing = window.localStorage.getItem(KEYS.KARMA_STATS);
    if (existing) statsMap = JSON.parse(existing);
  } catch {
    statsMap = {};
  }

  const nowIso = new Date().toISOString();

  params.players.forEach((player) => {
    const key = player.trim();
    if (!key) return;
    const isVictim = key.toLowerCase() === params.victim.trim().toLowerCase();
    const prev = statsMap[key] || {
      name: key,
      struckCount: 0,
      survivedCount: 0,
      totalBillPaid: 0,
      lastStruckAt: null,
      highestRarity: "common" as RarityKey,
    };

    if (isVictim) {
      prev.struckCount += 1;
      prev.lastStruckAt = nowIso;
      prev.totalBillPaid += params.victimBillPaid || 0;
      if (RARITY_RANK[params.rarityKey] > RARITY_RANK[prev.highestRarity]) {
        prev.highestRarity = params.rarityKey;
      }
    } else {
      prev.survivedCount += 1;
    }

    statsMap[key] = prev;
  });

  window.localStorage.setItem(KEYS.KARMA_STATS, JSON.stringify(statsMap));

  // Prepend to History Log
  const history = getHistoryLog();
  const newRecord: HistoryRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: nowIso,
    keoLabel: params.keoLabel,
    keoEmoji: params.keoEmoji,
    victim: params.victim,
    rarityBadge: params.rarityBadge,
    rarityColor: params.rarityColor,
    mode: params.mode,
    totalPlayers: params.players.length,
    billAmount: params.victimBillPaid,
  };

  window.localStorage.setItem(
    KEYS.HISTORY,
    JSON.stringify([newRecord, ...history].slice(0, 30))
  );
}

export function clearKarmaStats() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEYS.KARMA_STATS);
  window.localStorage.removeItem(KEYS.HISTORY);
  window.localStorage.removeItem(KEYS.LAST_VICTIM);
}

export function getSavedBankConfig(): BankConfig {
  if (typeof window === "undefined") {
    return { bankBin: "VCB", accountNo: "", accountName: "" };
  }
  try {
    const raw = window.localStorage.getItem(KEYS.BANK_CONFIG);
    if (!raw) return { bankBin: "VCB", accountNo: "", accountName: "" };
    return JSON.parse(raw);
  } catch {
    return { bankBin: "VCB", accountNo: "", accountName: "" };
  }
}

export function saveBankConfig(config: BankConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEYS.BANK_CONFIG, JSON.stringify(config));
}
