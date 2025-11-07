"use client";

import PersonSkeleton from "./loading";
import type { IDecision } from "@/app/dashboard/(modules)/court-decisions/page";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDocument, type IFile } from "@/context/DocumentContext";
import useFetch from "@/hooks/useFetch";
import { formatDate, isDatePast } from "@/lib/date";
import { File, SearchIcon } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";

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

  const [navigation, setNavigation] = useState<"document" | "court">(
    "document",
  );

  const { data: profile, fetch: fetchProfile } = useFetch<IPersonProfile>(
    "GET",
    "GetPersonProfile",
  );

  const getPersonProfile = () => {
    if (!id) return;

    fetchProfile({
      params: { PersonID: id },
    });
  };

  useEffect(() => {
    isNaN(Number(id)) && notFound();

    getPersonProfile();
  }, [id]);

  if (!profile) {
    return <PersonSkeleton />;
  }

  return (
    <section className="w-full lg:h-full gap-4 overflow-hidden grid grid-cols-1 lg:grid-cols-[20rem_1fr] items-start p-4 ">
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
      <div className="flex flex-col gap-4 h-full overflow-hidden">
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
            className="w-full grid grid-cols-2 sm:w-auto shrink-0"
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
                        decision.expireDate,
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
