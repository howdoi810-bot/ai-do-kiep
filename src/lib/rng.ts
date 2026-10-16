import { RARITY_TIERS, RarityKey, RarityTier } from "@/data/presets";

export interface BillShareItem {
  name: string;
  amount: number;
  percentage: number;
  isPrimaryVictim: boolean;
  rarity: RarityTier;
}

export interface TribulationOutcome {
  victim: string;
  victimIndex: number;
  rarity: RarityTier;
  verdictText: string;
  pityAppliedTo: string | null;
  billShares?: BillShareItem[];
}

function cryptoRandomFloat(): number {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xffffffff + 1);
  }
  return Math.random();
}

export function rollRarityTier(): RarityTier {
  const tiers = Object.values(RARITY_TIERS);
  const totalWeight = tiers.reduce((acc, t) => acc + t.weight, 0);
  let roll = cryptoRandomFloat() * totalWeight;

  for (const tier of tiers) {
    if (roll < tier.weight) {
      return tier;
    }
    roll -= tier.weight;
  }
  return RARITY_TIERS.rare;
}

export function rollSpecificRarityByIndex(index: number): RarityTier {
  const keys: RarityKey[] = ["common", "rare", "epic", "legendary", "mythic"];
  return RARITY_TIERS[keys[index % keys.length]];
}

export function pickVictimWithFairness(
  players: string[],
  lastVictim: string | null,
  enablePityShield: boolean
): { victim: string; victimIndex: number; pityAppliedTo: string | null } {
  if (players.length === 0) {
    return { victim: "Đạo Hữu", victimIndex: 0, pityAppliedTo: null };
  }
  if (players.length === 1) {
    return { victim: players[0], victimIndex: 0, pityAppliedTo: null };
  }

  let pityAppliedTo: string | null = null;
  const weights = players.map((name) => {
    if (
      enablePityShield &&
      lastVictim &&
      name.trim().toLowerCase() === lastVictim.trim().toLowerCase()
    ) {
      pityAppliedTo = name;
      return 0.45; // -55% strike chance with Kim Bài Miễn Tử
    }
    return 1.0;
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let r = cryptoRandomFloat() * totalWeight;

  for (let i = 0; i < players.length; i++) {
    if (r < weights[i]) {
      return { victim: players[i], victimIndex: i, pityAppliedTo };
    }
    r -= weights[i];
  }

  const fallbackIdx = Math.floor(cryptoRandomFloat() * players.length);
  return {
    victim: players[fallbackIdx],
    victimIndex: fallbackIdx,
    pityAppliedTo,
  };
}

/**
 * Splits a VND bill across all players according to "Độ Nghiệp" (Karma Split):
 * - If mode === "single": The primary victim pays 100%.
 * - If mode === "karma": The primary victim gets the heaviest Karma multiplier (e.g. 35-50%),
 *   while other players roll random smaller weights, all rounded cleanly to 1,000đ increments.
 */
export function calculateKarmaBillSplit(
  players: string[],
  primaryVictimIndex: number,
  totalBill: number,
  splitMode: "single" | "karma",
  primaryRarity: RarityTier
): BillShareItem[] {
  const cleanBill = Math.max(1000, Math.round(totalBill / 1000) * 1000);

  if (splitMode === "single" || players.length <= 1) {
    return players.map((name, idx) => ({
      name,
      amount: idx === primaryVictimIndex ? cleanBill : 0,
      percentage: idx === primaryVictimIndex ? 100 : 0,
      isPrimaryVictim: idx === primaryVictimIndex,
      rarity:
        idx === primaryVictimIndex ? primaryRarity : RARITY_TIERS.common,
    }));
  }

  // Generate raw weights where primaryVictim has highest weight (2.6x to 3.8x)
  const rawWeights = players.map((_, idx) => {
    if (idx === primaryVictimIndex) {
      return 2.8 + cryptoRandomFloat() * 1.2;
    }
    return 0.4 + cryptoRandomFloat() * 1.1;
  });

  const weightSum = rawWeights.reduce((a, b) => a + b, 0);
  const totalUnits = Math.round(cleanBill / 1000); // work in 1,000đ units

  const allocatedUnits = rawWeights.map((w) =>
    Math.max(1, Math.floor((w / weightSum) * totalUnits))
  );

  let currentUnitSum = allocatedUnits.reduce((a, b) => a + b, 0);
  // Assign any remainder units to the primary victim (or adjust if over)
  const diff = totalUnits - currentUnitSum;
  allocatedUnits[primaryVictimIndex] = Math.max(
    1,
    allocatedUnits[primaryVictimIndex] + diff
  );

  // Recalculate sum just in case
  currentUnitSum = allocatedUnits.reduce((a, b) => a + b, 0);
  if (currentUnitSum !== totalUnits) {
    allocatedUnits[0] += totalUnits - currentUnitSum;
  }

  return players
    .map((name, idx) => {
      const amount = allocatedUnits[idx] * 1000;
      const percentage = Math.round((amount / cleanBill) * 100);
      return {
        name,
        amount,
        percentage,
        isPrimaryVictim: idx === primaryVictimIndex,
        rarity:
          idx === primaryVictimIndex
            ? primaryRarity
            : allocatedUnits[idx] / totalUnits > 0.22
              ? RARITY_TIERS.epic
              : RARITY_TIERS.rare,
      };
    })
    .sort((a, b) => b.amount - a.amount);
}
