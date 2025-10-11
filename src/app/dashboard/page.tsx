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

  const getDocumentParameters = () => {
    if (!currentDocument || isFetching) return;

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
    getDocumentParameters();
  }, [currentDocument]);

  const isParametersExits = Object.entries(parameters).length > 0;
  const isDocumentExist = currentDocument !== null;

  return (
    <div className="w-full h-full bg-red grid grid-cols-[1fr_20rem] items-start gap-4">
      <Card className="h-full overflow-hidden">
        {isDocumentExist && (
          <DocumentEditor
            id="docxEditor"
            documentServerUrl="https://384311e4.docs.onlyoffice.com"
            config={currentDocument.config}
          />
        )}
      </Card>
      <form noValidate onSubmit={formik.handleSubmit}>
        <FieldGroup className="gap-4">
          {isFetching ? (
            <ParametersLoading />
          ) : (
            isParametersExits && (
              <>
                {Object.entries(parameters).map(
                  ([key, type]: [string, any]) => (
                    <Field key={key}>
                      <FieldLabel htmlFor={key}>{key}</FieldLabel>
                      <Input
                        id={key}
                        name={key}
                        type={type}
                        placeholder={key}
                        value={
                          type === "file" ? undefined : formik.values[key] || ""
                        }
                        onChange={formik.handleChange}
                      />
                    </Field>
                  )
                )}
                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Loading..." : "Save"}
                  </Button>
                </Field>
              </>
            )
          )}
        </FieldGroup>
      </form>
    </div>
  );
}

export default Home;
