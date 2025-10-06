"use client";

import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";
import {
  FileText,
  File,
  FileImage,
  FileSpreadsheet,
  FileCheck,
  Search,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Draft documents data
const draftDocuments = [
  {
    id: "1",
    title: "Property Transfer Agreement",
    type: "PDF Document",
    uploadDate: "2024-10-05",
    fileType: "pdf",
    category: "Contracts",
  },
  {
    id: "2",
    title: "Power of Attorney",
    type: "Word Document",
    uploadDate: "2024-10-04",
    fileType: "doc",
    category: "Legal Documents",
  },
  {
    id: "3",
    title: "Marriage Certificate",
    type: "PDF Document",
    uploadDate: "2024-10-03",
    fileType: "pdf",
    category: "Certificates",
  },
  {
    id: "4",
    title: "Business Registration",
    type: "Excel Spreadsheet",
    uploadDate: "2024-10-02",
    fileType: "excel",
    category: "Business Documents",
  },
  {
    id: "5",
    title: "Identity Verification",
    type: "JPEG Image",
    uploadDate: "2024-10-01",
    fileType: "image",
    category: "Identification",
  },
  {
    id: "6",
    title: "Lease Agreement",
    type: "PDF Document",
    uploadDate: "2024-09-30",
    fileType: "pdf",
    category: "Contracts",
  },
  {
    id: "7",
    title: "Birth Certificate",
    type: "PDF Document",
    uploadDate: "2024-09-29",
    fileType: "pdf",
    category: "Certificates",
  },
  {
    id: "8",
    title: "Will Testament",
    type: "Word Document",
    uploadDate: "2024-09-28",
    fileType: "doc",
    category: "Legal Documents",
  },
];

const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "pdf":
      return <FileText className="h-5 w-5" />;
    case "doc":
      return <File className="h-5 w-5" />;
    case "image":
      return <FileImage className="h-5 w-5" />;
    case "excel":
      return <FileSpreadsheet className="h-5 w-5" />;
    default:
      return <FileCheck className="h-5 w-5" />;
  }
};

export function AppSidebar() {
  const router = useRouter();
  const [selectedDocument, setSelectedDocument] = React.useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const logOut = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/login");
  };

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocument(documentId);
  };

  // Filter documents based on search term
  const filteredDocuments = draftDocuments.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group documents by category
  const documentsByCategory = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, typeof draftDocuments>);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Image src="/logo.svg" alt="Logo" width={32} height={32} />
                Noteria
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="flex flex-col h-full">
        {/* Search Section */}
        <div className="p-2 border-b">
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

        {/* Documents by Category */}
        <div className="flex-1 overflow-auto">
          {Object.entries(documentsByCategory).map(([category, documents]) => (
            <SidebarGroup key={category}>
              <SidebarGroupLabel>{category}</SidebarGroupLabel>
              <div className="space-y-2">
                {documents.map((document) => (
                  <Card
                    key={document.id}
                    className={cn(
                      "cursor-pointer transition-all duration-200 hover:shadow-md",
                      selectedDocument === document.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                    onClick={() => handleDocumentSelect(document.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getFileIcon(document.fileType)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground truncate mb-1">
                            {document.title}
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            {document.type}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </SidebarGroup>
          ))}

          {Object.keys(documentsByCategory).length === 0 && (
            <Empty className="p-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>No documents found</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button className="w-full">Upload New Document</Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
