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

interface IDocuments {
  directories: string[];
  files: IFile[];
}

interface IFile {
  documentID: number;
  title: string;
  bucketName: string;
  extension: string;
  url: string;
  config?: IDocumentConfig;
}

interface IDocumentConfig {
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
}

type IMode = "delete" | "rename" | "upload";

interface INewDocument {
  fileName: string;
  path: string;
  content: string;
}

interface DocumentContextTypes {
  path: string[];
  setPath: React.Dispatch<React.SetStateAction<string[]>>;
  selectedDocument: IFile | null;
  process: {
    mode: IMode | null;
    documentID: number | null;
    path: string | null;
  };
  openProcess: (
    mode: IMode,
    documentID: number | null,
    path: string | null
  ) => void;
  closeProcess: () => void;
  selectDocument: (documentID: number | null) => void;
  getDocuments: () => void;
  uploadDocument: (
    title: INewDocument["fileName"],
    file: Blob,
    path: INewDocument["path"],
    callback?: () => void
  ) => void;
  renameDocument: (
    title: INewDocument["fileName"],
    callback?: () => void
  ) => void;
  deleteDocument: (callback?: () => void) => void;
  documents: IDocuments | null;
  isDocumentLoading: boolean;
  createFolder: () => void;
  renameFolder: (oldName: string, newName: string) => void;
  deleteFolder: (folderName: string) => void;
}

