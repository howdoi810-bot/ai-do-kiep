"use client";

import React, { useState } from "react";
import {
  Zap,
  Box,
  Bomb,
  Users,
  Coins,
  Shield,
  Shuffle,
  UserPlus,
  X,
  BookmarkPlus,
  Pencil,
  ChevronDown,
} from "lucide-react";
import { ArenaMode, KEO_PRESETS, SavedSquad } from "@/data/presets";

interface ControlDockProps {
  mode: ArenaMode;
  isSpinning: boolean;
  onStartTribulation: () => void;
  players: string[];
  onChangePlayers: (next: string[]) => void;
  selectedKeoId: string;
  onSelectKeoId: (id: string) => void;
  customKeoText: string;
  onChangeCustomKeoText: (val: string) => void;
  enableBillSplit: boolean;
  onToggleBillSplit: (val: boolean) => void;
  billAmount: number;
  onChangeBillAmount: (val: number) => void;
  billSplitMode: "single" | "karma";
  onChangeBillSplitMode: (mode: "single" | "karma") => void;
  enablePityShield: boolean;
  onTogglePityShield: (val: boolean) => void;
  lastVictim: string | null;
  savedSquads: SavedSquad[];
  onSaveCurrentSquad: (name: string) => void;
  onDeleteSavedSquad: (id: string) => void;
}

const QUICK_BILLS = [100000, 200000, 300000, 500000, 1000000];

