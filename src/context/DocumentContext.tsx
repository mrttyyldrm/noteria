"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Search, File, EllipsisVertical, RefreshCw } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
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
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import useAPI from "@/hooks/useAPI";
import { useSidebar } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

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
  getDocuments: () => void;
  deleteDocument: (documentID: number, callback?: () => void) => void;
  renameDocument: (
    documentID: number,
    fileName: string,
    callback?: () => void
  ) => void;
  documents: Document[] | null;
  isDocumentLoading: boolean;
}

const DocumentContextDefaultValues: DocumentContextTypes = {
  currentDocument: null,
  selectDocument: () => {},
  getDocuments: () => {},
  deleteDocument: () => {},
  renameDocument: () => {},
  documents: null,
  isDocumentLoading: false,
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
  const [isDocumentLoading, setIsDocumentLoading] = useState<boolean>(false);
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
    if (isDocumentLoading) return;

    setDocuments(null);
    setIsDocumentLoading(true);
    GET(
      "GetDrafts",
      {},
      (data: Document[]) => {
        setDocuments(data);
        setIsDocumentLoading(false);
      },
      () => setIsDocumentLoading(false)
    );
  };

  const deleteDocument = (documentID: number, callback?: () => void) => {
    if (!documents || isDocumentLoading) return;

    setIsDocumentLoading(true);
    GET(
      "DeleteDoc",
      { DocID: documentID },
      () => {
        if (currentDocument?.documentID === documentID) {
          setcurrentDocument(null);
        }

        setDocuments(documents.filter((doc) => doc.documentID !== documentID));
        setIsDocumentLoading(false);
        if (callback) callback();
      },
      () => setIsDocumentLoading(false)
    );
  };

  const renameDocument = (
    documentID: number,
    fileName: string,
    callback?: () => void
  ) => {
    if (!documents || isDocumentLoading) return;

    setIsDocumentLoading(true);
    GET(
      "RenameDoc",
      { DocID: documentID, FileName: fileName },
      () => {
        setDocuments(
          documents.map((doc) =>
            doc.documentID === documentID ? { ...doc, title: fileName } : doc
          )
        );
        setIsDocumentLoading(false);
        if (callback) callback();
      },
      () => setIsDocumentLoading(false)
    );
  };

  useEffect(() => {
    getDocuments();
  }, []);

  const value = {
    currentDocument,
    selectDocument,
    getDocuments,
    deleteDocument,
    renameDocument,
    documents,
    isDocumentLoading,
  };

  return (
    <DocumentContext.Provider value={value}>
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
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="w-full h-16" />
      ))}
    </>
  );
}

