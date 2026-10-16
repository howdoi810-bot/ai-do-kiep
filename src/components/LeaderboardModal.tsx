"use client";

import React from "react";
import { Trophy, Skull, Shield, Trash2, X, Clock } from "lucide-react";
import { RARITY_TIERS } from "@/data/presets";
import { HistoryRecord, PlayerKarmaStat } from "@/lib/storage";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerKarmaStat[];
  history: HistoryRecord[];
  onClearStats: () => void;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
  stats,
  history,
  onClearStats,
}: LeaderboardModalProps) {
  if (!isOpen) return null;

  const topVictim = stats.length > 0 ? stats[0] : null;
  const luckiest =
    stats.length > 1
      ? [...stats].sort(
          (a, b) =>
            b.survivedCount - a.survivedCount || a.struckCount - b.struckCount
        )[0]
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bảng Phong Thần"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#13192b] to-[#090d16] p-5 sm:p-7 text-white shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                BẢNG PHONG THẦN • SỔ NAM TÀO
              </h2>
              <p className="text-xs text-slate-400">
                Thống kê nhân phẩm của các đạo hữu trên thiết bị này
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Highlight Cards: Thánh Nhọ vs Con Cưng */}
        {topVictim && (
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4">
              <div className="flex items-center gap-2 text-xs font-extrabold text-rose-300 uppercase">
                <Skull className="h-4 w-4" />
                <span>Thánh Nhọ Tối Thượng</span>
              </div>
              <p className="mt-1 text-2xl font-black text-white">
                {topVictim.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-300">
                Đã bị sét đánh{" "}
                <strong className="text-rose-300">
                  {topVictim.struckCount} lần
                </strong>{" "}
                • Né được {topVictim.survivedCount} lần
              </p>
            </div>

            {luckiest && (
              <div className="rounded-2xl border border-teal-500/40 bg-teal-950/30 p-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-teal-300 uppercase">
                  <Shield className="h-4 w-4" />
                  <span>Con Cưng Của Trời</span>
                </div>
                <p className="mt-1 text-2xl font-black text-white">
                  {luckiest.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-300">
                  Né thành công{" "}
                  <strong className="text-teal-300">
                    {luckiest.survivedCount} kiếp nạn
                  </strong>{" "}
                  • Chỉ dính {luckiest.struckCount} lần
                </p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Table */}
        {stats.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center text-sm text-slate-400">
            Chưa có lượt độ kiếp nào được ghi vào Sổ Nam Tào. Hãy giáng một đạo Thiên Lôi ngay!
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
              Bảng Xếp Hạng Độ Nghiệp
            </h3>
            {stats.map((player, idx) => {
              const tier =
                RARITY_TIERS[player.highestRarity] || RARITY_TIERS.common;
              return (
                <div
                  key={player.name}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs font-black ${
                        idx === 0
                          ? "bg-rose-500 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="font-extrabold text-white">
                      {player.name}
                    </span>
                    <span
                      style={{ backgroundColor: tier.color }}
                      className="rounded px-1.5 py-0.5 text-[10px] font-black text-slate-950"
                    >
                      {tier.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-rose-300">
                      ⚡ Độ kiếp: <strong>{player.struckCount}</strong>
                    </span>
                    <span className="text-teal-300">
                      🛡️ Né: <strong>{player.survivedCount}</strong>
                    </span>
                    {player.totalBillPaid > 0 && (
                      <span className="text-amber-300">
                        💸 {player.totalBillPaid.toLocaleString("vi-VN")}đ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>Lịch Sử Giáng Trần Gần Đây</span>
            </h3>
            <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span>{h.keoEmoji}</span>
                    <span className="text-slate-300">{h.keoLabel}:</span>
                    <strong className="text-white">{h.victim}</strong>
                  </div>
                  <span
                    style={{ color: h.rarityColor }}
                    className="font-mono text-[11px] font-bold"
                  >
                    [{h.rarityBadge}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {stats.length > 0 && (
          <div className="mt-6 flex justify-between border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClearStats}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-500/20 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Xóa Sổ Nam Tào (Reset nhân phẩm)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
