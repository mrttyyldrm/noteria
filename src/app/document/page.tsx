"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import useFetch from "@/hooks/useFetch";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { FileClock, FileX } from "lucide-react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface IDocumentConfig {
  type: string;
  document: {
    fileType: string;
    title: string;
    url: string;
    key: string;
    permissions: {
      edit: boolean;
      download: boolean;
      print: boolean;
    };
  };
  editorConfig: {
    mode: string;
    callbackUrl: string;
  };
  token: string;
}

interface IDocumentDetails {
  url: string;
  config: IDocumentConfig;
  editable: boolean;
}

function Document() {
  const { t } = useLanguage();
  const { showNotification } = useNotification();

  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const path = searchParams.get("path");
  const mode = searchParams.get("mode");

  const { fetch: fetchDocumentDetails } = useFetch("GET", "GetDocDetails");
  const { fetch: fetchOpenDocument } = useFetch("GET", "OpenDoc");

  const [documentDetails, setDocumentDetails] =
    useState<IDocumentDetails | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isTimeout, setIsTimeout] = useState<boolean>(false);

  const getDocumentDetails = () => {
    if (!id && !path) return;

    fetchDocumentDetails({
      params: {
        DocID: id || path,
        ...(mode ? { mode } : { mode: "view" }),
      },
      onSuccess: (data: IDocumentDetails) => {
        setDocumentDetails(data);
      },
      onError: () => {
        notFound();
      },
    });
  };

  useEffect(() => {
    if (!documentDetails || isReady) return;

    const timer = setTimeout(() => {
      setIsTimeout(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [documentDetails, isReady]);

  useEffect(() => {
    if (!isReady) return;

    fetchOpenDocument({
      params: { DocID: id },
    });
  }, [isReady]);

  useEffect(() => {
    getDocumentDetails();
  }, []);

  if (isNaN(Number(id))) notFound();

  return (
    <main className="fixed w-full h-full">
      {(!isReady || !documentDetails) && !isTimeout && (
        <Skeleton className="absolute top-0 left-0 w-full h-full rounded-t-none z-50 flex justify-center items-center">
          <Empty className="p-2">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-muted">
                <FileClock />
              </EmptyMedia>
              <EmptyTitle>{t("970D0B4CE")}</EmptyTitle>
              <EmptyDescription>{t("A08D6A172")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </Skeleton>
      )}

      {isTimeout && (
        <div className="bg-card absolute top-0 left-0 w-full h-full rounded-t-none z-50 flex justify-center items-center">
          <Empty className="p-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileX />
              </EmptyMedia>
              <EmptyTitle>{t("95E466704")}</EmptyTitle>
              <EmptyDescription>{t("9EE5E3B61")}</EmptyDescription>
            </EmptyHeader>
            {(documentDetails?.url || documentDetails?.config.document.url) && (
              <EmptyContent>
                <p className="text-center text-sm text-muted-foreground">
                  {t("BC05B5A8B")}
                </p>
                <Link
                  href={
                    documentDetails.url || documentDetails.config.document.url
                  }
                >
                  <Button>{t("56BE8D0E4")}</Button>
                </Link>
              </EmptyContent>
            )}
          </Empty>
        </div>
      )}

      {documentDetails?.config && (
        <div
          className={`w-full h-full flex flex-col overflow-hidden ${
            !isReady ? "opacity-0" : ""
          }`}
        >
          <DocumentEditor
            id="editor"
            documentServerUrl="https://384311e4.docs.onlyoffice.com"
            config={documentDetails.config}
            events_onAppReady={() => setIsReady(true)}
            onLoadComponentError={() => showNotification("894FF0F4F")}
          />
        </div>
      )}

      {documentDetails?.url && (
        <iframe
          src={documentDetails.url}
          className="w-full h-full"
          onLoad={() => setIsReady(true)}
          onError={() => showNotification("894FF0F4F")}
        />
      )}
    </main>
  );
}

export default Document;