function DocumentsSidebar() {
  const { POST } = useAPI();
  const {
    documents,
    isDocumentLoading,
    selectDocument,
    getDocuments,
    deleteDocument,
    renameDocument,
  } = useDocument();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dialog, setDialog] = useState<{
    mode: "edit" | "delete" | "create" | null;
    documentID: number | null;
  }>({ mode: null, documentID: null });

  const filteredDocuments = documents?.filter((document) =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createValidationSchema = yup.object({
    file: yup.string().required("File is required!"),
    title: yup.string().required("Title is required!"),
  });

  const renameValidationSchema = yup.object({
    title: yup.string().required("Title is required!"),
  });

  const createForm = useFormik({
    initialValues: {
      file: undefined,
      title: "",
    },
    validationSchema: createValidationSchema,
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
        POST(
          "UploadDoc",
          documentData,
          () => {
            getDocuments();
            createForm.resetForm();
            setDialog({ mode: null, documentID: null });
            setIsLoading(false);
          },
          () => {
            createForm.resetForm();
            setDialog({ mode: null, documentID: null });
            setIsLoading(false);
          }
        );
      };

      reader.readAsDataURL(values.file);
    },
  });

  const renameForm = useFormik({
    initialValues: {
      title: "",
    },
    validationSchema: renameValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (isLoading) return;

      // setIsLoading(true);
      // GET(
      //   "renameDoc",
      //   {},
      //   () => {
      //     getDocuments();
      //     createForm.resetForm();
      //     setDialog({ mode: null, documentID: null });
      //     setIsLoading(false);
      //   },
      //   () => {
      //     createForm.resetForm();
      //     setDialog({ mode: null, documentID: null });
      //     setIsLoading(false);
      //   }
      // );
    },
  });

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    const fileName = file.name.split(".").slice(0, -1).join(".");

    createForm.setFieldValue("file", file);
    createForm.setFieldValue("title", fileName);
  };

  return (
    <>
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
                placeholder="Search drafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <SidebarGroup className="space-y-2 px-4 md:px-2">
            <SidebarGroupLabel className="p-0 text-foreground text-sm">
              Drafts
              <Button
                variant="outline"
                size="icon-sm"
                className={"ml-auto"}
                onClick={() => getDocuments()}
              >
                <RefreshCw />
              </Button>
            </SidebarGroupLabel>
            {documents === null ? (
              <DocumentsLoading />
            ) : (
              <RadioGroup
                onValueChange={(value) => selectDocument(Number(value))}
              >
                {filteredDocuments?.map((document, index) => (
                  <FieldLabel key={index} className="bg-white">
                    <Field orientation="horizontal">
                      <FieldContent className="overflow-hidden">
                        <FieldTitle className="truncate text-foreground font-bold cursor-text">
                          {document.title}
                        </FieldTitle>
                        <FieldDescription className="truncate text-xs">
                          {document.config.document.fileType.toUpperCase()} File
                        </FieldDescription>
                      </FieldContent>
                      <RadioGroupItem
                        value={document.documentID.toString()}
                        id={`document-${document.documentID}`}
                        className="hidden"
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon-sm">
                            <EllipsisVertical />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40" align="end">
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              textValue="edit"
                              onSelect={() =>
                                setDialog({
                                  mode: "edit",
                                  documentID: document.documentID,
                                })
                              }
                            >
                              Rename
                            </DropdownMenuItem>
                            <Link href={document.url}>
                              <DropdownMenuItem textValue="download">
                                Download
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              textValue="delete"
                              onSelect={() =>
                                setDialog({
                                  mode: "delete",
                                  documentID: document.documentID,
                                })
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            )}
          </SidebarGroup>
          {filteredDocuments?.length === 0 && (
            <Empty className="p-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <File />
                </EmptyMedia>
                <EmptyTitle>No Drafts Found</EmptyTitle>
                <EmptyDescription>
                  Try creating a new draft or uploading an existing one.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </SidebarContent>
        <SidebarFooter className="border-t mt-2">
          <SidebarMenu className="p-2 md:p-0 md:pt-2">
            <Dialog
              open={dialog.mode === "create"}
              onOpenChange={(open) => {
                if (!open) {
                  createForm.resetForm();
                  setIsLoading(false);
                }
                setDialog((prev) => ({
                  ...prev,
                  mode: open ? "create" : null,
                }));
              }}
            >
              <DialogTrigger asChild>
                <SidebarMenuItem>
                  <Button className="w-full">Upload New Draft</Button>
                </SidebarMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload Draft</DialogTitle>
                  <DialogDescription className="flex flex-col gap-2">
                    Upload a document to create a new draft.
                  </DialogDescription>
                </DialogHeader>
                <form
                  noValidate
                  onSubmit={createForm.handleSubmit}
                  className="flex flex-col gap-6"
                >
                  <FieldGroup>
                    {createForm.values.file && (
                      <Field>
                        <FieldLabel htmlFor="title">Title</FieldLabel>
                        <Input
                          id="title"
                          name="title"
                          type="text"
                          disabled={isLoading}
                          value={createForm.values.title}
                          onChange={createForm.handleChange}
                          placeholder="Title"
                        />
                        {createForm.touched.title &&
                          createForm.errors.title && (
                            <FieldError>{createForm.errors.title}</FieldError>
                          )}
                      </Field>
                    )}
                    <Field>
                      <FieldLabel htmlFor="file">File</FieldLabel>
                      <Dropzone
                        accept={{
                          "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            [".docx"],
                        }}
                        maxFiles={1}
                        disabled={isLoading}
                        maxSize={1024 * 1024 * 50}
                        onDrop={handleDrop}
                        src={
                          createForm.values.file
                            ? [createForm.values.file]
                            : undefined
                        }
                      >
                        <DropzoneEmptyState />
                        <DropzoneContent />
                      </Dropzone>
                      {createForm.touched.file && createForm.errors.file && (
                        <FieldError>{createForm.errors.file}</FieldError>
                      )}
                    </Field>
                  </FieldGroup>
                  <DialogFooter>
                    <DialogClose asChild disabled={isLoading}>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Uploading..." : "Upload Document"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog
        open={dialog.mode === "delete"}
        onOpenChange={(open) =>
          !open && setDialog({ mode: null, documentID: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              draft document and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              disabled={isDocumentLoading}
              onClick={() => setDialog({ mode: null, documentID: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteDocument(dialog.documentID!, () =>
                  setDialog({ mode: null, documentID: null })
                )
              }
              disabled={isDocumentLoading}
            >
              {isDocumentLoading ? "Deleting..." : "Continue"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
