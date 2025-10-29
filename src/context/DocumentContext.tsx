"use client";

import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Folder,
  RefreshCw,
  Save,
  Search,
  X,
  EllipsisVertical,
  File,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAPI from "@/hooks/useAPI";
import { useSidebar } from "@/components/ui/sidebar";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useNotification } from "./NotificationContext";
import { usePathname, useRouter } from "next/navigation";
import { formatDate } from "@/lib/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";

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

interface IHistory {
  type: string;
  user: string;
  logDate: string;
  oldPath: string;
  newPath: string;
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
  openProcess: (mode: IMode, documentID: number | null, path?: string) => void;
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
  loading: {
    documentType: "file" | "folder" | "all" | null;
    status: boolean;
    id: number | string | null;
  };
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
  loading: {
    documentType: null,
    status: false,
    id: null,
  },
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
  const [loading, setLoading] = useState<DocumentContextTypes["loading"]>(
    DocumentContextDefaultValues.loading
  );
  const [process, setProcess] = useState<DocumentContextTypes["process"]>(
    DocumentContextDefaultValues.process
  );
  const [selectedDocument, setSelectedDocument] = useState<
    DocumentContextTypes["selectedDocument"]
  >(DocumentContextDefaultValues.selectedDocument);

  const activateLoading = (
    type: DocumentContextTypes["loading"]["documentType"],
    id: DocumentContextTypes["loading"]["id"] = null
  ) => {
    setLoading({
      documentType: type,
      status: true,
      id,
    });
  };

  const deactivateLoading = () => {
    setLoading(DocumentContextDefaultValues.loading);
  };

  const getDocuments = () => {
    if (loading.status) return;

    activateLoading("all");
    setDocuments({ directories: [], files: [] });
    GET(
      "GetDirectory",
      { Path: path },
      (data: IDocuments) => {
        setDocuments(data);
        deactivateLoading();
      },
      () => deactivateLoading()
    );
  };

  const generateInitialFolderName = () => {
    const FOLDER_NAME = "New Folder";

    const prevDirectories = documents?.directories ?? [];
    let newName = FOLDER_NAME;

    if (prevDirectories.includes(newName)) {
      let i = 1;
      while (prevDirectories.includes(`${FOLDER_NAME}(${i})`)) {
        i++;
      }
      newName = `${FOLDER_NAME}(${i})`;
    }
    return newName;
  };

  const createFolder = () => {
    if (loading.status) return;

    activateLoading("folder");

    const newName = generateInitialFolderName();
    const newDirectories = [...(documents?.directories ?? []), newName];

    GET(
      "CreateFolder",
      { Path: [...path, newName].join("/") },
      () => {
        setDocuments((prev) => ({
          ...(prev ? prev : { directories: [], files: [] }),
          directories: newDirectories,
        }));
        deactivateLoading();
        showNotification("Folder created successfully.", "success");
      },
      () => deactivateLoading()
    );
  };

  const renameFolder = (oldName: string, newName: string) => {
    if (loading.status) return;

    activateLoading("folder", oldName);

    const newDirectories = documents?.directories.map((directory) =>
      directory === oldName ? newName : directory
    );

    GET(
      "RenameFolder",
      {
        Path: [...path, oldName].join("/"),
        newName: [...path, newName].join("/"),
      },
      () => {
        setDocuments((prev: any) => ({
          ...prev,
          directories: newDirectories,
        }));
        deactivateLoading();
        showNotification("Folder renamed successfully.", "success");
      },
      () => deactivateLoading()
    );
  };

  const deleteFolder = (folderName: string) => {
    if (loading.status) return;

    activateLoading("folder", folderName);

    const newDirectories = documents?.directories.filter(
      (directory) => directory !== folderName
    );

    GET(
      "DeleteFolder",
      { Path: [...path, folderName].join("/") },
      () => {
        setDocuments((prev: any) => ({
          ...prev,
          directories: newDirectories,
        }));
        deactivateLoading();
        showNotification("Folder deleted successfully.", "success");
      },
      () => deactivateLoading()
    );
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
    if (loading.status || !selectedDocument) return;

    activateLoading("file", selectedDocument.documentID);
    GET(
      "GetDocConfig",
      { DocID: selectedDocument?.documentID },
      (data: IDocumentConfig) => {
        setSelectedDocument({ ...selectedDocument, config: data });
        deactivateLoading();
      },
      () => deactivateLoading()
    );
  };

