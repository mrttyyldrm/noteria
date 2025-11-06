"use client";

import CompareManagementsSkeleton from "./loading";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import type { IDocumentConfig } from "@/context/DocumentContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import useFetch from "@/hooks/useFetch";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { FileClock } from "lucide-react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function CompareDocuments() {
  const { setOpen } = useSidebar();
  const { t } = useLanguage();
  const { showNotification } = useNotification();

  const compareDocuments = useFetch("GET", "CompareDoc");

  const searchParams = useSearchParams();
  const oldDocumentPath = searchParams.get("old");
  const newDocumentPath = searchParams.get("new");

  const [documents, setdocuments] = useState<{
    old: IDocumentConfig;
    new: IDocumentConfig;
  } | null>(null);

  const [isReady, setIsReady] = useState<{ old: boolean; new: boolean }>({
    old: false,
    new: false,
  });

  const handleCompareDocuments = () => {
    if (!oldDocumentPath || !newDocumentPath) return;

    compareDocuments.fetch({
      params: { OldPath: oldDocumentPath, NewPath: newDocumentPath },
      onSuccess: (data) => {
        setdocuments(data);
      },
    });
  };

  useEffect(() => {
    handleCompareDocuments();
    setOpen(false);
  }, []);

  if (!oldDocumentPath || !newDocumentPath) notFound();

  if (!documents) {
    return <CompareManagementsSkeleton />;
  }

  return (
    <section className="w-full h-full">
      <ResizablePanelGroup
        direction="horizontal"
        className="relative w-full h-full"
      >
        <ResizablePanel defaultSize={50} className="relative min-w-md">
          {!isReady.old && (
            <Skeleton className="absolute top-0 left-0 w-full h-full rounded-t-none z-50 flex justify-center items-center">
              <Empty className="p-2">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-white/20">
                    <FileClock />
                  </EmptyMedia>
                  <EmptyTitle>{t("970D0B4CE")}</EmptyTitle>
                  <EmptyDescription>{t("A08D6A172")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Skeleton>
          )}
          <div
            className={`w-full h-full flex flex-col rounded-b-lg overflow-hidden ${
              !isReady.old ? "opacity-0" : ""
            }`}
          >
            <DocumentEditor
              id="oldEditor"
              documentServerUrl="https://384311e4.docs.onlyoffice.com"
              config={documents.old}
              events_onAppReady={() =>
                setIsReady((prev) => ({ ...prev, old: true }))
              }
              onLoadComponentError={(_, message) =>
                showNotification(message, "error")
              }
            />
            <Card className="absolute bottom-2 left-1/2 -translate-x-1/2 shadow-lg text-sm text-muted-foreground">
              <CardTitle className="px-4 py-2 font-medium">
                {t("537D30C54")}
              </CardTitle>
            </Card>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="relative min-w-md">
          {!isReady.new && (
            <Skeleton className="absolute top-0 left-0 w-full h-full rounded-t-none z-50 flex justify-center items-center">
              <Empty className="p-2">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-white/20">
                    <FileClock />
                  </EmptyMedia>
                  <EmptyTitle>{t("970D0B4CE")}</EmptyTitle>
                  <EmptyDescription>{t("A08D6A172")}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Skeleton>
          )}
          <div
            className={`w-full h-full flex flex-col rounded-b-lg overflow-hidden ${
              !isReady.new ? "opacity-0" : ""
            }`}
          >
            <DocumentEditor
              id="newEditor"
              documentServerUrl="https://384311e4.docs.onlyoffice.com"
              config={documents.new}
              events_onAppReady={() =>
                setIsReady((prev) => ({ ...prev, new: true }))
              }
              onLoadComponentError={(_, message) =>
                showNotification(message, "error")
              }
            />
            <Card className="absolute bottom-2 left-1/2 -translate-x-1/2 shadow-lg text-sm text-muted-foreground">
              <CardTitle className="px-4 py-2 font-medium">
                {t("F1D1506D7")}
              </CardTitle>
            </Card>
          </div>
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
