"use client";

import React, { useState, useEffect } from "react";
import {
  Copy,
  Check,
  Download,
  RotateCcw,
  QrCode,
  X,
} from "lucide-react";
import { VIETQR_BANKS } from "@/data/presets";
import { TribulationOutcome } from "@/lib/rng";
import { getSavedBankConfig, saveBankConfig } from "@/lib/storage";
import ChibiAvatar from "@/components/ChibiAvatar";

interface VerdictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
  outcome: TribulationOutcome | null;
  keoId: string;
  keoTitle: string;
  keoEmoji: string;
  actionButtonText: string;
  skinOffset?: number;
  totalBill?: number;
}

export default function VerdictModal({
  isOpen,
  onClose,
  onSpinAgain,
  outcome,
  keoId,
  keoTitle,
  keoEmoji,
  actionButtonText,
  skinOffset = 0,
  totalBill,
}: VerdictModalProps) {
  const [copiedText, setCopiedText] = useState(false);
  const [showQrSetup, setShowQrSetup] = useState(false);
  const [bankBin, setBankBin] = useState("VCB");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    const saved = getSavedBankConfig();
    setBankBin(saved.bankBin || "VCB");
    setAccountNo(saved.accountNo || "");
    setAccountName(saved.accountName || "");
  }, [isOpen]);

  if (!isOpen || !outcome) return null;

  const { victim, rarity, verdictText, billShares } = outcome;

  const handleSaveBank = (
    nextBin: string,
    nextAcc: string,
    nextName: string
  ) => {
    setBankBin(nextBin);
    setAccountNo(nextAcc);
    setAccountName(nextName);
    saveBankConfig({
      bankBin: nextBin,
      accountNo: nextAcc,
      accountName: nextName,
    });
  };

  const buildShareText = () => {
    const lines = [
      `⚡📜 LỆNH ĐỘ KIẾP: ${victim.toUpperCase()} 📜⚡`,
      `${keoEmoji} Kèo: ${keoTitle}`,
      `🔥 Cấp nghiệp: [${rarity.badge}] ${rarity.title}`,
    ];

    if (billShares && billShares.length > 0 && totalBill) {
      lines.push(
        `\n💸 CHIA BILL (${totalBill.toLocaleString("vi-VN")}đ):`
      );
      billShares.forEach((s, i) => {
        lines.push(
          `  ${i + 1}. ${s.name}: ${s.amount.toLocaleString("vi-VN")}đ (${s.percentage}%) ${
            s.isPrimaryVictim ? "⚡" : ""
          }`
        );
      });
    }

    lines.push(
      `\n👉 Quay tại: ${
        typeof window !== "undefined" ? window.location.href : ""
      }`
    );
    return lines.join("\n");
  };

  const handleCopyZalo = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // ignore
    }
  };

  // Visual Wanted Poster PNG Generator
  const handleDownloadCard = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = billShares && billShares.length > 0 ? 1320 : 1080;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bgGrad = ctx.createRadialGradient(540, 420, 80, 540, 540, 850);
    bgGrad.addColorStop(0, "#23153C");
    bgGrad.addColorStop(0.55, "#0D1222");
    bgGrad.addColorStop(1, "#060810");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ornate Rarity Frame
    ctx.strokeStyle = rarity.color;
    ctx.lineWidth = 12;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Top Kèo Banner
    ctx.fillStyle = "#FACC15";
    ctx.font = "900 42px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${keoEmoji} ${keoTitle.toUpperCase()}`, 540, 130);

    // Character Portrait Circle + Fried Chibi Graphics on Canvas
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 360, 145, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(250, 204, 21, 0.14)";
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = rarity.color;
    ctx.stroke();

    // Draw Crispy Afro + Chibi Head on Canvas
    ctx.fillStyle = "#0F172A";
    ctx.beginPath();
    ctx.arc(490, 300, 48, 0, Math.PI * 2);
    ctx.arc(540, 280, 56, 0, Math.PI * 2);
    ctx.arc(590, 300, 48, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#334155";
    ctx.beginPath();
    ctx.arc(540, 360, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#FACC15";
    ctx.stroke();

    // X_X Eyes
    ctx.strokeStyle = "#FEF08A";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(495, 340);
    ctx.lineTo(520, 365);
    ctx.moveTo(520, 340);
    ctx.lineTo(495, 365);
    ctx.moveTo(560, 340);
    ctx.lineTo(585, 365);
    ctx.moveTo(585, 340);
    ctx.lineTo(560, 365);
    ctx.stroke();

    // Zigzag mouth
    ctx.beginPath();
    ctx.moveTo(505, 395);
    ctx.lineTo(525, 385);
    ctx.lineTo(540, 398);
    ctx.lineTo(555, 385);
    ctx.lineTo(575, 395);
    ctx.stroke();
    ctx.restore();

    // Red Imperial Seal Stamp
    ctx.save();
    ctx.translate(730, 270);
    ctx.rotate(-0.22);
    ctx.fillStyle = "rgba(225, 29, 72, 0.92)";
    ctx.fillRect(-110, -40, 220, 80);
    ctx.strokeStyle = "#FFE4E6";
    ctx.lineWidth = 4;
    ctx.strokeRect(-102, -32, 204, 64);
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ẤN ĐỘ KIẾP", 0, 12);
    ctx.restore();

    // Rarity Badge
    ctx.fillStyle = rarity.color;
    ctx.fillRect(350, 540, 380, 58);
    ctx.fillStyle = "#090D16";
    ctx.font = "900 30px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${rarity.badge} • ${rarity.title}`, 540, 580);

    // Victim Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 92px sans-serif";
    ctx.fillText(victim.toUpperCase(), 540, 705);

    ctx.fillStyle = "#FACC15";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText(`⚡ ${actionButtonText.toUpperCase()}!`, 540, 765);

    // Optional Bill Split Visual Bars
    if (billShares && billShares.length > 0 && totalBill) {
      billShares.slice(0, 5).forEach((share, idx) => {
        const rowY = 845 + idx * 72;
        ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
        ctx.fillRect(120, rowY - 40, 840, 54);

        const barWidth = Math.max(40, (share.percentage / 100) * 840);
        ctx.fillStyle = share.isPrimaryVictim
          ? "rgba(244, 63, 94, 0.45)"
          : "rgba(45, 212, 191, 0.25)";
        ctx.fillRect(120, rowY - 40, barWidth, 54);

        ctx.textAlign = "left";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(
          `${share.name} ${share.isPrimaryVictim ? "⚡" : ""}`,
          145,
          rowY - 4
        );

        ctx.textAlign = "right";
        ctx.fillStyle = share.isPrimaryVictim ? "#FDE047" : "#E2E8F0";
        ctx.fillText(
          `${share.amount.toLocaleString("vi-VN")}đ (${share.percentage}%)`,
          935,
          rowY - 4
        );
      });
    }

    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `so-do-kiep-${victim.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.click();
  };

  const primaryVictimShare =
    billShares?.find((s) => s.isPrimaryVictim)?.amount || totalBill || 0;

  const vietQrUrl =
    accountNo.trim().length >= 5
      ? `https://img.vietqr.io/image/${bankBin}-${accountNo.trim()}-compact2.png?amount=${primaryVictimShare}&addInfo=${encodeURIComponent(
          `${victim} do kiep`
        )}&accountName=${encodeURIComponent(accountName)}`
      : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Sớ Độ Kiếp Thiên Đình"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn"
    >
      <div
        style={{
          borderColor: rarity.color,
          boxShadow: `0 0 70px ${rarity.glow}`,
        }}
        className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border-2 bg-gradient-to-b from-[#171b30] via-[#0c101d] to-[#070911] p-5 text-white"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-800/90 text-slate-300 hover:text-white cursor-pointer"
          aria-label="Đóng"
        >
          <X className="h-4 w-4" />
        </button>

        {/* WANTED POSTER VISUAL STAGE */}
        <div className="relative flex flex-col items-center text-center">
          {/* Kèo Pill */}
          <span className="rounded-full border border-slate-700 bg-slate-900/90 px-3.5 py-1 text-xs font-extrabold text-amber-300">
            {keoEmoji} {keoTitle}
          </span>

          {/* GIANT ILLUSTRATED FRIED CHIBI + SLAMMING IMPERIAL STAMP */}
          <div className="relative my-4 flex items-center justify-center">
            <ChibiAvatar
              name={victim}
              skinOffset={skinOffset}
              mood="fried"
              keoId={keoId}
              size="xl"
            />

            {/* Red Imperial Stamp Overlay */}
            <div className="pointer-events-none absolute -right-4 -bottom-1 -rotate-12 rounded-xl border-2 border-rose-200 bg-rose-600/95 px-3 py-1 text-xs font-black tracking-widest text-white shadow-[0_6px_20px_rgba(225,29,72,0.7)]">
              ẤN ĐỘ KIẾP
            </div>
          </div>

          {/* Rarity Badge */}
          <span
            style={{ backgroundColor: rarity.color }}
            className="rounded-full px-3.5 py-0.5 text-[11px] font-black tracking-wider text-slate-950 shadow"
          >
            {rarity.badge} • {rarity.title.toUpperCase()}
          </span>

          {/* Victim Name */}
          <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_16px_rgba(250,204,21,0.45)]">
            {victim}
          </h2>

          {/* Action Callout Pill */}
          <p className="mt-1 rounded-xl bg-amber-400/15 px-3 py-1 text-xs font-extrabold text-amber-300 border border-amber-400/30">
            ⚡ {actionButtonText}!
          </p>

          {/* Compact 1-Line Comic Quote */}
          <p className="mt-2.5 line-clamp-2 text-xs text-slate-300/90 italic px-2">
            “{verdictText}”
          </p>
        </div>

        {/* VISUAL HEALTH-BAR BILL SPLIT & VIETQR */}
        {billShares && billShares.length > 0 && totalBill && (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-slate-950/90 p-3.5">
            <div className="mb-2.5 flex items-center justify-between text-xs font-black">
              <span className="text-amber-300">💸 CHIA BILL NHÂN PHẨM</span>
              <span className="font-mono text-white">
                {totalBill.toLocaleString("vi-VN")}đ
              </span>
            </div>

            <div className="space-y-1.5">
              {billShares.map((s, idx) => (
                <div
                  key={`${s.name}-${idx}`}
                  className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs"
                >
                  {/* Visual Percentage Fill Bar */}
                  <div
                    style={{ width: `${Math.max(8, s.percentage)}%` }}
                    className={`pointer-events-none absolute inset-y-0 left-0 ${
                      s.isPrimaryVictim
                        ? "bg-gradient-to-r from-rose-500/45 to-amber-500/35"
                        : "bg-teal-500/20"
                    }`}
                  />
                  <div className="relative z-10 flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-white">
                      <span>{s.name}</span>
                      {s.isPrimaryVictim && <span>⚡</span>}
                    </span>
                    <span className="font-mono text-amber-200">
                      {s.amount.toLocaleString("vi-VN")}đ ({s.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* VietQR Toggle */}
            <button
              type="button"
              onClick={() => setShowQrSetup((prev) => !prev)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 py-2 text-xs font-bold text-amber-300 hover:border-amber-400/50 cursor-pointer"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>{showQrSetup ? "Ẩn VietQR" : "Hiện mã VietQR"}</span>
            </button>

            {showQrSetup && (
              <div className="mt-2.5 space-y-2 rounded-xl bg-slate-900 p-2.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={bankBin}
                    onChange={(e) =>
                      handleSaveBank(e.target.value, accountNo, accountName)
                    }
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
                  >
                    {VIETQR_BANKS.map((b) => (
                      <option key={b.bin} value={b.bin}>
                        {b.shortName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={accountNo}
                    onChange={(e) =>
                      handleSaveBank(bankBin, e.target.value, accountName)
                    }
                    placeholder="Số TK nhận..."
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
                  />
                </div>

                {vietQrUrl && (
                  <div className="flex flex-col items-center rounded-xl bg-white p-2.5 text-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={vietQrUrl}
                      alt="VietQR"
                      className="h-44 w-auto object-contain"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ICON-DRIVEN VIRAL SHARE BUTTONS */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyZalo}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-amber-400 py-3 text-xs sm:text-sm font-black text-slate-950 shadow-lg hover:bg-amber-300 active:scale-95 cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="h-4 w-4" />
                <span>Đã Copy!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy Zalo</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadCard}
            className="flex items-center justify-center gap-1.5 rounded-2xl border border-amber-400/50 bg-amber-500/15 py-3 text-xs sm:text-sm font-extrabold text-amber-200 hover:bg-amber-500/25 active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Tải Poster PNG</span>
          </button>
        </div>

        {/* Spin Again */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onSpinAgain();
          }}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-slate-400 hover:bg-slate-800/60 hover:text-white cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Quay lại ván nữa</span>
        </button>
      </div>
    </div>
  );
}
