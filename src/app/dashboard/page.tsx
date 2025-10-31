"use client";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useState, useEffect } from "react";
import useAPI from "@/hooks/useAPI";
import { useDocument } from "@/context/DocumentContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { File, FileClock, Info } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card } from "@/components/ui/card";
import { useNotification } from "@/context/NotificationContext";

function Dashboard() {
  const { GET } = useAPI();
  const { showNotification } = useNotification();
  const { selectedDocument, documents, selectDocument } = useDocument();

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const completeDocument = () => {
    if (!selectedDocument || isLoading) return;

    setIsLoading(true);
    GET("CheckDoc", { DocID: selectedDocument.documentID }, () => {
      setIsLoading(false);
      setCurrentStep(2);
      showNotification("Document checked successfully!", "success");
    });
  };

  const calcPrice = () => {
    GET("CalcPrice", { Price: 200 });
  };

  useEffect(() => {
    setIsReady(false);
    console.log(selectedDocument);
  }, [selectedDocument]);

  return (
    <section className="relative w-full h-full gap-4 overflow-hidden flex justify-center items-center">
      {selectedDocument !== null ? (
        <>
          {!isReady && (
            <Skeleton className="absolute top-0 left-0 w-full h-full rounded-t-none z-50 flex justify-center items-center">
              <Empty className="p-2">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-white/20">
                    <FileClock />
                  </EmptyMedia>
                  <EmptyTitle>Document is Loading</EmptyTitle>
                  <EmptyDescription>
                    Please wait while the document is being loaded.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Skeleton>
          )}
          <div
            className={`relative w-full h-full flex flex-col rounded-b-lg overflow-hidden ${
              !isReady ? "opacity-0" : ""
            }`}
          >
            {selectedDocument.editable && selectedDocument.config && (
              <>
                <DocumentEditor
                  id="docxEditor"
                  documentServerUrl="https://384311e4.docs.onlyoffice.com"
                  config={selectedDocument.config}
                  events_onDocumentReady={() => setIsReady(true)}
                  onLoadComponentError={(_, message) =>
                    showNotification(message, "error")
                  }
                />
                <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => selectDocument(null)}
                  >
                    Close Document
                  </Button>
                  <Button disabled={isLoading} onClick={completeDocument}>
                    {isLoading ? "Completing..." : "Complete Document"}
                  </Button>
                </Card>
              </>
            )}

            {!selectedDocument.editable && (
              <>
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-full"
                  onLoad={() => setIsReady(true)}
                />
                <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 text-muted-foreground">
                  <Info />
                  <p className="text-sm">
                    You are currently in preview mode and editing is not
                    available.
                  </p>
                </Card>
              </>
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
              <EmptyTitle>No Document Selected</EmptyTitle>
              <EmptyDescription>
                Please select a document from the sidebar.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )
      )}
    </section>
  );
}

export default Dashboard;
