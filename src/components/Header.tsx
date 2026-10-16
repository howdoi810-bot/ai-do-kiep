"use client";

import React, { useState } from "react";
import {
  Zap,
  Trophy,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Sparkles,
} from "lucide-react";

interface HeaderProps {
  globalCount: number;
  volume: number;
  onVolumeChange: (val: number) => void;
  onOpenLeaderboard: () => void;
  onShareRoomLink: () => void;
  karmaCount: number;
}

export default function Header({
  globalCount,
  volume,
  onVolumeChange,
  onOpenLeaderboard,
  onShareRoomLink,
  karmaCount,
}: HeaderProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showVolumePopover, setShowVolumePopover] = useState(false);

  const handleShare = () => {
    onShareRoomLink();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-amber-500/15 bg-[#090d16]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Brand Identity */}
        <a
          href="/"
          className="group flex items-center gap-3 text-left focus:outline-none"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/40 bg-gradient-to-br from-amber-500/20 via-purple-600/20 to-rose-600/20 shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-transform group-hover:scale-105">
            <Zap className="h-5 w-5 text-amber-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold tracking-[0.2em] text-amber-400/90 uppercase">
                ĐÀI THIÊN LÔI
              </span>
              <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300 border border-rose-500/30">
                VIRAL VN
              </span>
            </div>
            <p className="text-lg font-extrabold tracking-tight text-white sm:text-xl">
              AI ĐỘ KIẾP?
            </p>
          </div>
        </a>

        {/* Global Counter Pill (Desktop) */}
        <div
          className="hidden md:flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/80 px-3.5 py-1.5 text-xs text-slate-300 shadow-inner"
          title="Tổng số lượt Thiên Lôi đã giáng xuống trên toàn cõi"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Lượt độ kiếp:</span>
          <strong className="font-mono text-sm font-bold text-amber-300">
            {globalCount.toLocaleString("vi-VN")}
          </strong>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Share Squad / Kèo URL */}
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-800/70 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-amber-400/50 hover:bg-slate-800 hover:text-white active:scale-95 cursor-pointer"
            title="Copy link kèo & danh sách nhóm để gửi vào Zalo"
          >
            {copiedLink ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span className="hidden sm:inline text-emerald-300">
                  Đã lưu link kèo!
                </span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-amber-400" />
                <span className="hidden sm:inline">Gửi Link Nhóm</span>
              </>
            )}
          </button>

          {/* Bảng Phong Thần (Leaderboard) */}
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="relative flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/20 active:scale-95 cursor-pointer"
            title="Bảng Phong Thần — Xem ai là Thánh Nhọ của nhóm"
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            <span className="hidden sm:inline">Bảng Phong Thần</span>
            {karmaCount > 0 && (
              <span className="ml-0.5 rounded-full bg-amber-400 px-1.5 py-0.2 text-[10px] font-black text-slate-950">
                {karmaCount}
              </span>
            )}
          </button>

          {/* Volume Control */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVolumePopover((prev) => !prev)}
              onDoubleClick={() => onVolumeChange(volume > 0 ? 0 : 0.75)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/70 text-slate-200 transition hover:border-slate-500 hover:text-white cursor-pointer"
              aria-label="Âm lượng hiệu ứng"
              title="Chỉnh âm lượng sấm sét & mở hòm"
            >
              {volume <= 0 ? (
                <VolumeX className="h-4 w-4 text-rose-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-emerald-400" />
              )}
            </button>

            {showVolumePopover && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-700 bg-slate-900/95 p-3.5 shadow-2xl backdrop-blur-xl">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Âm lượng Thiên Lôi
                  </span>
                  <span className="font-mono font-bold text-amber-400">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(volume * 100)}
                  onChange={(e) =>
                    onVolumeChange(parseInt(e.target.value, 10) / 100)
                  }
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-700 accent-amber-400"
                />
                <div className="mt-2.5 flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onVolumeChange(0)}
                    className="flex-1 rounded-lg bg-slate-800 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700 cursor-pointer"
                  >
                    Tắt tiếng
                  </button>
                  <button
                    type="button"
                    onClick={() => onVolumeChange(0.8)}
                    className="flex-1 rounded-lg bg-amber-500/20 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/30 cursor-pointer"
                  >
                    Mặc định (80%)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
