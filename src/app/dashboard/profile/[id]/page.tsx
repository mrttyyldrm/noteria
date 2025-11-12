"use client";

import PersonSkeleton from "./loading";
import type { IDecision } from "@/app/dashboard/(modules)/court-decisions/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
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
import { useLanguage } from "@/context/LanguageContext";
import useFetch from "@/hooks/useFetch";
import { formatDate, isDatePast } from "@/lib/date";
import { File, SearchIcon, SearchX } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface IProfile {
  type: string;
  specs: Record<string, string>;
  docs: IFile[];
  court: IDecision[];
}

function Person() {
  const router = useRouter();
  const { id } = useParams();

  const { t } = useLanguage();
  const { selectDocument } = useDocument();

  const [navigation, setNavigation] = useState<"document" | "court">(
    "document",
  );
  const [searchTerm, setSearchTerm] = useState<string>("");

  const { data: profile, fetch: fetchProfile } = useFetch<IProfile>(
    "GET",
    "GetObjectProfile",
  );

  const getPersonProfile = () => {
    if (!id) return;

    fetchProfile({
      params: { Param: id },
      onError: () => router.replace("/dashboard"),
    });
  };

  useEffect(() => {
    getPersonProfile();
  }, [id]);

  if (!profile) {
    return <PersonSkeleton />;
  }

  const filteredDecisions = profile.court?.filter((decision) => {
    const search = searchTerm.toLowerCase();

    return decision.searchKeywords.some((k) =>
      k.toLowerCase().includes(search),
    );
  });

  const filteredDocuments = profile.docs?.filter((file) => {
    const search = searchTerm.toLowerCase();

    return file.title.toLowerCase().includes(search);
  });

  return (
    <section className="w-full lg:h-full gap-4 overflow-hidden grid grid-cols-1 lg:grid-cols-[20rem_1fr] items-start p-4 ">
      <Card className="p-0">
        <CardHeader className="p-4 pb-0 space-y-2">
          <CardTitle className="text-xl font-semibold text-foreground">
            {profile.type}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-0">
          {Object.entries(profile.specs).map(([key, value], index) => (
            <Field key={index} className="gap-1">
              <FieldLabel className="text-muted-foreground">{key}:</FieldLabel>
              <FieldContent className="text-base text-foreground font-medium">
                {value}
              </FieldContent>
            </Field>
          ))}
          <div className="bg-muted grid grid-cols-2 divide-x rounded-md border text-center *:py-2">
            <div>
              <h5 className="text-lg font-semibold text-foreground">
                {profile.docs.length}
              </h5>
              <div className="text-muted-foreground text-sm">
                {t("0FE348F46")}
              </div>
            </div>
            <div>
              <h5 className="text-lg font-semibold text-foreground">
                {profile.court.length}
              </h5>
              <div className="text-muted-foreground text-sm">
                {t("249FBA86F")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4 h-full overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <InputGroup className="w-full sm:max-w-3xs">
            <InputGroupInput
              placeholder={
                navigation === "document" ? t("FBCFC6A71") : t("429B3C072")
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
          <ButtonGroup
            orientation={"horizontal"}
            className="w-full grid grid-cols-2 sm:w-auto shrink-0"
          >
            {profile.docs.length > 0 && (
              <Button
                variant="outline"
                disabled={navigation === "document"}
                onClick={() => setNavigation("document")}
              >
                {t("0FE348F46")}
              </Button>
            )}
            {profile.court.length > 0 && (
              <Button
                variant="outline"
                disabled={navigation === "court"}
                onClick={() => setNavigation("court")}
              >
                {t("249FBA86F")}
              </Button>
            )}
          </ButtonGroup>
        </div>
        <Card className="h-full overflow-x-auto">
          {navigation === "document" && (
            <Table className="p-1">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-3">{t("0FE348F46")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-muted-foreground">
                {filteredDocuments.length > 0 ? (
                  filteredDocuments.map((file, index) => (
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
                          {t("1A32575BD")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="bg-white">
                      <Empty className="p-2">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <File />
                          </EmptyMedia>
                          <EmptyTitle>{t("86D9CDC4E")}</EmptyTitle>
                          <EmptyDescription>{t("EB20D261D")}</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
          {navigation === "court" && (
            <Table className="p-1">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-3">{t("E75E7FFD6")}</TableHead>
                  <TableHead>{t("F253A35F7")}</TableHead>
                  <TableHead>{t("36692BA5C")}</TableHead>
                  <TableHead>{t("8CEC3FEC7")}</TableHead>
                  <TableHead>{t("04299AD9B")}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-muted-foreground">
                {filteredDecisions.length > 0 ? (
                  filteredDecisions.map((decision, index) => (
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
                        {decision.relatedPerson.length} {t("906A1601F")}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {decision.relatedProperties.length} {t("928F2A8CA")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isDatePast(decision.expireDate)
                              ? "destructive"
                              : "default"
                          }
                        >
                          {isDatePast(decision.expireDate)
                            ? t("8F554D5D6")
                            : t("572300D84")}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-end items-center">
                        <Link
                          href={`/dashboard/court-decisions?filter=${decision.caseNumber}`}
                        >
                          <Button variant="outline">{t("1A32575BD")}</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-white">
                      <Empty className="p-2">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <SearchX />
                          </EmptyMedia>
                          <EmptyTitle>{t("6540F0E5A")}</EmptyTitle>
                          <EmptyDescription>{t("EB20D261D")}</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </section>
  );
}

export default Person;
