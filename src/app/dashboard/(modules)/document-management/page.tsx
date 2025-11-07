"use client";

import FileManagementSkeleton from "./loading";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { DocumentManager, useDocument } from "@/context/DocumentContext";
import { useLanguage } from "@/context/LanguageContext";
import { SearchIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

function DocumentManagement() {
  const { path, loading, documents, openProcess, createFolder } = useDocument();
  useDocument();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const [searchTerm, setSearchTerm] = useState<string>(filter ?? "");

  if (!documents) {
    return <FileManagementSkeleton />;
  }

  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <InputGroup className="sm:max-w-3xs">
          <InputGroupInput
            placeholder={t("91832C904")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:flex items-center gap-2">
          <Button
            variant="outline"
            disabled={loading.status && loading.documentType === "folder"}
            onClick={() => createFolder()}
          >
            {t("668C381C0")}
          </Button>
          <Button
            onClick={() => openProcess("upload", null)}
            disabled={path.length === 0}
          >
            {t("30B4A5878")}
          </Button>
        </div>
      </div>
      <DocumentManager filter={searchTerm} />
    </section>
  );
}

export default DocumentManagement;
