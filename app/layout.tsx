import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real World",
  description: "A real, irreversible world. What you leave here will remain.",
  metadataBase: new URL("https://worldisreal.com"), // 你域名生效后就用这个
  openGraph: {
    title: "Real World",
    description: "A real, irreversible world. What you leave here will remain.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Real World",
    description: "A real, irreversible world. What you leave here will remain.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
