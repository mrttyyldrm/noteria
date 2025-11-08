"use client";

import { useLanguage } from "./LanguageContext";
import { useNotification } from "./NotificationContext";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useFetch from "@/hooks/useFetch";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useFormik } from "formik";
import {
  EllipsisVertical,
  File,
  Folder,
  FolderRoot,
  LogOut,
  RefreshCw,
  Save,
  SearchIcon,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import * as yup from "yup";

interface IDocuments {
  directories: string[];
  files: IFile[];
}

export interface IFile {
  documentID: number;
  title: string;
  extension: string;
  url: string;
  editable: boolean;
  config?: IDocumentConfig;
}

export interface IDocumentConfig {
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
  openProcess: (
    mode: IMode,
    documentID: number | null,
    initialPath?: string,
  ) => void;
  closeProcess: () => void;
  selectDocument: (documentID: number | IFile | null) => void;
  getDocuments: () => void;
  uploadDocument: (
    title: INewDocument["fileName"],
    file: Blob,
    path: INewDocument["path"],
    callback?: () => void,
  ) => void;
  renameDocument: (
    title: INewDocument["fileName"],
    callback?: () => void,
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
  DocumentContextDefaultValues,
);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { setOpenMobile, setOpen } = useSidebar();
  const { showNotification } = useNotification();

  const { fetch: fetchGetDocuments } = useFetch("GET", "GetDirectory");
  const { fetch: fetchCreateFolder } = useFetch("GET", "CreateFolder");
  const { fetch: fetchRenameFolder } = useFetch("GET", "RenameFolder");
  const { fetch: fetchDeleteFolder } = useFetch("GET", "DeleteFolder");
  const { fetch: fetchGetDocumentConfig } = useFetch(
    "GET",
    "GetDocumentConfig",
  );
  const { fetch: fetchUploadDocument } = useFetch("POST", "UploadDoc");
  const { fetch: fetchRenameDocument } = useFetch("GET", "RenameDoc");
  const { fetch: fetchDeleteDocument } = useFetch("GET", "DeleteDoc");
  const { fetch: fetchOpenDocument } = useFetch("GET", "OpenDoc");

  const DASHBORAD_PATH = "/dashboard";

  const [path, setPath] = useState<DocumentContextTypes["path"]>(
    DocumentContextDefaultValues.path,
  );
  const [documents, setDocuments] = useState<DocumentContextTypes["documents"]>(
    DocumentContextDefaultValues.documents,
  );
  const [loading, setLoading] = useState<DocumentContextTypes["loading"]>(
    DocumentContextDefaultValues.loading,
  );
  const [process, setProcess] = useState<DocumentContextTypes["process"]>(
    DocumentContextDefaultValues.process,
  );
  const [selectedDocument, setSelectedDocument] = useState<
    DocumentContextTypes["selectedDocument"]
  >(DocumentContextDefaultValues.selectedDocument);

  const activateLoading = (
    type: DocumentContextTypes["loading"]["documentType"],
    id: DocumentContextTypes["loading"]["id"] = null,
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

    fetchGetDocuments({
      params: { Path: path },
      onSuccess: (data: IDocuments) => {
        setDocuments(data);
      },
      onLoading: (loading) => {
        if (loading) {
          activateLoading("all");
          setDocuments({ directories: [], files: [] });
          return;
        }

        deactivateLoading();
      },
    });
  };

  const generateInitialFolderName = () => {
    const FOLDER_NAME = t("A25D8B19C");

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

    const newName = generateInitialFolderName();

    fetchCreateFolder({
      params: { Path: [...path, newName].join("/") },
      onSuccess: () => {
        const newDirectories = [...(documents?.directories ?? []), newName];

        setDocuments((prev) => ({
          ...(prev ? prev : { directories: [], files: [] }),
          directories: newDirectories,
        }));
        showNotification(t("8535B453A"), "success");
      },
      onLoading: (loading) => {
        if (loading) return activateLoading("folder");

        deactivateLoading();
      },
    });
  };

  const renameFolder = (oldName: string, newName: string) => {
    if (loading.status) return;

    fetchRenameFolder({
      params: {
        Path: [...path, oldName].join("/"),
        newName: [...path, newName].join("/"),
      },
      onSuccess: () => {
        const newDirectories = documents?.directories.map((directory) =>
          directory === oldName ? newName : directory,
        );

        setDocuments((prev: any) => ({
          ...prev,
          directories: newDirectories,
        }));
        showNotification(t("B79A4BA9A"), "success");
      },
      onLoading: (loading) => {
        if (loading) return activateLoading("folder", oldName);

        deactivateLoading();
      },
    });
  };

  const deleteFolder = (folderName: string) => {
    if (loading.status) return;

    fetchDeleteFolder({
      params: { Path: [...path, folderName].join("/") },
      onSuccess: () => {
        const newDirectories = documents?.directories.filter(
          (directory) => directory !== folderName,
        );

        setDocuments((prev: any) => ({
          ...prev,
          directories: newDirectories,
        }));
        showNotification(t("5D1E018D8"), "success");
      },
      onLoading: (loading) => {
        if (loading) return activateLoading("folder", folderName);

        deactivateLoading();
      },
    });
  };

  const selectDocument = (documentID: number | IFile | null) => {
    if (documentID === null) {
      setSelectedDocument(null);
      setOpen(true);
      return;
    }

    if (typeof documentID !== "number") {
      setSelectedDocument(documentID);
      setOpenMobile(false);
      setOpen(false);

      if (pathname !== DASHBORAD_PATH) router.push(DASHBORAD_PATH);
      return;
    }

    const document = documents?.files.find(
      (document) => document.documentID === documentID,
    );

    setSelectedDocument(document ?? null);
    setOpenMobile(document === undefined);
    setOpen(document === undefined);

    if (pathname !== DASHBORAD_PATH) router.push(DASHBORAD_PATH);
  };

  const getDocumentConfig = () => {
    if (loading.status || !selectedDocument) return;

    fetchGetDocumentConfig({
      params: { DocID: selectedDocument?.documentID },
      onSuccess: (data: IDocumentConfig) => {
        if (!selectedDocument) return;

        setSelectedDocument({ ...selectedDocument, config: data });
      },
      onLoading: (loading) => {
        if (loading)
          return activateLoading("file", selectedDocument?.documentID);

        deactivateLoading();
      },
    });
  };

  const uploadDocument = (
    title: INewDocument["fileName"],
    file: Blob,
    path: INewDocument["path"],
    callback?: () => void,
  ) => {
    if (loading.status || !file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String = reader.result as string;

      fetchUploadDocument({
        params: {
          FileName: title.replace(/\./g, ""),
          Path: path.toLowerCase(),
          Content: base64String,
        },
        onSuccess: () => {
          getDocuments();

          showNotification(t("6FDF08435"), "success");
          callback?.();
        },
        onLoading: (loading) => {
          if (loading) return activateLoading("file");

          deactivateLoading();
        },
      });
    };

    reader.readAsDataURL(file);
  };

  const renameDocument = (
    title: INewDocument["fileName"],
    callback?: () => void,
  ) => {
    if (!documents || loading.status) return;

    fetchRenameDocument({
      params: {
        DocID: process.documentID,
        FileName: title,
      },
      onSuccess: () => {
        if (selectedDocument?.documentID === process.documentID) {
          setSelectedDocument({ ...selectedDocument, title });
        }

        setDocuments({
          ...documents,
          files: documents.files.map((document) =>
            document.documentID === process.documentID
              ? { ...document, title }
              : document,
          ),
        });
        showNotification(t("BE00A801F"), "success");
        callback?.();
      },
      onLoading: (loading) => {
        if (loading) return activateLoading("file");

        deactivateLoading();
      },
    });
  };

  const deleteDocument = (callback?: () => void) => {
    if (!documents || loading.status) return;

    fetchDeleteDocument({
      params: { DocID: process.documentID },
      onSuccess: () => {
        if (selectedDocument?.documentID === process.documentID) {
          setSelectedDocument(null);
        }
        setDocuments({
          ...documents,
          files: documents.files.filter(
            (document) => document.documentID !== process.documentID,
          ),
        });
        showNotification(t("3D1162DBE"), "success");
        callback?.();
      },
      onLoading: (loading) => {
        if (loading) return activateLoading("file");

        deactivateLoading();
      },
    });
  };

  const openProcess = (
    mode: IMode,
    documentID: number | null,
    initialPath?: string,
  ) => {
    setProcess({ mode, documentID, path: initialPath ?? path.join("/") });
  };

  const closeProcess = () => {
    setProcess({ mode: null, documentID: null, path: null });
  };

  useEffect(() => {
    if (!selectedDocument) return;

    if (selectedDocument.config) {
      fetchOpenDocument({
        params: { DocID: selectedDocument?.documentID },
      });
    } else if (selectedDocument.editable) {
      getDocumentConfig();
    }
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
      <TableCell colSpan={3} className="p-2 bg-white">
        <Skeleton className="h-8" />
      </TableCell>
    </TableRow>
  );
};

export function DocumentManager({ filter }: { filter: string }) {
  const router = useRouter();
  const {
    path,
    selectedDocument,
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
  const { t } = useLanguage();

  const { loading: documentHistoryLoading, fetch: fetchDocumentHistory } =
    useFetch<IHistory[]>("GET", "GetDocHistory");

  const [rename, setRename] = useState<{
    status: boolean;
    name: string;
  } | null>(null);
  const [renameInput, setRenameInput] = useState<string>("");
  const [open, setOpen] = useState<{ status: boolean; folderName: string }>({
    status: false,
    folderName: "",
  });
  const [histories, setHistories] = useState<IHistory[]>([]);

  const getDocumentHistory = (documentID: number) => {
    if (loading.status || documentHistoryLoading) return;

    fetchDocumentHistory({
      params: { DocID: documentID },
      onSuccess: (data) => {
        setHistories(data);
      },
      onLoading: (loading) => {
        if (loading) setHistories([]);
      },
    });
  };

  const openFolder = (folderName: string) => {
    if (rename?.status && rename.name === folderName) return;

    setPath((prev) => [...prev, folderName]);
  };

  const handleRenameInput = (value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9 _-]/g, "");

    setRenameInput(sanitized);
  };

  const filteredDocuments = {
    directories:
      documents?.directories.filter((directory) =>
        directory.toLowerCase().includes(filter.toLowerCase()),
      ) || [],
    files:
      documents?.files.filter((file) =>
        file.title.toLowerCase().includes(filter.toLowerCase()),
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
                        <FolderRoot
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
                                    handleRenameInput(e.target.value)
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
                                <Button variant="outline" size="icon-sm">
                                  <EllipsisVertical />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-40"
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuLabel>
                                  {t("EA1F69315")}
                                </DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  <DropdownMenuItem
                                    onSelect={() => openFolder(directory)}
                                  >
                                    {t("6F482C07E")}
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
                                    {t("97C6196C8")}
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
                                  {t("F1BEBB0DE")}
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

                    {filteredDocuments.files.map((file, index) => {
                      const isSelected =
                        file.documentID === selectedDocument?.documentID;

                      return (
                        <TableRow
                          key={index}
                          className={cn("transition-colors duration-300", {
                            "bg-primary/10 hover:bg-primary/10": isSelected,
                          })}
                        >
                          <TableCell className="pl-3">
                            <div className="flex items-center gap-2">
                              <File
                                className={cn("size-5 shrink-0", {
                                  "text-primary": isSelected,
                                })}
                              />
                              <p
                                className={cn(
                                  "cursor-pointer hover:underline",
                                  {
                                    "text-primary": isSelected,
                                    "text-foreground": !isSelected,
                                  },
                                )}
                                onClick={() =>
                                  !isSelected
                                    ? selectDocument(file.documentID)
                                    : router.push("/dashboard")
                                }
                              >{`${file.title}.${file.extension}`}</p>
                            </div>
                          </TableCell>
                          <TableCell className="flex justify-end items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon-sm">
                                  <EllipsisVertical />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-40"
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuLabel>
                                  {t("EA1F69315")}
                                </DropdownMenuLabel>
                                <DropdownMenuGroup>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      getDocumentHistory(file.documentID)
                                    }
                                  >
                                    {t("F064EEDE3")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      selectDocument(
                                        isSelected ? null : file.documentID,
                                      )
                                    }
                                  >
                                    {isSelected
                                      ? t("7D8F5F809")
                                      : t("6F482C07E")}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onSelect={() =>
                                      openProcess("rename", file.documentID)
                                    }
                                  >
                                    {t("97C6196C8")}
                                  </DropdownMenuItem>
                                  <Link href={file.url}>
                                    <DropdownMenuItem textValue="download">
                                      {t("56BE8D0E4")}
                                    </DropdownMenuItem>
                                  </Link>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onSelect={() =>
                                      openProcess("delete", file.documentID)
                                    }
                                  >
                                    {t("F1BEBB0DE")}
                                  </DropdownMenuItem>
                                </DropdownMenuGroup>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="bg-white">
                      <Empty className="p-2">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <File />
                          </EmptyMedia>
                          <EmptyTitle>{t("D7B9A5B42")}</EmptyTitle>
                          <EmptyDescription>{t("B0DBB3098")}</EmptyDescription>
                          <EmptyContent>
                            <div className="flex flex-col items-center gap-2">
                              {path.length > 0 && (
                                <Button
                                  onClick={() => openProcess("upload", null)}
                                >
                                  {t("59817AC52")}
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
                                {t("668C381C0")}
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
            <AlertDialogTitle>{t("85D8D4C98")}</AlertDialogTitle>
            <AlertDialogDescription>{t("A1C8A1CD2")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("1AF8F06BC")}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                deleteFolder(open.folderName);
                setOpen({ status: false, folderName: "" });
              }}
            >
              {t("E9C175950")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={histories.length > 0}
        onOpenChange={(open) => !open && setHistories([])}
      >
        <DialogContent className="sm:max-w-lg px-0">
          <DialogHeader className="px-4">
            <DialogTitle>{t("B5CA4315C")}</DialogTitle>
            <DialogDescription className="flex flex-col gap-2">
              {t("4582B4B0C")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col px-4 gap-4 w-full overflow-y-auto max-h-[50vh] md:max-h-[70vh]">
            {histories.map((history, index) => (
              <div
                key={index}
                className="group grid grid-cols-[5rem_auto_1fr] items-stretch gap-4"
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
                    <Badge variant="secondary">{history.type}</Badge>
                    <p className="text-muted-foreground">
                      {t("C76AEB17E")?.replace("{fullName}", history.user)}
                    </p>
                  </div>
                  {history.oldPath !== "" && history.newPath !== "" && (
                    <Link
                      href={`/dashboard/compare?old=${encodeURIComponent(
                        history.oldPath,
                      )}&new=${encodeURIComponent(history.newPath)}`}
                      target="_blank"
                    >
                      <Button size="sm" variant="outline">
                        {t("C242C71F2")}
                      </Button>
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
  const { loading, process, uploadDocument, closeProcess } = useDocument();
  const { t, isLanguageLoading } = useLanguage();

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    const fileName = file.name.split(".").slice(0, -1).join(".");

    formik.setFieldValue("file", file);
    formik.setFieldValue("title", fileName);
  };

  const validationSchema = yup.object({
    file: yup.string().required(t("2C936F5BA")),
    title: yup.string().required(t("2C936F5BA")),
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

  useEffect(() => {
    if (isLanguageLoading) return;

    formik.validateForm();
  }, [isLanguageLoading]);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeProcess()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("8C51E8531")}</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            {t("04960E397")}
          </DialogDescription>
          <DialogDescription asChild>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">{t("C497659B8")}</p>
              <Badge variant="outline">/{process.path?.toLowerCase()}</Badge>
            </div>
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
                <FieldLabel htmlFor="title">{t("79E559EE5")}</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  disabled={loading.status}
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  placeholder={t("79E559EE5")}
                />
                {formik.touched.title && formik.errors.title && (
                  <FieldError>{formik.errors.title}</FieldError>
                )}
              </Field>
            )}
            <Field>
              <FieldLabel htmlFor="file">{t("43CD0C1CF")}</FieldLabel>
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
              <Button variant="outline">{t("1AF8F06BC")}</Button>
            </DialogClose>
            <Button type="submit" disabled={loading.status}>
              {loading.status ? <Spinner /> : t("8C51E8531")}
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
  const { t, isLanguageLoading } = useLanguage();

  const validationSchema = yup.object({
    title: yup.string().required("Title is required!"),
  });

  const initialDocumentTitle = documents?.files.find(
    (file) => file.documentID === process.documentID,
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

  useEffect(() => {
    if (isLanguageLoading) return;

    formik.validateForm();
  }, [isLanguageLoading]);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeProcess()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("AA8A1211B")}</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            {t("C691BB986")}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">{t("79E559EE5")}</FieldLabel>
              <Input
                id="title"
                name="title"
                type="text"
                disabled={loading.status}
                value={formik.values.title}
                onChange={formik.handleChange}
                placeholder={t("79E559EE5")}
              />
              {formik.touched.title && formik.errors.title && (
                <FieldError>{formik.errors.title}</FieldError>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild disabled={loading.status}>
              <Button variant="outline">{t("1AF8F06BC")}</Button>
            </DialogClose>
            <Button type="submit" disabled={loading.status}>
              {loading.status ? <Spinner /> : t("AA8A1211B")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDocumentDialog() {
  const { loading, process, deleteDocument, closeProcess } = useDocument();
  const { t } = useLanguage();

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
          <AlertDialogTitle>{t("531F840D6")}</AlertDialogTitle>
          <AlertDialogDescription>{t("EFB9FE7FA")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading.status}>
            {t("1AF8F06BC")}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={loading.status}
          >
            {loading.status ? <Spinner /> : t("E9C175950")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function DocumentsSidebar() {
  const router = useRouter();
  const { path, loading, createFolder, openProcess } = useDocument();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const logout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/auth");
  };

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu className="p-2 pb-0 md:p-0">
            <SidebarMenuItem>
              <div className="w-full flex items-center gap-2 font-semibold text-xl text-foreground">
                <Link href="/dashboard">
                  <Image src="/logo.svg" alt="Logo" width={42} height={42} />
                </Link>
                <div className="flex items-center">Noteria</div>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="ml-auto"
                  onClick={logout}
                >
                  <LogOut />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="flex flex-col h-full px-4 sm:p-2 gap-4">
          <InputGroup className="bg-white">
            <InputGroupInput
              placeholder={t("91832C904")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <DocumentManager filter={searchTerm} />
        </SidebarContent>
        <SidebarFooter className="border-t mt-2">
          <SidebarMenu className="p-2 md:p-0 md:pt-2 flex flex-col gap-2">
            <SidebarMenuItem>
              <Button
                onClick={() => openProcess("upload", null)}
                className="w-full"
                disabled={path.length === 0}
              >
                {t("30B4A5878")}
              </Button>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Button
                variant="outline"
                disabled={loading.status && loading.documentType === "folder"}
                onClick={() => createFolder()}
                className="w-full"
              >
                {t("668C381C0")}
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
