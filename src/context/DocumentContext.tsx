"use client";

import { createContext, use, useContext, useEffect, useState } from "react";
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

interface Document {
  documentPath: string;
  documentTitle: string;
  documentID: number;
  content: null | string;
}

interface DocumentContextTypes {
  currentDocument: Document | null;
  selectDocument: (documentID: number | null) => void;
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
}

const DocumentContextDefaultValues: DocumentContextTypes = {
  currentDocument: null,
  selectDocument: () => {},
  documents: [],
  setDocuments: () => {},
};

const DocumentContext = createContext<DocumentContextTypes>(
  DocumentContextDefaultValues
);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const { GET } = useAPI();
  const { setOpenMobile } = useSidebar();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [currentDocument, setcurrentDocument] = useState<Document | null>(null);

  const selectDocument = (documentID: number | null) => {
    if (documentID === null) {
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
      {}
      <DocumentsSidebar />
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  return useContext(DocumentContext);
}

function DocumentsSidebar() {
  const { documents, currentDocument, selectDocument } = useDocument();

  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredDocuments = documents.filter((document) =>
    document.documentTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log(filteredDocuments.length);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
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
        <div className="py-2 px-4 md:px-2 border-b">
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
        <SidebarGroup className="space-y-2">
          <SidebarGroupLabel className="p-0 mb-0">Drafts</SidebarGroupLabel>
          {filteredDocuments.map((document) => (
            <SidebarGroupContent key={document.documentID}>
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
                        {document.documentTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {document.documentPath}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SidebarGroupContent>
          ))}
        </SidebarGroup>
        {filteredDocuments.length === 0 && (
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
      <SidebarFooter className="py-2 px-4 md:px-2 border-t mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button className="w-full">Upload New Document</Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
