"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useDocument, DocumentManager } from "@/context/DocumentContext";
import FileManagementSkeleton from "./loading";
import { useSearchParams } from "next/navigation";

function DocumentManagement() {
  const { path, loading, documents, openProcess, createFolder } = useDocument();
  useDocument();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const [searchTerm, setSearchTerm] = useState<string>(filter ?? "");

  if (!documents) {
    return <FileManagementSkeleton />;
  }

  return (
    <section className="w-full h-full flex flex-col gap-4 py-4 px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <Button
            variant="outline"
            disabled={loading.status && loading.documentType === "folder"}
            onClick={() => createFolder()}
          >
            Create New Folder
          </Button>
          <Button
            onClick={() => openProcess("upload", null)}
            disabled={path.length === 0}
          >
            Upload New File
          </Button>
        </div>
      </div>
      <DocumentManager filter={searchTerm} />
    </section>
  );
}

export default DocumentManagement;
