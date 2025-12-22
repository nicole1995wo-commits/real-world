import "./globals.css";

export const metadata = {
  title: "Real World",
  description: "A real, irreversible world."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  );
}
