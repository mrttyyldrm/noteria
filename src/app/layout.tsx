import { NotificationProvider } from "@/context/NotificationContext";
import { TranslationProvider } from "@/context/TranslationContext";
import "@/style/globals.css";
import type { Metadata } from "next";

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
    <html>
      <body>
        <TranslationProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </TranslationProvider>
      </body>
    </html>
  );
}
