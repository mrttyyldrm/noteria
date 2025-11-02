"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Field, FieldLabel, FieldContent } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SearchIcon, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate, isDatePast } from "@/lib/date";
import { useDocument, type IFile } from "@/context/DocumentContext";
import type { IDecision } from "@/app/dashboard/court-decisions/page";
import useAPI from "@/hooks/useAPI";
import Link from "next/link";

const decisions = [
  {
    caseNumber: "Case 001",
    startDate: "2023-01-01",
    expireDate: "2024-01-01",
    relatedPerson: ["Person A", "Person B"],
    relatedProperties: ["Property 1", "Property 2", "Property 3"],
  },
  {
    caseNumber: "Case 002",
    startDate: "2023-02-01",
    expireDate: "2023-12-31",
    relatedPerson: ["Person C"],
    relatedProperties: ["Property 4"],
  },
  {
    caseNumber: "Case 003",
    startDate: "2023-03-01",
    expireDate: "2025-03-01",
    relatedPerson: ["Person D", "Person E", "Person F"],
    relatedProperties: ["Property 5", "Property 6"],
  },
];

interface IPersonProfile {
  personalInfo: {
    personID: number;
    fullName: string;
    personalNumber: string;
    address: string;
  };
  docs: IFile[];
  court: IDecision[];
}

function Person() {
  const { id } = useParams();
  const { selectDocument } = useDocument();

  const [profile, setProfile] = useState<IPersonProfile | null>(null);
  const [navigation, setNavigation] = useState<"document" | "court">(
    "document"
  );

  const { GET } = useAPI();

  const getPersonProfile = () => {
    if (!id) return;

    GET("GetPersonProfile", { PersonID: id }, (data: IPersonProfile) => {
      setProfile(data);
    });
  };

  useEffect(() => {
    getPersonProfile();
  }, []);

  if (!profile) {
    return null;
  }

  return (
    <section className="w-full h-full gap-4 overflow-hidden grid grid-cols-1 lg:grid-cols-[20rem_1fr] items-start p-4">
      <Card className="p-0">
        <CardHeader className="p-4 pb-0 space-y-2">
          <CardTitle className="flex flex-col items-center gap-2">
            <Avatar className="h-14 w-14 rounded-lg">
              <AvatarFallback className="font-medium text-xl text-foreground">
                {profile.personalInfo.fullName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <p className="text-xl font-semibold text-foreground">
              {profile.personalInfo.fullName}
            </p>
          </CardTitle>
          <div className="bg-muted grid grid-cols-2 divide-x rounded-md border text-center *:py-2">
            <div>
              <h5 className="text-lg font-semibold text-foreground">
                {profile.docs.length}
              </h5>
              <div className="text-muted-foreground text-sm">Documents</div>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-foreground">
                {profile.court.length}
              </h5>
              <div className="text-muted-foreground text-sm">Decisions</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          <Field className="gap-1">
            <FieldLabel className="text-muted-foreground">
              ID Number:
            </FieldLabel>
            <FieldContent className="text-base text-foreground font-medium">
              {profile.personalInfo.personID}
            </FieldContent>
          </Field>
          <Field className="gap-1">
            <FieldLabel className="text-muted-foreground">Phone:</FieldLabel>
            <FieldContent className="text-base text-foreground font-medium">
              {profile.personalInfo.personalNumber}
            </FieldContent>
          </Field>
          <Field className="gap-1">
            <FieldLabel className="text-muted-foreground">Address:</FieldLabel>
            <FieldContent className="text-base text-foreground font-medium">
              {profile.personalInfo.address}
            </FieldContent>
          </Field>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <InputGroup className="w-full sm:max-w-3xs">
            <InputGroupInput
              readOnly={true}
              placeholder="Search..."
              className="cursor-pointer"
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <ButtonGroup
            orientation={"horizontal"}
            className="w-full grid grid-cols-2 sm:w-auto"
          >
            <Button
              variant="outline"
              disabled={navigation === "document"}
              onClick={() => setNavigation("document")}
            >
              Documents
            </Button>
            <Button
              variant="outline"
              disabled={navigation === "court"}
              onClick={() => setNavigation("court")}
            >
              Decisions
            </Button>
          </ButtonGroup>
        </div>
        <Card className="h-full overflow-x-auto">
          {navigation === "document" && (
            <Table className="p-1">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-3">Document</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-muted-foreground">
                {profile.docs.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-3">
                      <div className="flex items-center gap-2">
                        <File className="size-5 shrink-0" />
                        <p
                          className="hover:underline hover:text-foreground cursor-pointer"
                          onClick={() => selectDocument(file)}
                        >{`${file.title}.${file.extension}`}</p>
                      </div>
                    </TableCell>
                    <TableCell className="flex justify-end items-center">
                      <Button
                        variant="outline"
                        onClick={() => selectDocument(file)}
                      >
                        Open Document
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {navigation === "court" && (
            <Table className="p-1">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-3">Case</TableHead>
                  <TableHead>Start - End Date</TableHead>
                  <TableHead>Related Properties</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-muted-foreground">
                {profile.court.map((decision, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-3">
                      {decision.caseNumber}
                    </TableCell>
                    <TableCell>
                      {`${formatDate(decision.startDate)} - ${formatDate(
                        decision.expireDate
                      )}`}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {decision.relatedProperties.length} Properties
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isDatePast(decision.expireDate)
                            ? "destructive"
                            : "default"
                        }
                      >
                        {isDatePast(decision.expireDate) ? "Expired" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex justify-end items-center">
                      <Link
                        href={`/dashboard/court-decisions?filter=${decision.caseNumber}`}
                      >
                        <Button variant="outline">View Decision</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </section>
  );
}

export default Person;
