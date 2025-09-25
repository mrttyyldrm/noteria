import type { Metadata } from "next";
import Script from "next/script";
import { ToastProvider } from "@/context/ToastContext";
import "@/style/globals.css";

export const metadata: Metadata = {
  title: "SENTI | Yangın Keşif Asistanı",
  description:
    "SENTI Yangın Keşif Asistanı, Aspire Ekibi tarafından TEKNOFEST Geleceğin Sürdürülebilir Şehirleri Hackathonu Yarışması kapsamında geliştirilmektedir.",
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
        <ToastProvider>{children}</ToastProvider>
        <Script src="https://kit.fontawesome.com/9ed0001a15.js" />
      </body>
    </html>
  );
}
