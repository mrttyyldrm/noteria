"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDocument } from "@/context/DocumentContext";
import { useNotification } from "@/context/NotificationContext";
import useAPI from "@/hooks/useAPI";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { File, FileClock, FileUp, Info } from "lucide-react";
import { useState, useEffect } from "react";

function Dashboard() {
  const { GET } = useAPI();
  const { showNotification } = useNotification();
  const { selectedDocument, documents, selectDocument } = useDocument();

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const completeDocument = () => {
    if (!selectedDocument || isLoading) return;

    setOpen(false);
    setIsCompleting(true);
    setIsLoading(true);
    GET(
      "CheckDoc",
      { DocID: selectedDocument.documentID },
      () => {
        setCurrentStep(2);
        showNotification("Document completed successfully!", "success");
        setIsLoading(false);
        setIsCompleting(false);
      },
      () => {
        setIsLoading(false);
        setIsCompleting(false);
      },
    );
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
          {isCompleting && (
            <Skeleton className="absolute top-0 left-0 w-full h-full rounded-t-none z-50 flex justify-center items-center">
              <Empty className="p-2">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-white/20">
                    <FileUp />
                  </EmptyMedia>
                  <EmptyTitle>Document is Completing</EmptyTitle>
                  <EmptyDescription>
                    Please wait while the document is being completed.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </Skeleton>
          )}
          <div
            className={`relative w-full h-full flex flex-col rounded-b-lg overflow-hidden ${
              !isReady || isCompleting ? "opacity-0" : ""
            }`}
          >
            {selectedDocument.editable && selectedDocument.config && (
              <DocumentEditor
                id="docxEditor"
                documentServerUrl="https://384311e4.docs.onlyoffice.com"
                config={selectedDocument.config}
                events_onAppReady={() => setIsReady(true)}
                onLoadComponentError={(_, message) =>
                  showNotification(message, "error")
                }
              />
            )}

            {!selectedDocument.editable && (
              <iframe
                src={selectedDocument.url}
                className="w-full h-full"
                onLoad={() => setIsReady(true)}
              />
            )}

            <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 shadow-lg">
              <Button variant="outline" onClick={() => selectDocument(null)}>
                Close Document
              </Button>
              {selectedDocument.editable && selectedDocument.config && (
                <Button disabled={isLoading} onClick={() => setOpen(true)}>
                  {isLoading ? "Completing..." : "Complete Document"}
                </Button>
              )}

              {!selectedDocument.editable && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    You are currently in preview mode and editing is not
                    available.
                  </TooltipContent>
                </Tooltip>
              )}
            </Card>
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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you saved the document?
            </AlertDialogTitle>
            <AlertDialogDescription>
              If you complete the document without saving, your changes may be
              lost. Are you sure you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={completeDocument}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export default Dashboard;
