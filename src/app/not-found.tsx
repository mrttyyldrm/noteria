"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";

function NotFound() {
  const { t } = useLanguage();

  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <section className="w-full flex flex-col items-center gap-4 p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <Image src="/logo.svg" alt="Logo" width={52} height={52} />
          <h1 className="text-8xl md:text-9xl font-semibold text-foreground">
            404
          </h1>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground">
            {t("4579E41AF")}
          </h2>
          <p className="text-base text-muted-foreground">{t("1574184C3")}</p>
        </div>
        <Link href="/">
          <Button>{t("2A6E49346")}</Button>
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
