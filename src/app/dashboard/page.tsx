"use client";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useState, useEffect } from "react";
import useAPI from "@/hooks/useAPI";
import { useDocument } from "@/context/DocumentContext";
import { useFormik } from "formik";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { File } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useNotification } from "@/context/NotificationContext";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

function ParametersLoading() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <Field key={index}>
          <FieldLabel>
            <Skeleton className="w-12 h-3" />
          </FieldLabel>
          <Skeleton className="w-full h-9" />
        </Field>
      ))}
    </>
  );
}

function Home() {
  const { GET, POST } = useAPI();
  const { showNotification } = useNotification();
  const { currentDocument } = useDocument();

  const [parameters, setParameters] = useState<any>({});
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isParametersExits = Object.entries(parameters).length > 0;
  const isDocumentExist = currentDocument !== null;

  const getDocumentParameters = () => {
    if (!currentDocument || isFetching || isParametersExits) return;

    setIsFetching(true);
    GET("GetDocParam", { DocID: currentDocument.documentID }, (data) => {
      setParameters(data);
      setIsFetching(false);
    });
  };

  const completeDocument = () => {
    if (!currentDocument || isLoading) return;

    const completeDocumentData = {
      docID: currentDocument.documentID,
      attachments: formik.values,
    };

    setIsLoading(true);
    POST("CompleteDocument", completeDocumentData, (data) => {
      setIsLoading(false);
    });
  };

  const formik = useFormik({
    initialValues: parameters,
    enableReinitialize: true,
    onSubmit: () => {
      completeDocument();
    },
  });

  useEffect(() => {
    setParameters({});
    setIsReady(false);
    formik.resetForm();
  }, [currentDocument]);

  return (
    <div className="relative w-full h-full gap-4 overflow-hidden flex justify-center items-center">
      {isDocumentExist ? (
        <>
          {!isReady && (
            <Skeleton className="absolute top-0 left-0 w-full h-full rounded-t-none z-50" />
          )}
          <div
            className={`w-full h-full rounded-b-lg overflow-hidden ${
              !isReady ? "opacity-0" : ""
            }`}
          >
            <DocumentEditor
              id="docxEditor"
              documentServerUrl="https://384311e4.docs.onlyoffice.com"
              config={currentDocument.config}
              events_onDocumentReady={() => setIsReady(true)}
            />
          </div>
        </>
      ) : (
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
      )}
      {/* <Sheet onOpenChange={(open) => open && getDocumentParameters()}>
        {isDocumentExist && (
          <SheetTrigger asChild className="absolute top-4 right-4 z-50">
            <Button variant="outline">Show Parameters</Button>
          </SheetTrigger>
        )}
        <SheetContent className="h-[calc(100svh-1rem)] top-2 right-2 rounded-lg border border-border">
          <SheetHeader>
            <SheetTitle>Document Parameters</SheetTitle>
            <SheetDescription>
              Fill in the required parameters for this document. Click save when
              you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <FieldGroup className="gap-4 px-4">
            {isFetching ? (
              <ParametersLoading />
            ) : (
              isParametersExits &&
              Object.entries(parameters).map(([key, type]: [string, any]) => (
                <Field key={key}>
                  <FieldLabel htmlFor={key}>{key}</FieldLabel>
                  <Input
                    id={key}
                    name={key}
                    type={type}
                    disabled={isLoading}
                    placeholder={key}
                    value={
                      type === "file" ? undefined : formik.values[key] || ""
                    }
                    onChange={formik.handleChange}
                  />
                </Field>
              ))
            )}
          </FieldGroup>
          <SheetFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              onClick={() => formik.handleSubmit()}
            >
              {isLoading ? "Loading..." : "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet> */}
    </div>
  );
}

export default Home;
