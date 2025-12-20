import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real World",
  description: "A real, irreversible world. What you leave here will remain.",
  metadataBase: new URL("https://real-world.vercel.app"), // 以后你换自定义域名，再改这里
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui",
          background: "white",
        }}
      >
        {children}
      </body>
    </html>
  );
}
