"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import useAPI from "@/hooks/useAPI";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Gavel, Trash2 } from "lucide-react";
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyHeader,
  EmptyDescription,
} from "@/components/ui/empty";
import CourtDecisionsSkeleton from "./loading";
import { useDocument } from "@/context/DocumentContext";

interface IDecision {
  desicionID: number;
  personName: string;
  personalNumber: string;
  desisionSummary: string;
  docID: number;
  docPath: string;
}

function CourtDecisions() {
  const { GET } = useAPI();
  const { openProcess } = useDocument();

  const [decisions, setDecisions] = useState<IDecision[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const getCourtDecisions = () => {
    GET("GetCourtList", {}, (data) => {
      setDecisions(data);
    });
  };

  useEffect(() => {
    // getCourtDecisions();
  }, []);

  if (!decisions) {
    return <CourtDecisionsSkeleton />;
  }

  const filteredDecisions = decisions.filter(
    (decision) =>
      decision.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.personalNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search decisions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => openProcess("upload", null, "Court")}>
          Upload New Court Decision
        </Button>
      </div>
      <Card className="overflow-x-auto">
        <Table className="p-1">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-3">#</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Personal Number</TableHead>
              <TableHead>Decision Summary</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            {filteredDecisions.length > 0 ? (
              filteredDecisions.map((decision, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-3">{decision.desicionID}</TableCell>
                  <TableCell>{decision.personName}</TableCell>
                  <TableCell>{decision.personalNumber}</TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="truncate max-w-md">
                          {decision.desisionSummary}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-lg">
                        {decision.desisionSummary}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="flex justify-end items-center gap-2">
                    <Link href={decision.docPath} target="_blank">
                      <Button variant="outline">Download</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        openProcess("delete", decision.docID, "Court")
                      }
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="bg-white">
                  <Empty className="p-2">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Gavel />
                      </EmptyMedia>
                      <EmptyTitle>No Court Decision Found</EmptyTitle>
                      <EmptyDescription>
                        Try creating a new draft or uploading an existing one.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}

export default CourtDecisions;
