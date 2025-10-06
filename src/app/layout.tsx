import type { Metadata } from "next";
import { TranslationProvider } from "@/context/TranslationContext";
import "@/style/globals.css";

export const metadata: Metadata = {
  title: "Noteria | Kosovo's AI Powered Notary App",
  icons: {
    icon: "/img/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr-TR">
      <body>
        <TranslationProvider>{children}</TranslationProvider>
      </body>
    </html>
  );
}
