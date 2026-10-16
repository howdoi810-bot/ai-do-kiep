"use client";

import React from "react";
import { Zap, Box, Bomb } from "lucide-react";
import { ArenaMode } from "@/data/presets";

interface ModeToolbarProps {
  mode: ArenaMode;
  onSelectMode: (mode: ArenaMode) => void;
  disabled?: boolean;
}

const MODES: {
  key: ArenaMode;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    key: "lightning",
    label: "Đài Thiên Lôi",
    sublabel: "Sét đánh né khiên",
    icon: <Zap className="h-4 w-4" />,
    accent: "from-amber-500/25 to-rose-500/20 border-amber-400/60 text-amber-200",
  },
  {
    key: "reel",
    label: "Hòm Tế Thần",
    sublabel: "Mở hòm CS2",
    icon: <Box className="h-4 w-4" />,
    accent: "from-purple-500/25 to-indigo-500/20 border-purple-400/60 text-purple-200",
  },
  {
    key: "bomb",
    label: "Truyền Bom",
    sublabel: "Bom nổ chậm",
    icon: <Bomb className="h-4 w-4" />,
    accent: "from-rose-500/25 to-orange-500/20 border-rose-400/60 text-rose-200",
  },
];

export default function ModeToolbar({
  mode,
  onSelectMode,
  disabled,
}: ModeToolbarProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-1.5">
      <div
        role="group"
        aria-label="Chọn pháp trận độ kiếp"
        className="grid w-full grid-cols-3 gap-2 rounded-2xl border border-slate-800/90 bg-slate-900/80 p-1.5 shadow-xl backdrop-blur-md"
      >
        {MODES.map((item) => {
          const active = mode === item.key;
          return (
            <button
              key={item.key}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onSelectMode(item.key)}
              className={`group flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 rounded-xl border px-3 py-2.5 text-center sm:text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                active
                  ? `bg-gradient-to-r ${item.accent} shadow-[0_0_20px_rgba(250,204,21,0.12)]`
                  : "border-transparent bg-transparent text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                  active
                    ? "border-current/30 bg-white/10 text-white"
                    : "border-slate-700/70 bg-slate-800/80 text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {item.icon}
              </span>
              <div className="leading-tight">
                <div className="text-xs sm:text-sm font-bold">{item.label}</div>
                <div className="hidden sm:block text-[11px] opacity-75">
                  {item.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
