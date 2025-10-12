"use client";

import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { useState, useEffect } from "react";
import useAPI from "@/hooks/useAPI";
import { useDocument } from "@/context/DocumentContext";
import { useFormik } from "formik";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
  const { currentDocument } = useDocument();

  const [parameters, setParameters] = useState<any>({});
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
    formik.resetForm();
  }, [currentDocument]);

  return (
    <div className="w-full h-full gap-4">
      <Card className="relative h-full overflow-hidden">
        {isDocumentExist && (
          <DocumentEditor
            id="docxEditor"
            documentServerUrl="https://384311e4.docs.onlyoffice.com"
            config={currentDocument.config}
          />
        )}
        <Sheet onOpenChange={(open) => open && getDocumentParameters()}>
          {isDocumentExist && (
            <SheetTrigger asChild className="absolute top-4 right-4 z-50">
              <Button variant="outline">Show Parameters</Button>
            </SheetTrigger>
          )}
          <SheetContent className="h-[calc(100svh-1rem)] top-2 right-2 rounded-lg border border-border">
            <SheetHeader>
              <SheetTitle>Document Parameters</SheetTitle>
              <SheetDescription>
                Fill in the required parameters for this document. Click save
                when you&apos;re done.
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
        </Sheet>
      </Card>
    </div>
  );
}

export default Home;
