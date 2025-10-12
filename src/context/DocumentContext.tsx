"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Search, File } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import useAPI from "@/hooks/useAPI";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

interface Document {
  documentID: number;
  title: string;
  url: string;
  config: {
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
  };
}

interface DocumentContextTypes {
  currentDocument: Document | null;
  selectDocument: (documentID: number | null) => void;
  documents: Document[] | null;
  setDocuments: (documents: Document[]) => void;
}

const DocumentContextDefaultValues: DocumentContextTypes = {
  currentDocument: null,
  selectDocument: () => {},
  documents: null,
  setDocuments: () => {},
};

const DocumentContext = createContext<DocumentContextTypes>(
  DocumentContextDefaultValues
);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const { GET } = useAPI();
  const { setOpenMobile } = useSidebar();

  const [documents, setDocuments] = useState<Document[] | null>(
    DocumentContextDefaultValues.documents
  );
  const [currentDocument, setcurrentDocument] = useState<Document | null>(null);

  const selectDocument = (documentID: number | null) => {
    if (documentID === null || !documents) {
      setcurrentDocument(null);
      return;
    }

    const document = documents.find(
      (document) => document.documentID === documentID
    );

    setcurrentDocument(document ?? null);
    setOpenMobile(document === undefined);
  };

  const getDocuments = () => {
    GET("GetDrafts", {}, (data: Document[]) => {
      setDocuments(data);
    });
  };

  useEffect(() => {
    getDocuments();
  }, []);

  return (
    <DocumentContext.Provider
      value={{
        currentDocument,
        selectDocument,
        documents,
        setDocuments,
      }}
    >
      <DocumentsSidebar />
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  return useContext(DocumentContext);
}

function DocumentsLoading() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-16" />
      ))}
    </>
  );
}

function DocumentsSidebar() {
  const { POST } = useAPI();
  const { documents, currentDocument, selectDocument } = useDocument();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const filteredDocuments = documents?.filter((document) =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validationSchema = yup.object({
    file: yup.string().required("File is required!"),
    title: yup.string().required("Title is required!"),
  });

  const formik = useFormik({
    initialValues: {
      file: undefined,
      title: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      if (isLoading || !values.file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        const documentData = {
          FileName: values.title,
          DocType: "Draft",
          Content: base64String,
        };

        setIsLoading(true);
        POST("UploadDoc", documentData, () => {
          formik.resetForm();
          setIsDialogOpen(false);
          setIsLoading(false);
        });
      };

      reader.readAsDataURL(values.file);
    },
  });

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    const fileName = file.name.split(".").slice(0, -1).join(".");

    formik.setFieldValue("file", file);
    formik.setFieldValue("title", fileName);
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu className="p-2 pb-0 md:p-0">
          <SidebarMenuItem>
            <div className="w-full flex items-center gap-2 font-semibold text-xl text-foreground">
              <Image src="/logo.svg" alt="Logo" width={42} height={42} />
              <div className="flex items-center">
                Noteria
                <span className="ml-2 mt-1 text-xs text-muted-foreground font-medium">
                  v1.0.0
                </span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full">
        <div className="pt-2 pb-4 px-4 md:px-2 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <SidebarGroup className="space-y-2 px-4 md:px-2">
          <SidebarGroupLabel className="p-0 mb-0">Drafts</SidebarGroupLabel>
          {documents === null ? (
            <DocumentsLoading />
          ) : (
            filteredDocuments?.map((document, index) => (
              <SidebarGroupContent key={index}>
                <Card
                  key={document.documentID}
                  className={cn(
                    "cursor-pointer transition-all duration-200",
                    currentDocument?.documentID === document.documentID
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "hover:scale-95"
                  )}
                  onClick={() => selectDocument(document.documentID)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1 text-foreground">
                        <File />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-foreground truncate mb-1">
                          {document.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {document.config.document.fileType.toUpperCase()} File
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SidebarGroupContent>
            ))
          )}
        </SidebarGroup>
        {filteredDocuments?.length === 0 && (
          <Empty className="p-2">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <File />
              </EmptyMedia>
              <EmptyTitle>No Documents Found</EmptyTitle>
              <EmptyDescription>
                Try creating a new document or uploading an existing one.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t mt-2">
        <SidebarMenu className="p-2 md:p-0 md:pt-2">
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                formik.resetForm();
                setIsLoading(false);
              }
              setIsDialogOpen(open);
            }}
          >
            <DialogTrigger asChild>
              <SidebarMenuItem>
                <Button className="w-full">Upload New Document</Button>
              </SidebarMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription className="flex flex-col gap-2">
                  Upload a document to create a new draft.
                </DialogDescription>
              </DialogHeader>
              <form
                noValidate
                onSubmit={formik.handleSubmit}
                className="flex flex-col gap-6"
              >
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="title">Title</FieldLabel>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      placeholder="Title"
                    />
                    {formik.touched.title && formik.errors.title && (
                      <FieldError>{formik.errors.title}</FieldError>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="file">File</FieldLabel>
                    <Dropzone
                      accept={{
                        "application/pdf": [".pdf"],
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                          [".docx"],
                      }}
                      maxFiles={1}
                      maxSize={1024 * 1024 * 50}
                      onDrop={handleDrop}
                      src={
                        formik.values.file ? [formik.values.file] : undefined
                      }
                    >
                      <DropzoneEmptyState />
                      <DropzoneContent />
                    </Dropzone>
                    {formik.touched.file && formik.errors.file && (
                      <FieldError>{formik.errors.file}</FieldError>
                    )}
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">
                    {isLoading ? "Uploading..." : "Upload Document"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
