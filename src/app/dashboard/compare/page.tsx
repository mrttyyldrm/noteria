"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { useEffect } from "react";

function CompareDocuments() {
  const { setOpen } = useSidebar();
  const { t } = useLanguage();

  const searchParams = useSearchParams();
  const oldDocumentPath = searchParams.get("old");
  const newDocumentPath = searchParams.get("new");

  useEffect(() => {
    setOpen(false);
  }, []);

  if (!oldDocumentPath || !newDocumentPath) notFound();

  return (
    <section className="w-full h-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="relative w-full h-full"
      >
        <ResizablePanel
          defaultSize={50}
          className="overflow-hidden relative min-w-md rounded-r-0"
        >
          {oldDocumentPath && (
            <iframe
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/document?path=${oldDocumentPath}`}
              className="w-full h-full"
            />
          )}
          <Card className="absolute bottom-2 left-1/2 -translate-x-1/2 shadow-lg text-sm text-muted-foreground">
            <CardTitle className="px-4 py-2 font-medium">
              {t("537D30C54")}
            </CardTitle>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel
          defaultSize={50}
          className="overflow-hidden relative min-w-md rounded-l-0"
        >
          {newDocumentPath && (
            <iframe
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/document?path=${newDocumentPath}`}
              className="w-full h-full"
            />
          )}
          <Card className="absolute bottom-2 left-1/2 -translate-x-1/2 shadow-lg text-sm text-muted-foreground">
            <CardTitle className="px-4 py-2 font-medium">
              {t("F1D1506D7")}
            </CardTitle>
          </Card>
        </ResizablePanel>
        <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 shadow-lg z-[51]">
          <Link href="/dashboard/">
            <Button variant="outline">{t("802282309")}</Button>
          </Link>
        </Card>
      </ResizablePanelGroup>
    </section>
  );
}

export default CompareDocuments;
