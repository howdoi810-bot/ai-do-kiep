import type { Metadata } from "next";
import { Be_Vietnam_Pro, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-be-vietnam",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "700", "800"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ai Độ Kiếp? — Đài Thiên Lôi Chọn Người Gánh Kèo & Chia Bill Nhân Phẩm",
  description:
    "Ai xuống sảnh lấy trà sữa? Ai trả tiền chầu này? Ai uống ly phạt? Mở Hòm Tế Thần & Giáng Thiên Lôi phân xử công bằng trong 6 giây! Miễn phí, không cần đăng nhập.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Ai Độ Kiếp? — Đài Thiên Lôi Chọn Người Gánh Kèo & Chia Bill Nhân Phẩm",
    description:
      "Ai xuống sảnh lấy trà sữa? Ai trả chầu này? Giáng Thiên Lôi phân xử công bằng trong 6 giây!",
    siteName: "Ai Độ Kiếp?",
    locale: "vi_VN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#070a12] text-slate-100 antialiased selection:bg-amber-400 selection:text-slate-950">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