  const uploadDocument = (
    title: INewDocument["fileName"],
    file: Blob,
    path: INewDocument["path"],
    callback?: () => void
  ) => {
    if (loading.status || !file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;

      const documentData = {
        FileName: title,
        Path: path.toLowerCase(),
        Content: base64String,
      };

      activateLoading("file");
      POST(
        "UploadDoc",
        documentData,
        () => {
          getDocuments();

          showNotification("Document uploaded successfully.", "success");
          callback?.();
        },
        () => deactivateLoading()
      );
    };

    reader.readAsDataURL(file);
  };

  const renameDocument = (
    title: INewDocument["fileName"],
    callback?: () => void
  ) => {
    if (!documents || loading.status) return;

    activateLoading("file");

    const renameDocument = {
      DocID: process.documentID,
      FileName: title,
    };

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
        deactivateLoading();
        showNotification("Document renamed successfully.", "success");
        callback?.();
      },
      () => deactivateLoading()
    );
  };

  const deleteDocument = (callback?: () => void) => {
    if (!documents || loading.status) return;

    activateLoading("file");
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
        deactivateLoading();
        showNotification("Document deleted successfully.", "success");
        callback?.();
      },
      () => deactivateLoading()
    );
  };

  const openProcess = (
    mode: IMode,
    documentID: number | null,
    _path?: string
  ) => {
    setProcess({ mode, documentID, path: _path || path.join("/") });
  };

  const closeProcess = () => {
    setProcess({ mode: null, documentID: null, path: null });
  };

  useEffect(() => {
    if (selectedDocument?.config) return;

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
    loading,
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

const TableRowSkeleton = () => {
  return (
    <TableRow>
      <TableCell colSpan={3} className="p-1 bg-white">
        <Skeleton className="h-11" />
      </TableCell>
    </TableRow>
  );
};

export function DocumentManager({ filter }: { filter: string }) {
  const { GET } = useAPI();
  const {
    path,
    setPath,
    loading,
    documents,
    openProcess,
    getDocuments,
    selectDocument,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useDocument();
  useDocument();

  const [rename, setRename] = useState<{
    status: boolean;
    name: string;
  } | null>(null);
  const [renameInput, setRenameInput] = useState<string>("");
  const [open, setOpen] = useState<{ status: boolean; folderName: string }>({
    status: false,
    folderName: "",
  });
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [histories, setHistories] = useState<IHistory[]>([]);

  const getDocumentHistory = (documentID: number) => {
    if (loading.status || isHistoryLoading) return;

    setIsHistoryLoading(true);
    setHistories([]);
    GET(
      "GetDocHistory",
      { DocID: documentID },
      (data) => {
        setHistories(data);
        setIsHistoryLoading(false);
      },
      () => setIsHistoryLoading(false)
    );
  };

  const openFolder = (folderName: string) => {
    if (rename?.status && rename.name === folderName) return;

    setPath((prev) => [...prev, folderName]);
  };

  const filteredDocuments = {
    directories:
      documents?.directories.filter((directory) =>
        directory.toLowerCase().includes(filter.toLowerCase())
      ) || [],
    files:
      documents?.files.filter((file) =>
        file.title.toLowerCase().includes(filter.toLowerCase())
      ) || [],
  };

  const isFilteredDocumentsEmpty =
    filteredDocuments?.directories.length === 0 &&
    filteredDocuments?.files.length === 0;

  if (!documents) {
    return <Skeleton className="w-full h-full" />;
  }

  return (
    <>
      <Card className="h-full overflow-hidden">
        <Table className="p-1">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-3">
                <Breadcrumb>
                  <BreadcrumbList className="sm:gap-1">
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Folder
                          className="size-4 cursor-pointer"
                          onClick={() => setPath([])}
                        />
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {path.map((directory, index) => (
                      <Fragment key={index}>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          {index === path.length - 1 ? (
                            <BreadcrumbPage>
                              {directory.toLowerCase()}
                            </BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink
                              className="font-normal cursor-pointer"
                              onClick={() => setPath(path.slice(0, index + 1))}
                            >
                              {directory.toLowerCase()}
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </TableHead>
              <TableHead className="flex justify-end items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => getDocuments()}
                >
                  <RefreshCw />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            {!(loading.status && loading.documentType === "all") ? (
              <>
                {path.length > 0 && (
                  <TableRow
                    className="cursor-pointer h-11"
                    onClick={() => setPath((prev) => prev.slice(0, -1))}
                  >
                    <TableCell colSpan={3} className="pl-3">
                      <div className="flex items-center gap-2 transition-colors duration-300 hover:underline hover:text-foreground tracking-widest">
                        <Folder className="size-5" />
                        ..
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isFilteredDocumentsEmpty ? (
                  <>
                    {filteredDocuments.directories.map((directory, index) => {
                      if (
                        loading.status &&
                        loading.documentType === "folder" &&
                        loading.id === directory
                      ) {
                        return <TableRowSkeleton key={index} />;
                      }

                      return (
                        <TableRow key={index}>
                          <TableCell className="pl-3">
                            <div className="flex items-center gap-2">
                              <Folder className="size-5 shrink-0" />
                              {rename?.status && rename.name === directory ? (
                                <Input
                                  name="renameInput"
                                  value={renameInput}
                                  onChange={(e) =>
                                    setRenameInput(e.target.value)
                                  }
                                  className="max-w-40"
                                />
                              ) : (
                                <p
                                  className="transition-all duration-300 hover:underline hover:text-foreground cursor-pointer"
                                  onClick={() => openFolder(directory)}
                                >
                                  {directory}
                                </p>
                              )}
                              {rename?.status && rename.name === directory && (
                                <ButtonGroup>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                      setRename(null);
                                      renameFolder(directory, renameInput);
                                    }}
                                  >
                                    <Save />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => setRename(null)}
                                  >
                                    <X />
                                  </Button>
                                </ButtonGroup>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="flex justify-end items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <EllipsisVertical />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-40"
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  <DropdownMenuItem
                                    onSelect={() => openFolder(directory)}
                                  >
                                    Open Folder
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() => {
                                      setRename({
                                        status: true,
                                        name: directory,
                                      });
                                      setRenameInput(directory);
                                    }}
                                  >
                                    Rename Folder
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onSelect={() =>
                                    setOpen({
                                      status: true,
                                      folderName: directory,
                                    })
                                  }
                                >
                                  Delete Folder
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {loading.status &&
                      loading.documentType === "folder" &&
                      !loading.id && <TableRowSkeleton />}

                    {filteredDocuments.files.map((file, index) => (
                      <TableRow key={index}>
                        <TableCell className="pl-3">
                          <div className="flex items-center gap-2">
                            <File className="size-5 shrink-0" />
                            <p
                              className="transition-all duration-300 hover:underline hover:text-foreground cursor-pointer"
                              onClick={() => selectDocument(file.documentID)}
                            >{`${file.title}.${file.extension}`}</p>
                          </div>
                        </TableCell>
                        <TableCell className="flex justify-end items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon">
                                <EllipsisVertical />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              className="w-40"
                              align="end"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    getDocumentHistory(file.documentID)
                                  }
                                >
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    selectDocument(file.documentID)
                                  }
                                >
                                  Open Document
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  textValue="rename"
                                  onSelect={() =>
                                    openProcess("rename", file.documentID)
                                  }
                                >
                                  Rename Document
                                </DropdownMenuItem>
                                <Link href={file.url}>
                                  <DropdownMenuItem textValue="download">
                                    Download Document
                                  </DropdownMenuItem>
                                </Link>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  textValue="delete"
                                  onSelect={() =>
                                    openProcess("delete", file.documentID)
                                  }
                                >
                                  Delete Document
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="bg-white">
                      <Empty className="p-2">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <File />
                          </EmptyMedia>
                          <EmptyTitle>No Folder or File Found</EmptyTitle>
                          <EmptyDescription>
                            You can create a new folder or upload a new file to
                            get started.
                          </EmptyDescription>
                          <EmptyContent>
                            <div className="flex flex-col sm:flex-row-reverse items-center gap-2 sm:gap-4 mt-4">
                              {path.length > 0 && (
                                <Button
                                  onClick={() =>
                                    openProcess(
                                      "upload",
                                      null,
                                      path[path.length - 1]
                                    )
                                  }
                                >
                                  Upload New File
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                disabled={
                                  loading.status &&
                                  loading.documentType === "folder"
                                }
                                onClick={() => createFolder()}
                              >
                                Create New Folder
                              </Button>
                            </div>
                          </EmptyContent>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ) : (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRowSkeleton key={index} />
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <AlertDialog
        open={open.status}
        onOpenChange={(open) => setOpen((prev) => ({ ...prev, status: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              document and remove it from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                deleteFolder(open.folderName);
                setOpen({ status: false, folderName: "" });
              }}
            >
              Continue
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={histories.length > 0}
        onOpenChange={(open) => !open && setHistories([])}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Document History</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              View the history of the document.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 w-full overflow-hidden">
            {histories.map((history, index) => (
              <div
                key={index}
                className="group grid grid-cols-[4.5rem_auto_1fr] items-stretch gap-4"
              >
                <p className="text-foreground text-sm font-semibold">
                  {formatDate(history.logDate)}
                </p>
                <div className="grid grid-rows-[auto_1fr] gap-1 mt-1.5">
                  <div className="size-2 bg-border rounded-full"></div>
                  <Separator
                    orientation="vertical"
                    className="h-full w-2 mx-auto group-last:hidden"
                  />
                </div>
                <div className="flex flex-col items-start gap-4 overflow-hidden">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge>{history.type}</Badge>
                    <p className="text-muted-foreground">by {history.user}</p>
                  </div>
                  {history.oldPath !== "" && history.newPath !== "" && (
                    <Link
                      href={`/dashboard/compare?old=${encodeURIComponent(
                        history.oldPath
                      )}&new=${encodeURIComponent(history.newPath)}`}
                    >
                      <Button variant="outline">Compare Changes</Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UploadDocumentDialog() {
  const { path, loading, process, uploadDocument, closeProcess } =
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

      uploadDocument(
        values.title,
        values.file,
        process.path ?? path.join("/"),
        () => {
          formik.resetForm();
          closeProcess();
        }
      );
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
                  disabled={loading.status}
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
                disabled={loading.status}
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
            <DialogClose asChild disabled={loading.status}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading.status}>
              {loading.status ? "Uploading..." : "Upload Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RenameDocumentDialog() {
  const { documents, loading, process, renameDocument, closeProcess } =
    useDocument();

  const validationSchema = yup.object({
    title: yup.string().required("Title is required!"),
  });

  const initialDocumentTitle = documents?.files.find(
    (file) => file.documentID === process.documentID
  )?.title;

  const formik = useFormik({
    initialValues: {
      title: initialDocumentTitle || "",
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
                disabled={loading.status}
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
            <DialogClose asChild disabled={loading.status}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading.status}>
              {loading.status ? "Renaming..." : "Rename Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDocumentDialog() {
  const { loading, process, deleteDocument, closeProcess } = useDocument();

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
          <AlertDialogCancel disabled={loading.status}>
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading.status}
          >
            {loading.status ? "Deleting..." : "Continue"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DocumentsSidebar() {
  const { path, loading, createFolder, openProcess } = useDocument();

  const [searchTerm, setSearchTerm] = useState<string>("");

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
        <SidebarContent className="flex flex-col h-full px-4 sm:p-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search folders or files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DocumentManager filter={searchTerm} />
        </SidebarContent>
        <SidebarFooter className="border-t mt-2">
          <SidebarMenu className="p-2 md:p-0 md:pt-2 flex flex-col gap-2">
            <SidebarMenuItem>
              <Button
                variant="outline"
                disabled={loading.status && loading.documentType === "folder"}
                onClick={() => createFolder()}
                className="w-full"
              >
                Create New Folder
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button
                onClick={() => openProcess("upload", null)}
                className="w-full"
                disabled={path.length === 0}
              >
                Upload New File
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
