"use client";

import React, { Fragment, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
  EllipsisVertical,
  File,
  Folder,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useNotification } from "@/context/NotificationContext";
import useAPI from "@/hooks/useAPI";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useDocument } from "@/context/DocumentContext";
import { ButtonGroup } from "@/components/ui/button-group";
import { Skeleton } from "@/components/ui/skeleton";
import FileManagementSkeleton from "./loading";

function FileManagement() {
  const {
    path,
    setPath,
    isDocumentLoading,
    documents,
    openProcess,
    getDocuments,
    selectDocument,
    createFolder,
    renameFolder,
    deleteFolder,
  } = useDocument();
  useDocument();
  const { showNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rename, setRename] = useState<{
    status: boolean;
    index: number;
  } | null>(null);
  const [history, setHistory] = useState<string[][]>([]);
  const [renameInput, setRenameInput] = useState<string>("");

  const goBack = () => {
    setPath((prevPath) => {
      if (prevPath.length === 0) return prevPath;

      const newPath = prevPath.slice(0, -1);
      setHistory((prevHistory) => [...prevHistory, path]);
      return newPath;
    });
  };

  const goForward = () => {
    setHistory((prevHistory) => {
      if (prevHistory.length === 0) return prevHistory;

      const newHistory = [...prevHistory];
      const lastSnapshot = newHistory.pop();

      if (lastSnapshot) {
        setPath(lastSnapshot);
      }

      return newHistory;
    });
  };

  const isDocumentsEmpty =
    documents?.directories.length === 0 && documents?.files.length === 0;

  if (!documents) {
    return <FileManagementSkeleton />;
  }

  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => createFolder()}>
            Create New Folder
          </Button>
          <Button onClick={() => openProcess("upload", null, "Draft")}>
            Upload New Document
          </Button>
        </div>
      </div>
      <Card className="overflow-x-auto">
        <Table className="p-1">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-3 min-w-xs">
                <Breadcrumb className="hidden sm:block">
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
              <TableHead></TableHead>
              <TableHead className="min-w-20 flex justify-end items-center gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => getDocuments()}
                >
                  <RefreshCw />
                </Button>
                <ButtonGroup>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={goBack}
                    disabled={path.length === 0}
                  >
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={goForward}
                    disabled={history.length === 0}
                  >
                    <ChevronRight />
                  </Button>
                </ButtonGroup>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            {!isDocumentLoading ? (
              !isDocumentsEmpty ? (
                <>
                  {path.length > 0 && (
                    <TableRow
                      className="cursor-pointer h-11"
                      onClick={() => goBack()}
                    >
                      <TableCell colSpan={3} className="pl-3">
                        <div className="flex items-center gap-2 transition-colors duration-300 hover:underline hover:text-foreground tracking-widest">
                          <Folder className="size-5" />
                          ..
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {documents?.directories.map((directory, index) => (
                    <TableRow key={index}>
                      <TableCell className="pl-3">
                        <div className="flex items-center gap-2">
                          <Folder className="size-5" />
                          {rename?.status && rename.index === index ? (
                            <Input
                              name="renameInput"
                              value={renameInput}
                              onChange={(e) => setRenameInput(e.target.value)}
                              className="max-w-40"
                            />
                          ) : (
                            <p
                              className="transition-all duration-300 hover:underline hover:text-foreground cursor-pointer"
                              onClick={() =>
                                !rename?.status &&
                                rename?.index !== index &&
                                setPath((prev) => [...prev, directory])
                              }
                            >
                              {directory}
                            </p>
                          )}
                          {rename?.status && rename.index === index && (
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
                          )}
                        </div>
                      </TableCell>
                      <TableCell>File Folder</TableCell>
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
                                onSelect={() => {
                                  setRename({ status: true, index });
                                  setRenameInput(directory);
                                }}
                              >
                                Rename Folder
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}

                  {documents?.files.map((file, index) => (
                    <TableRow key={index}>
                      <TableCell className="pl-3 ">
                        <div className="flex items-center gap-2">
                          <File className="size-5" />
                          <p
                            className="transition-all duration-300 hover:underline hover:text-foreground cursor-pointer"
                            onClick={() => selectDocument(file.documentID)}
                          >{`${file.title}.${file.extension}`}</p>
                        </div>
                      </TableCell>
                      <TableCell>{file.extension.toUpperCase()} File</TableCell>
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
                          ></DropdownMenuContent>
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
                          <div className="flex items-center gap-4 mt-4">
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
                            <Button
                              variant="outline"
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
              )
            ) : (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={3} className="p-1 bg-white">
                    <Skeleton className="h-11" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}

export default FileManagement;
