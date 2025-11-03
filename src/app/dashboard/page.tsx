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
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IDocumentConfig, useDocument } from "@/context/DocumentContext";
import { useNotification } from "@/context/NotificationContext";
import useAPI from "@/hooks/useAPI";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { Tooltip } from "@radix-ui/react-tooltip";
import { File, FileClock, FileUp, Info } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface IStatus {
  isValid: boolean;
  message: string;
  courtDoc: string;
}

function Dashboard() {
  const { GET } = useAPI();
  const { showNotification } = useNotification();
  const { selectedDocument, documents, selectDocument } = useDocument();

  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [status, setStatus] = useState<IStatus>({
    isValid: true,
    message: "",
    courtDoc: "",
  });
  const [config, setConfig] = useState<IDocumentConfig | null>(null);
  const [price, setPrice] = useState<number | "">("");
  const [details, setDetails] = useState<Record<string, number> | null>(null);
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
      (data: IStatus) => {
        setStatus(data);
        setIsCompleting(false);
        setIsLoading(false);

        if (!data.isValid) return;

        setCurrentStep(2);
      },
      () => {
        setIsLoading(false);
        setIsCompleting(false);
      },
    );
  };

  const calcPrice = () => {
    if (!price || isLoading) return;

    setDetails({});
    setIsLoading(true);
    GET(
      "CalcPrice",
      { Price: price },
      (data) => {
        setDetails(data);
        setIsLoading(false);
      },
      () => setIsLoading(false),
    );
  };

  const printDocument = () => {
    if (!selectedDocument || isLoading) return;

    setIsLoading(true);
    GET(
      "PrintDoc",
      { DocID: selectedDocument.documentID },
      (data) => {
        setConfig(data);
        setCurrentStep(3);
        setIsLoading(false);
      },
      () => {
        setIsLoading(false);
      },
    );
  };

  const finishDocument = () => {
    selectDocument(null);
    showNotification("Document has been finished.", "success");
    setCurrentStep(1);
  };

  useEffect(() => {
    setIsReady(false);
  }, [selectedDocument, currentStep]);

  return (
    <section className="relative w-full h-full gap-4 overflow-hidden flex justify-center items-center">
      {!isReady && selectedDocument && currentStep !== 2 && (
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

      {currentStep === 1 ? (
        selectedDocument !== null ? (
          <>
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
                  id="editor"
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
                    {isLoading ? "Verifying..." : "Verify Document"}
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
        )
      ) : null}

      {currentStep === 2 && (
        <>
          <div className="p-4 w-full max-w-md mx-auto flex flex-col items-center gap-4 mb-11">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-3xl font-semibold">Calculate Price</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter the notary service amount below to calculate the total
                fee.
              </p>
            </div>
            <ButtonGroup className="w-full max-w-xs">
              <InputGroup>
                <InputGroupInput
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Enter Service Amount"
                />
                <InputGroupAddon align="inline-end">€</InputGroupAddon>
              </InputGroup>
              <Button variant="outline" onClick={calcPrice}>
                Calculate
              </Button>
            </ButtonGroup>
            {details !== null ? (
              Object.keys(details).length > 0 ? (
                <Card className="w-full max-w-xs py-4 gap-4">
                  <CardHeader className="px-4">
                    <CardTitle className="text-muted-foreground font-normal text-center">
                      Total Fee
                    </CardTitle>
                    <p className="text-4xl font-semibold text-foreground text-center">
                      {Object.values(details)
                        .reduce((sum, value) => sum + value, 0)
                        .toFixed(2)}
                      <span className="text-xl">€</span>
                    </p>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex flex-col gap-4 px-4">
                    <ul className="flex flex-col gap-3">
                      {Object.entries(details).map(([key, value]) => (
                        <li
                          key={key}
                          className="flex justify-between items-center gap-2"
                        >
                          <p className="text-sm text-muted-foreground">{key}</p>
                          <p className="text-sm text-foreground font-semibold">
                            {value.toFixed(2)} €
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                <Skeleton className="w-full h-96 max-w-xs" />
              )
            ) : null}
          </div>
          <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 shadow-lg">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Edit Document
            </Button>
            <Button disabled={isLoading} onClick={() => printDocument()}>
              {isLoading ? "Printing..." : "Print Document"}
            </Button>
          </Card>
        </>
      )}

      {currentStep === 3 && (
        <div
          className={`relative w-full h-full flex flex-col rounded-b-lg overflow-hidden ${
            !isReady ? "opacity-0" : ""
          }`}
        >
          {config && (
            <DocumentEditor
              id="print"
              documentServerUrl="https://384311e4.docs.onlyoffice.com"
              config={config}
              events_onAppReady={() => setIsReady(true)}
              onLoadComponentError={(_, message) =>
                showNotification(message, "error")
              }
            />
          )}

          <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 shadow-lg">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Edit Document
            </Button>
            <Button onClick={finishDocument}>Finish Document</Button>
          </Card>
        </div>
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
            <Button onClick={completeDocument}>Confirm</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!status.isValid}
        onOpenChange={(open) =>
          !open && setStatus({ isValid: true, message: "", courtDoc: "" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Document Verification Alert</AlertDialogTitle>
            <AlertDialogDescription>{status.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Link href={status.courtDoc} target="_blank">
              <Button variant="outline">Show Decision</Button>
            </Link>
            <AlertDialogAction onClick={() => setCurrentStep(2)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export default Dashboard;
