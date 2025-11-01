"use client";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import React, { useEffect, useState } from "react";
import { notFound, useSearchParams } from "next/navigation";
import type { IDocumentConfig } from "@/context/DocumentContext";
import CompareManagementsSkeleton from "./loading";
import useAPI from "@/hooks/useAPI";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useSidebar } from "@/components/ui/sidebar";
import { useNotification } from "@/context/NotificationContext";
import { Card, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function CompareDocuments() {
  const { GET } = useAPI();
  const { setOpen } = useSidebar();
  const { showNotification } = useNotification();

  const searchParams = useSearchParams();
  const oldDocumentPath = searchParams.get("old");
  const newDocumentPath = searchParams.get("new");

  const [documents, setdocuments] = useState<{
    old: IDocumentConfig;
    new: IDocumentConfig;
  } | null>(null);

  const compareDocuments = () => {
    if (!oldDocumentPath || !newDocumentPath) return;

    GET(
      "CompareDoc",
      { OldPath: oldDocumentPath, NewPath: newDocumentPath },
      (data) => {
        setdocuments(data);
      }
    );
  };

  useEffect(() => {
    compareDocuments();
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
          <DocumentEditor
            id="oldEditor"
            documentServerUrl="https://384311e4.docs.onlyoffice.com"
            config={documents.old}
            onLoadComponentError={(_, message) =>
              showNotification(message, "error")
            }
          />
          <Card className="absolute bottom-2 left-1/2 -translate-x-1/2 shadow-lg text-sm text-muted-foreground">
            <CardTitle className="px-4 py-2 font-medium">
              Old Document
            </CardTitle>
          </Card>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} className="relative min-w-md">
          <DocumentEditor
            id="newEditor"
            documentServerUrl="https://384311e4.docs.onlyoffice.com"
            config={documents.new}
            onLoadComponentError={(_, message) =>
              showNotification(message, "error")
            }
          />
          <Card className="absolute bottom-2 left-1/2 -translate-x-1/2 shadow-lg text-sm text-muted-foreground">
            <CardTitle className="px-4 py-2 font-medium">
              New Document
            </CardTitle>
          </Card>
        </ResizablePanel>
        <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 shadow-lg">
          <Link href="/dashboard/">
            <Button variant="outline">Close Documents</Button>
          </Link>
        </Card>
      </ResizablePanelGroup>
    </section>
  );
}

export default CompareDocuments;
