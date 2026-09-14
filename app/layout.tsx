import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MEDIGRAPH · 医疗知识图谱",
  description: "基于 Next.js 的交互式医疗知识图谱数据大屏",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
