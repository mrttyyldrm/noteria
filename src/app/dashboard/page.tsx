"use client";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useState, useEffect } from "react";
import useAPI from "@/hooks/useAPI";
import { useDocument } from "@/context/DocumentContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { File } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card } from "@/components/ui/card";
import { useNotification } from "@/context/NotificationContext";

function DocumentManagement() {
  const { POST } = useAPI();
  const { showNotification } = useNotification();
  const { selectedDocument, documents } = useDocument();

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDocumentSaved, setIsDocumentSaved] = useState<boolean>(false);

  const isDocumentSelected =
    selectedDocument !== null && selectedDocument.config;

  const completeDocument = () => {
    if (!selectedDocument || isLoading || !isDocumentSaved) return;

    // const completeDocumentData = {
    //   docID: selectedDocument.documentID,
    //   attachments: formik.values,
    // };

    setIsLoading(true);
    POST("CompleteDocument", {}, () => {
      setIsLoading(false);
      showNotification("Document completed successfully", "success");
    });
  };

  useEffect(() => {
    setIsReady(false);
    setIsDocumentSaved(false);

    console.log("TEST", selectedDocument);
  }, [selectedDocument]);

  return (
    <section className="relative w-full h-full gap-4 overflow-hidden flex justify-center items-center">
      {isDocumentSelected && selectedDocument.config ? (
        <>
          {!isReady && (
            <Skeleton className="absolute top-0 left-0 w-full h-full rounded-t-none z-50" />
          )}
          <div
            className={`relative w-full h-full flex flex-col rounded-b-lg overflow-hidden ${
              !isReady ? "opacity-0" : ""
            }`}
          >
            <DocumentEditor
              id="docxEditor"
              documentServerUrl="https://384311e4.docs.onlyoffice.com"
              config={selectedDocument.config}
              events_onDocumentReady={() => setIsReady(true)}
              events_onRequestSaveAs={() => setIsDocumentSaved(true)}
            />
            {isDocumentSaved && (
              <Card className="p-4 absolute bottom-4 left-1/2 -translate-x-1/2 animate-fade-up">
                <Button disabled={isLoading} onClick={completeDocument}>
                  {isLoading ? "Completing..." : "Complete Document"}
                </Button>
              </Card>
            )}
          </div>
        </>
      ) : (
        documents !== null && (
          <Empty className="p-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <File />
              </EmptyMedia>
              <EmptyTitle>No Draft Selected</EmptyTitle>
              <EmptyDescription>
                Please select a draft from the drafts section.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      )}
    </section>
  );
}

export default DocumentManagement;
