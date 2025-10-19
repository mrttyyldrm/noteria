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
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useNotification } from "./NotificationContext";
import { usePathname, useRouter } from "next/navigation";

interface IDocument {
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

interface INewDocument {
  fileName: string;
  docType: "Draft" | "Court";
  content: string;
}

interface DocumentContextTypes {
  selectedDocument: IDocument | null;
  process: {
    mode: "delete" | "rename" | "upload" | null;
    documentID: number | null;
    documentType: "Draft" | "Court" | null;
  };
  openProcess: (
    mode: "delete" | "rename" | "upload",
    documentID: number | null,
    documentType: "Draft" | "Court" | null
  ) => void;
  closeProcess: () => void;
  selectDocument: (documentID: number | null) => void;
  getDocuments: () => void;
  uploadDocument: (
    title: INewDocument["fileName"],
    file: Blob,
    type: INewDocument["docType"],
    callback?: () => void
  ) => void;
  renameDocument: (
    title: INewDocument["fileName"],
    callback?: () => void
  ) => void;
  deleteDocument: (callback?: () => void) => void;
  documents: IDocument[] | null;
  isDocumentLoading: boolean;
}

const DocumentContextDefaultValues: DocumentContextTypes = {
  selectedDocument: null,
  process: { mode: null, documentID: null, documentType: null },
  openProcess: () => {},
  closeProcess: () => {},
  selectDocument: () => {},
  getDocuments: () => {},
  uploadDocument: () => {},
  deleteDocument: () => {},
  renameDocument: () => {},
  documents: null,
  isDocumentLoading: false,
};

const DocumentContext = createContext<DocumentContextTypes>(
  DocumentContextDefaultValues
);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const { GET, POST } = useAPI();
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile, setOpen } = useSidebar();
  const { showNotification } = useNotification();

  const DASHBORAD_PATH = "/dashboard";

  const [documents, setDocuments] = useState<IDocument[] | null>(
    DocumentContextDefaultValues.documents
  );
  const [isDocumentLoading, setIsDocumentLoading] = useState<boolean>(
    DocumentContextDefaultValues.isDocumentLoading
  );
  const [process, setProcess] = useState<DocumentContextTypes["process"]>(
    DocumentContextDefaultValues.process
  );
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(
    DocumentContextDefaultValues.selectedDocument
  );

  const selectDocument = (documentID: number | null) => {
    if (documentID === null || !documents) {
      setSelectedDocument(null);
      return;
    }

    const document = documents.find(
      (document) => document.documentID === documentID
    );

    setSelectedDocument(document ?? null);
    setOpenMobile(document === undefined);
    setOpen(document === undefined);

    if (pathname !== DASHBORAD_PATH) router.replace(DASHBORAD_PATH);
  };

  const getDocuments = () => {
    if (isDocumentLoading) return;

    setDocuments(null);
    setIsDocumentLoading(true);
    GET(
      "GetDrafts",
      {},
      (data: IDocument[]) => {
        setDocuments(data);
        setIsDocumentLoading(false);
      },
      () => setIsDocumentLoading(false)
    );
  };

  const uploadDocument = (
    title: INewDocument["fileName"],
    file: Blob,
    type: INewDocument["docType"],
    callback?: () => void
  ) => {
    if (isDocumentLoading || !file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;

      const documentData = {
        FileName: title,
        DocType: "Draft",
        Content: base64String,
      };

      setIsDocumentLoading(true);
      POST(
        "UploadDoc",
        documentData,
        () => {
          getDocuments();
          setIsDocumentLoading(false);
          showNotification("Document uploaded successfully.", "success");
          callback?.();
        },
        () => setIsDocumentLoading(false)
      );
    };

    reader.readAsDataURL(file);
    const base64String = reader.result as string;

    const newDocument = {
      FileName: title,
      DocType: type,
      Content: base64String,
    };

    setIsDocumentLoading(true);
    POST(
      "UploadDoc",
      newDocument,
      () => {
        getDocuments();
        setIsDocumentLoading(false);
        showNotification("Document uploaded successfully.", "success");
        callback?.();
      },
      () => setIsDocumentLoading(false)
    );
  };

  const renameDocument = (
    title: INewDocument["fileName"],
    callback?: () => void
  ) => {
    if (!documents || isDocumentLoading) return;

    const renameDocument = {
      DocID: process.documentID,
      FileName: title,
    };

    setIsDocumentLoading(true);
    GET(
      "RenameDoc",
      renameDocument,
      () => {
        if (selectedDocument?.documentID === process.documentID) {
          setSelectedDocument({ ...selectedDocument, title });
        }

        setDocuments(
          documents.map((document) =>
            document.documentID !== process.documentID
              ? { ...document, title }
              : document
          )
        );
        setIsDocumentLoading(false);
        showNotification("Document renamed successfully.", "success");
        callback?.();
      },
      () => setIsDocumentLoading(false)
    );
  };

  const deleteDocument = (callback?: () => void) => {
    if (!documents || isDocumentLoading) return;

    setIsDocumentLoading(true);
    GET(
      "DeleteDoc",
      { DocID: process.documentID },
      () => {
        if (selectedDocument?.documentID === process.documentID) {
          setSelectedDocument(null);
        }

        setDocuments(
          documents.filter(
            (document) => document.documentID !== process.documentID
          )
        );
        setIsDocumentLoading(false);
        showNotification("Document deleted successfully.", "success");
        callback?.();
      },
      () => setIsDocumentLoading(false)
    );
  };

  const openProcess = (
    mode: "delete" | "rename" | "upload",
    documentID: number | null,
    documentType: "Draft" | "Court" | null
  ) => {
    setProcess({ mode, documentID, documentType });
  };

  const closeProcess = () => {
    setProcess({ mode: null, documentID: null, documentType: null });
  };

  useEffect(() => {
    getDocuments();
  }, []);

  const value = {
    selectedDocument,
    process,
    openProcess,
    closeProcess,
    selectDocument,
    getDocuments,
    uploadDocument,
    deleteDocument,
    renameDocument,
    documents,
    isDocumentLoading,
  };

  return (
    <DocumentContext.Provider value={value}>
      <DocumentsSidebar />
      <DeleteDocumentDialog />
      <UploadDocumentDialog />
      <RenameDocumentDialog />
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  return useContext(DocumentContext);
}