export default function ControlDock({
  mode,
  isSpinning,
  onStartTribulation,
  players,
  onChangePlayers,
  selectedKeoId,
  onSelectKeoId,
  customKeoText,
  onChangeCustomKeoText,
  enableBillSplit,
  onToggleBillSplit,
  billAmount,
  onChangeBillAmount,
  billSplitMode,
  onChangeBillSplitMode,
  enablePityShield,
  onTogglePityShield,
  lastVictim,
  savedSquads,
  onSaveCurrentSquad,
  onDeleteSavedSquad,
}: ControlDockProps) {
  const [openDrawer, setOpenDrawer] = useState<
    "squad" | "bill" | "customKeo" | null
  >(null);
  const [newPlayerInput, setNewPlayerInput] = useState("");
  const [squadNameInput, setSquadNameInput] = useState("");

  const toggleDrawer = (target: "squad" | "bill" | "customKeo") => {
    setOpenDrawer((prev) => (prev === target ? null : target));
  };

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerInput.trim()) return;
    const parts = newPlayerInput
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length === 0) return;

    const merged = [...players];
    parts.forEach((p) => {
      if (
        !merged.some((existing) => existing.toLowerCase() === p.toLowerCase())
      ) {
        merged.push(p);
      }
    });
    onChangePlayers(merged.slice(0, 16));
    setNewPlayerInput("");
  };

  const handleShuffle = () => {
    const copy = [...players];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    onChangePlayers(copy);
  };

  const handleSaveSquad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!squadNameInput.trim()) return;
    onSaveCurrentSquad(squadNameInput.trim());
    setSquadNameInput("");
  };

  return (
    <section
      aria-label="Bảng điều khiển nhanh"
      className="mx-auto w-full max-w-4xl space-y-3"
    >
      {/* 1. COMPACT VISUAL KÈO ICON PILLS */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {KEO_PRESETS.map((keo) => {
          const active = selectedKeoId === keo.id && !customKeoText.trim();
          return (
            <button
              key={keo.id}
              type="button"
              disabled={isSpinning}
              onClick={() => {
                onSelectKeoId(keo.id);
                onChangeCustomKeoText("");
                if (keo.supportsBillSplit) {
                  onToggleBillSplit(true);
                }
              }}
              className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs sm:text-sm font-extrabold transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                active
                  ? "border-amber-400 bg-amber-400/20 text-white shadow-[0_0_20px_rgba(250,204,21,0.25)] scale-105"
                  : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:text-white"
              }`}
            >
              <span className="text-base sm:text-lg">{keo.emoji}</span>
              <span>{keo.shortLabel}</span>
            </button>
          );
        })}

        {/* Custom Kèo Toggle Icon Button */}
        <button
          type="button"
          disabled={isSpinning}
          onClick={() => toggleDrawer("customKeo")}
          className={`flex items-center gap-1 rounded-2xl border px-3 py-2 text-xs font-bold transition cursor-pointer ${
            customKeoText.trim() || openDrawer === "customKeo"
              ? "border-amber-400 bg-amber-500/20 text-amber-200"
              : "border-slate-800 bg-slate-900/80 text-slate-400 hover:text-white"
          }`}
          title="Tự nhập tên kèo riêng"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Tự đặt kèo</span>
        </button>
      </div>

      {/* Custom Kèo Compact Input Bar */}
      {openDrawer === "customKeo" && (
        <div className="mx-auto flex max-w-md items-center gap-2 rounded-2xl border border-amber-400/40 bg-slate-900/95 p-2 shadow-xl animate-fadeIn">
          <input
            type="text"
            autoFocus
            value={customKeoText}
            onChange={(e) => onChangeCustomKeoText(e.target.value)}
            placeholder="Nhập tên kèo (VD: Ai đi mua nước ngọt?)..."
            className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-xs sm:text-sm font-bold text-white focus:outline-none"
          />
          {customKeoText && (
            <button
              type="button"
              onClick={() => onChangeCustomKeoText("")}
              className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-300 cursor-pointer"
            >
              Xóa
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpenDrawer(null)}
            className="rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 cursor-pointer"
          >
            Xong
          </button>
        </div>
      )}

      {/* 2. SLEEK FLOATING HUD BAR + GIANT 3D ARCADE BUTTON */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-3xl border border-slate-800/90 bg-slate-900/90 p-2.5 shadow-2xl backdrop-blur-xl">
        {/* Left Quick-Config Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Squad Pill */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => toggleDrawer("squad")}
            className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm font-extrabold transition cursor-pointer ${
              openDrawer === "squad"
                ? "border-amber-400 bg-amber-500/20 text-amber-200"
                : "border-slate-700/80 bg-slate-950 text-slate-200 hover:border-slate-500"
            }`}
          >
            <Users className="h-4 w-4 text-amber-400" />
            <span>{players.length} Đạo Hữu</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>

          {/* Bill Split Pill */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => toggleDrawer("bill")}
            className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-2.5 text-xs sm:text-sm font-extrabold transition cursor-pointer ${
              enableBillSplit
                ? "border-amber-400/80 bg-amber-500/20 text-amber-200"
                : openDrawer === "bill"
                  ? "border-slate-500 bg-slate-800 text-white"
                  : "border-slate-700/80 bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Coins className="h-4 w-4 text-amber-400" />
            <span>
              {enableBillSplit
                ? `${(billAmount / 1000).toLocaleString("vi-VN")}k`
                : "Chia Bill"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>

          {/* Pity Shield 1-Tap Pill */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => onTogglePityShield(!enablePityShield)}
            className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2.5 text-xs font-extrabold transition cursor-pointer ${
              enablePityShield
                ? "border-teal-400/60 bg-teal-500/20 text-teal-200 shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                : "border-slate-800 bg-slate-950 text-slate-500 hover:text-slate-300"
            }`}
            title={
              lastVictim
                ? `Kim Bài Miễn Tử: Giảm 55% tỉ lệ trúng sét cho ${lastVictim}`
                : "Kim Bài Miễn Tử: Giảm 55% tỉ lệ bị sét đánh liên tiếp"
            }
          >
            <Shield className="h-4 w-4" />
            <span>Miễn Tử</span>
          </button>

          {/* Quick Shuffle Button */}
          <button
            type="button"
            disabled={isSpinning}
            onClick={handleShuffle}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-950 text-slate-300 hover:border-amber-400/50 hover:text-white cursor-pointer"
            title="Xáo trộn vị trí đứng"
          >
            <Shuffle className="h-4 w-4" />
          </button>
        </div>

        {/* GIANT TACTILE 3D ARCADE ACTION BUTTON */}
        <button
          type="button"
          disabled={isSpinning || players.length < 2}
          onClick={() => {
            setOpenDrawer(null);
            onStartTribulation();
          }}
          className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl border-b-4 border-amber-600 bg-gradient-to-r from-amber-400 via-amber-500 to-rose-500 px-6 py-3.5 text-base sm:text-lg font-black tracking-wide text-slate-950 shadow-[0_0_35px_rgba(250,204,21,0.45)] transition-all hover:brightness-110 active:translate-y-0.5 active:border-b-0 disabled:opacity-50 cursor-pointer"
        >
          {mode === "lightning" && <Zap className="h-6 w-6 fill-slate-950" />}
          {mode === "reel" && <Box className="h-6 w-6" />}
          {mode === "bomb" && <Bomb className="h-6 w-6" />}
          <span>
            {isSpinning
              ? "ĐANG PHÂN XỬ..."
              : mode === "lightning"
                ? "GIÁNG THIÊN LÔI"
                : mode === "reel"
                  ? "KHAI MỞ HÒM"
                  : "CHÂM NGÒI BOM"}
          </span>
        </button>
      </div>

      {/* 3. POPOVER DRAWER: SQUAD MANAGER */}
      {openDrawer === "squad" && (
        <div className="rounded-3xl border border-amber-400/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-300">
              👥 Chọn Nhanh Biệt Đội Quen Mặt
            </span>
            <button
              type="button"
              onClick={() => setOpenDrawer(null)}
              className="rounded-lg bg-slate-800 p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Saved Squads */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {savedSquads.map((sq) => (
              <div
                key={sq.id}
                className="inline-flex items-center rounded-xl border border-slate-700 bg-slate-950 text-xs"
              >
                <button
                  type="button"
                  onClick={() => onChangePlayers(sq.members)}
                  className="flex items-center gap-1.5 px-3 py-1.5 font-bold text-slate-200 hover:text-amber-300 cursor-pointer"
                >
                  <span>{sq.emoji}</span>
                  <span>{sq.name}</span>
                  <span className="text-[10px] text-slate-500">
                    ({sq.members.length})
                  </span>
                </button>
                {savedSquads.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onDeleteSavedSquad(sq.id)}
                    className="pr-2 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add / Paste Names */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <form onSubmit={handleAddPlayer} className="flex gap-1.5">
              <input
                type="text"
                value={newPlayerInput}
                onChange={(e) => setNewPlayerInput(e.target.value)}
                placeholder="Thêm tên (VD: Minh, Lan, Tuấn)..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-2 text-xs font-black text-slate-950 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Thêm</span>
              </button>
            </form>

            <form onSubmit={handleSaveSquad} className="flex gap-1.5">
              <input
                type="text"
                value={squadNameInput}
                onChange={(e) => setSquadNameInput(e.target.value)}
                placeholder="Lưu nhóm hiện tại với tên..."
                className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-bold text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-xl border border-amber-400/50 bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-300 cursor-pointer"
              >
                <BookmarkPlus className="h-3.5 w-3.5" />
                <span>Lưu</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. POPOVER DRAWER: BILL SPLIT CONFIG */}
      {openDrawer === "bill" && (
        <div className="rounded-3xl border border-amber-400/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl animate-fadeIn">
          <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300 cursor-pointer">
              <input
                type="checkbox"
                checked={enableBillSplit}
                onChange={(e) => onToggleBillSplit(e.target.checked)}
                className="h-4 w-4 rounded accent-amber-400"
              />
              <span>💸 Bật Chia Bill Nhân Phẩm & Mã VietQR</span>
            </label>
            <button
              type="button"
              onClick={() => setOpenDrawer(null)}
              className="rounded-lg bg-slate-800 p-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {QUICK_BILLS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    onToggleBillSplit(true);
                    onChangeBillAmount(amt);
                  }}
                  className={`rounded-xl border px-3 py-1.5 font-mono text-xs font-black transition cursor-pointer ${
                    enableBillSplit && billAmount === amt
                      ? "border-amber-400 bg-amber-400 text-slate-950"
                      : "border-slate-700 bg-slate-950 text-slate-300 hover:text-white"
                  }`}
                >
                  {amt / 1000}k
                </button>
              ))}
              <input
                type="number"
                step={10000}
                min={10000}
                value={billAmount}
                onChange={(e) => {
                  onToggleBillSplit(true);
                  onChangeBillAmount(Math.max(1000, Number(e.target.value) || 0));
                }}
                className="w-28 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 font-mono text-xs font-bold text-white"
              />
            </div>

            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onToggleBillSplit(true);
                  onChangeBillSplitMode("karma");
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                  billSplitMode === "karma"
                    ? "bg-amber-400 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                ⚡ Chia % Nghiệp
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleBillSplit(true);
                  onChangeBillSplitMode("single");
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                  billSplitMode === "single"
                    ? "bg-rose-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                💀 1 Chủ Chi
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