const DocumentContextDefaultValues: DocumentContextTypes = {
  selectedDocument: null,
  process: { mode: null, documentID: null, path: null },
  openProcess: () => {},
  closeProcess: () => {},
  selectDocument: () => {},
  getDocuments: () => {},
  uploadDocument: () => {},
  deleteDocument: () => {},
  renameDocument: () => {},
  path: [],
  setPath: () => {},
  documents: null,
  isDocumentLoading: false,
  createFolder: () => {},
  renameFolder: () => {},
  deleteFolder: () => {},
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

  const [path, setPath] = useState<DocumentContextTypes["path"]>(
    DocumentContextDefaultValues.path
  );
  const [documents, setDocuments] = useState<DocumentContextTypes["documents"]>(
    DocumentContextDefaultValues.documents
  );
  const [isDocumentLoading, setIsDocumentLoading] = useState<
    DocumentContextTypes["isDocumentLoading"]
  >(DocumentContextDefaultValues.isDocumentLoading);
  const [process, setProcess] = useState<DocumentContextTypes["process"]>(
    DocumentContextDefaultValues.process
  );
  const [selectedDocument, setSelectedDocument] = useState<
    DocumentContextTypes["selectedDocument"]
  >(DocumentContextDefaultValues.selectedDocument);

  const getDocuments = () => {
    if (isDocumentLoading) return;

    setDocuments(null);
    setIsDocumentLoading(true);
    GET(
      "GetDirectory",
      { Path: path },
      (data: IDocuments) => {
        setDocuments(data);
        setIsDocumentLoading(false);
      },
      () => setIsDocumentLoading(false)
    );
  };

  const createFolder = () => {
    if (isDocumentLoading) return;

    const FOLDER_NAME = "New Folder";

    setDocuments((prev) => {
      const prevDirectories = prev?.directories ?? [];
      let newName = FOLDER_NAME;
      if (prevDirectories.includes(newName)) {
        let i = 1;
        while (prevDirectories.includes(`${FOLDER_NAME}(${i})`)) {
          i++;
        }
        newName = `${FOLDER_NAME}(${i})`;
      }

      return {
        directories: [...prevDirectories, newName],
        files: prev?.files ?? [],
      };
    });
  };

  const renameFolder = (oldName: string, newName: string) => {
    if (isDocumentLoading) return;

    setDocuments((prev) => {
      const prevDirectories = prev?.directories ?? [];

      if (!prevDirectories.includes(oldName)) return prev;

      return {
        directories: prevDirectories.map((directory) =>
          directory === oldName ? newName : directory
        ),
        files: prev?.files ?? [],
      };
    });
  };

  const deleteFolder = (folderName: string) => {
    if (isDocumentLoading) return;

    setDocuments((prev) => {
      const prevDirectories = prev?.directories ?? [];

      if (!prevDirectories.includes(folderName)) return prev;

      return {
        directories: prevDirectories.filter(
          (directory) => directory !== folderName
        ),
        files: prev?.files ?? [],
      };
    });
  };

  const selectDocument = (documentID: number | null) => {
    if (documentID === null || !documents) {
      setSelectedDocument(null);
      return;
    }

    const document = documents.files.find(
      (document) => document.documentID === documentID
    );

    setSelectedDocument(document ?? null);
    setOpenMobile(document === undefined);
    setOpen(document === undefined);

    if (pathname !== DASHBORAD_PATH) router.replace(DASHBORAD_PATH);
  };

  const getDocumentConfig = () => {
    if (isDocumentLoading || !selectedDocument) return;

    GET(
      "GetDocConfig",
      { DocID: selectedDocument?.documentID },
      (data: IDocumentConfig) => {
        setSelectedDocument({ ...selectedDocument, config: data });
        setIsDocumentLoading(false);
      },
      () => setIsDocumentLoading(false)
    );
  };

  const uploadDocument = (
    title: INewDocument["fileName"],
    file: Blob,
    path: INewDocument["path"],
    callback?: () => void
  ) => {
    if (isDocumentLoading || !file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;

      const documentData = {
        FileName: title,
        Path: path.toLowerCase(),
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

        setDocuments({
          ...documents,
          files: documents.files.map((document) =>
            document.documentID !== process.documentID
              ? { ...document, title }
              : document
          ),
        });
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
        setDocuments({
          ...documents,
          files: documents.files.filter(
            (document) => document.documentID !== process.documentID
          ),
        });
        setIsDocumentLoading(false);
        showNotification("Document deleted successfully.", "success");
        callback?.();
      },
      () => setIsDocumentLoading(false)
    );
  };

  const openProcess = (
    mode: IMode,
    documentID: number | null,
    path: string | null
  ) => {
    setProcess({ mode, documentID, path });
  };

  const closeProcess = () => {
    setProcess({ mode: null, documentID: null, path: null });
  };

  useEffect(() => {
    if (!selectedDocument) return;

    getDocumentConfig();
  }, [selectedDocument]);

  useEffect(() => {
    getDocuments();
  }, [path]);

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
    path,
    setPath,
    documents,
    isDocumentLoading,
    createFolder,
    renameFolder,
    deleteFolder,
  };

  return (
    <DocumentContext.Provider value={value}>
      <DocumentsSidebar />
      {process.mode === "delete" && <DeleteDocumentDialog />}
      {process.mode === "upload" && <UploadDocumentDialog />}
      {process.mode === "rename" && <RenameDocumentDialog />}
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
      if (!values.file || !process.path) return;

      uploadDocument(values.title, values.file, process.path, () => {
        formik.resetForm();
        closeProcess();
      });
    },
  });

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
  const {
    path,
    setPath,
    documents,
    openProcess,
    selectDocument,
    getDocuments,
  } = useDocument();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredFiles = documents?.files.filter((file) =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFolders = documents?.directories.filter((directory) =>
    directory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocuments: IDocuments = {
    directories: filteredFolders || [],
    files: filteredFiles || [],
  };

  const isFilteredDocumentsEmpty =
    filteredDocuments.directories.length === 0 &&
    filteredDocuments.files.length === 0;

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
              {path[path.length - 1] || "Root"}
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
                {!isFilteredDocumentsEmpty && (
                  <>
                    {filteredDocuments.directories.map((directory, index) => (
                      <FieldLabel
                        key={index}
                        className="bg-white cursor-pointer"
                        onClick={() => setPath([...path, directory])}
                      >
                        <Field orientation="horizontal">
                          <FieldContent className="overflow-hidden">
                            <FieldTitle className="truncate text-foreground font-semibold cursor-text">
                              {directory}
                            </FieldTitle>
                            <FieldDescription className="truncate text-xs">
                              File Folder
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            value={`directory-${index}`}
                            id={`directory-${index}`}
                            className="hidden"
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon-sm">
                                <EllipsisVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-40" align="end">
                              {/* <DropdownMenuGroup>
                                <DropdownMenuItem
                                  textValue="rename"
                                  onSelect={() =>
                                    openProcess(
                                      "rename",
                                      directory.,
                                      "Draft"
                                    )
                                  }
                                >
                                  Rename Draft
                                </DropdownMenuItem>
                                <Link href={document.url}>
                                  <DropdownMenuItem textValue="download">
                                    Download Draft
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
                                  Delete Draft
                                </DropdownMenuItem>
                              </DropdownMenuGroup> */}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Field>
                      </FieldLabel>
                    ))}

                    {filteredDocuments.files.map((file, index) => (
                      <FieldLabel key={index} className="bg-white">
                        <Field orientation="horizontal">
                          <FieldContent className="overflow-hidden">
                            <FieldTitle className="truncate text-foreground font-semibold cursor-text">
                              {file.title}
                            </FieldTitle>
                            <FieldDescription className="truncate text-xs">
                              {file.extension} File
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            value={file.documentID.toString()}
                            id={`document-${file.documentID}`}
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
                                      file.documentID,
                                      "Draft"
                                    )
                                  }
                                >
                                  Rename Draft
                                </DropdownMenuItem>
                                <Link href={file.url}>
                                  <DropdownMenuItem textValue="download">
                                    Download Draft
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  textValue="delete"
                                  onSelect={() =>
                                    openProcess(
                                      "delete",
                                      file.documentID,
                                      "Draft"
                                    )
                                  }
                                >
                                  Delete Draft
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Field>
                      </FieldLabel>
                    ))}
                  </>
                )}
              </RadioGroup>
            )}
          </SidebarGroup>
          {isFilteredDocumentsEmpty && (
            <Empty className="p-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <File />
                </EmptyMedia>
                <EmptyTitle>No Folder/Files Found</EmptyTitle>
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