function DocumentsLoading() {
  return Array.from({ length: 5 }).map((_, index) => (
    <Skeleton key={index} className="w-full h-16" />
  ));
}

function UploadDocumentDialog() {
  const { isDocumentLoading, process, uploadDocument, closeProcess } =
    useDocument();

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    const fileName = file.name.split(".").slice(0, -1).join(".");

    formik.setFieldValue("file", file);
    formik.setFieldValue("title", fileName);
  };

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
      if (!values.file) return;

      uploadDocument(values.title, values.file, "Draft", () => {
        formik.resetForm();
        closeProcess();
      });
    },
  });

  if (process.mode !== "upload") return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeProcess()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Upload a document to create a new document.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            {formik.values.file && (
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  disabled={isDocumentLoading}
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  placeholder="Title"
                />
                {formik.touched.title && formik.errors.title && (
                  <FieldError>{formik.errors.title}</FieldError>
                )}
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="file">File</FieldLabel>
              <Dropzone
                accept={{
                  "application/pdf": [".pdf"],
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                    [".docx"],
                  "application/msword": [".doc"],
                }}
                maxFiles={1}
                disabled={isDocumentLoading}
                maxSize={1024 * 1024 * 50}
                onDrop={handleDrop}
                src={formik.values.file ? [formik.values.file] : undefined}
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
            <DialogClose asChild disabled={isDocumentLoading}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isDocumentLoading}>
              {isDocumentLoading ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RenameDocumentDialog() {
  const { isDocumentLoading, process, renameDocument, closeProcess } =
    useDocument();

  const validationSchema = yup.object({
    title: yup.string().required("Title is required!"),
  });

  const formik = useFormik({
    initialValues: {
      title: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      renameDocument(values.title, () => {
        formik.resetForm();
        closeProcess();
      });
    },
  });

  if (process.mode !== "rename") return null;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeProcess()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename Document</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Change the title of your document.
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
                disabled={isDocumentLoading}
                value={formik.values.title}
                onChange={formik.handleChange}
                placeholder="Title"
              />
              {formik.touched.title && formik.errors.title && (
                <FieldError>{formik.errors.title}</FieldError>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild disabled={isDocumentLoading}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isDocumentLoading}>
              {isDocumentLoading ? "Renaming..." : "Rename Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDocumentDialog() {
  const { isDocumentLoading, process, deleteDocument, closeProcess } =
    useDocument();

  const handleSubmit = () => {
    if (!process.documentID) return;

    deleteDocument(() => {
      closeProcess();
    });
  };

  if (process.mode !== "delete") return null;

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && closeProcess()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            document and remove it from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDocumentLoading}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isDocumentLoading}
          >
            {isDocumentLoading ? "Deleting..." : "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DocumentsSidebar() {
  const { documents, openProcess, selectDocument, getDocuments } =
    useDocument();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isRefreshed, setIsRefreshed] = useState<boolean>(false);

  const filteredDocuments = documents?.filter((document) =>
    document.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (documents === null) return;

    setIsRefreshed(true);

    setTimeout(() => {
      setIsRefreshed(false);
    }, 500);
  }, [getDocuments]);

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
                <RefreshCw
                  className={`${
                    isRefreshed ? "animate-spin" : ""
                  } transition-transform duration-500`}
                />
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
                        <FieldTitle className="truncate text-foreground font-semibold cursor-text">
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
                              textValue="rename"
                              onSelect={() =>
                                openProcess(
                                  "rename",
                                  document.documentID,
                                  "Draft"
                                )
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
                                openProcess(
                                  "delete",
                                  document.documentID,
                                  "Draft"
                                )
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
            <SidebarMenuItem>
              <Button
                className="w-full"
                onClick={() => openProcess("upload", null, "Draft")}
              >
                Upload New Draft
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
