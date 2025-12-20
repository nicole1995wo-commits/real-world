export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui" }}>
        {children}
      </body>
    </html>
  );
}
