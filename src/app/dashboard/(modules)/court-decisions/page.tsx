"use client";

import CourtDecisionsSkeleton from "./loading";
import {
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
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
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDocument } from "@/context/DocumentContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import useFetch from "@/hooks/useFetch";
import { formatDate, isDatePast } from "@/lib/date";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import { useFormik } from "formik";
import {
  CircleAlert,
  EllipsisVertical,
  Gavel,
  RefreshCw,
  SearchIcon,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
import * as yup from "yup";

export interface IDecision {
  caseOrderID: number;
  caseNumber: string | null;
  summary: string | null;
  startDate: string | null;
  expireDate: string | null;
  recordDate: string | null;
  r2Path: string;
  relatedPerson: {
    nameSurname: string | null;
    idNumber: string | null;
  }[];
  relatedProperties: {
    propertyNumber: string | null;
    propertyDesc: string | null;
    ProperyType: string | null;
  }[];
  searchKeywords: string[];
}

interface DecisionDialogProps {
  decision: IDecision;
  onClose: () => void;
  onSubmit: () => void;
}

function CourtDecisionsLoading() {
  return Array.from({ length: 5 }).map((_, index) => (
    <TableRow key={index}>
      <TableCell colSpan={6} className="p-2 bg-white">
        <Skeleton className="h-8" />
      </TableCell>
    </TableRow>
  ));
}

function checkIsMissing(
  t: (key: string) => string,
  value: any,
  content?: () => React.ReactNode,
  error?: () => React.ReactNode,
) {
  const hasMissingData = (val: any): boolean => {
    if (val === null || val === undefined || val === "") return true;

    if (Array.isArray(val)) return val.length === 0 || val.some(hasMissingData);

    if (typeof val === "object") {
      return Object.values(val).some(hasMissingData);
    }

    return false;
  };

  if (hasMissingData(value)) {
    return error ? (
      error()
    ) : (
      <div>
        <Badge variant="secondary">{t("71AA54348")}</Badge>
      </div>
    );
  }

  return content?.();
}

function CourtDecisions() {
  const { openProcess } = useDocument();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const filter = searchParams.get("filter");

  const { loading: courtDecisionsLoading, fetch: fetchCourtDecisions } =
    useFetch("GET", "GetCourtList");

  const [decisions, setDecisions] = useState<IDecision[] | null>(null);
  const [processes, setProcesses] = useState<string[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(filter ?? "");
  const [dialog, setDialog] = useState<{
    process: "show" | "update" | "delete" | null;
    decision: IDecision | null;
  }>({ process: null, decision: null });

  const getCourtDecisions = () => {
    fetchCourtDecisions({
      onSuccess: (data) => {
        setDecisions(data.orders);
        setProcesses(data.aiProcess);
      },
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setProcesses([]);
    }, 10000);
  }, [processes]);

  useEffect(() => {
    getCourtDecisions();
  }, []);

  if (!decisions) {
    return <CourtDecisionsSkeleton />;
  }

  const filteredDecisions = decisions?.filter((decision) => {
    const search = searchTerm.toLowerCase();

    return decision.searchKeywords.some((k) =>
      k.toLowerCase().includes(search),
    );
  });

  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <InputGroup className="sm:max-w-3xs">
          <InputGroupInput
            placeholder={t("429B3C072")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
        <Button onClick={() => openProcess("upload", null, "Court")}>
          {t("AFCD5F9C9")}
        </Button>
      </div>
      <Card className="overflow-x-auto">
        <Table className="p-1">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="pl-3">{t("E75E7FFD6")}</TableHead>
              <TableHead>{t("F253A35F7")}</TableHead>
              <TableHead>{t("36692BA5C")}</TableHead>
              <TableHead>{t("8CEC3FEC7")}</TableHead>
              <TableHead>{t("04299AD9B")}</TableHead>
              <TableHead className="flex justify-end items-center">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => getCourtDecisions()}
                >
                  <RefreshCw />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            {courtDecisionsLoading ? (
              <CourtDecisionsLoading />
            ) : (
              <>
                {processes &&
                  processes.length > 0 &&
                  processes.map((process, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6} className="p-1 bg-white">
                        <Skeleton className="p-3 flex justify-center items-center gap-2 text-center">
                          <Sparkles className="size-4" /> {process}{" "}
                          {t("B6F05A869")}
                        </Skeleton>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredDecisions && filteredDecisions.length > 0 ? (
                  filteredDecisions.map((decision, index) => (
                    <TableRow key={index}>
                      <TableCell className="pl-3 flex items-center gap-2">
                        {checkIsMissing(t, decision, undefined, () => (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="destructive" className="p-1">
                                <CircleAlert />
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{t("AFECF3EAD")}</TooltipContent>
                          </Tooltip>
                        ))}
                        {checkIsMissing(
                          t,
                          decision.caseNumber,
                          () => decision.caseNumber,
                        )}
                      </TableCell>
                      <TableCell>
                        {checkIsMissing(
                          t,
                          decision.startDate && decision.expireDate,
                          () =>
                            `${formatDate(decision.startDate)} - ${formatDate(
                              decision.expireDate,
                            )}`,
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {checkIsMissing(t, decision.relatedPerson, () => (
                          <>
                            {decision.relatedPerson.length} {t("906A1601F")}
                          </>
                        ))}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {checkIsMissing(t, decision.relatedProperties, () => (
                          <>
                            {decision.relatedProperties.length} {t("928F2A8CA")}
                          </>
                        ))}
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
                            ? "Expired"
                            : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex justify-end items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon-sm">
                              <EllipsisVertical />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-40" align="end">
                            <DropdownMenuItem
                              onSelect={() =>
                                setDialog({
                                  process: "show",
                                  decision,
                                })
                              }
                            >
                              {t("1A32575BD")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                setDialog({ process: "update", decision })
                              }
                            >
                              {t("3AA80D99C")}
                            </DropdownMenuItem>
                            <Link href={decision.r2Path} target="_blank">
                              <DropdownMenuItem>
                                {t("56BE8D0E4")}
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() =>
                                openProcess(
                                  "delete",
                                  decision.caseOrderID,
                                  "Court",
                                )
                              }
                            >
                              {t("F1BEBB0DE")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="bg-white">
                      <Empty className="p-2">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <Gavel />
                          </EmptyMedia>
                          <EmptyTitle>{t("6540F0E5A")}</EmptyTitle>
                          <EmptyDescription>{t("DCE27C5E5")}</EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </Card>

      {dialog.process === "show" && dialog.decision && (
        <ShowDecisionDialog
          decision={dialog.decision}
          onClose={() => setDialog({ process: null, decision: null })}
          onSubmit={() =>
            setDialog({ process: "update", decision: dialog.decision })
          }
        />
      )}

      {dialog.process === "update" && dialog.decision && (
        <UpdateDecisionDialog
          decision={dialog.decision}
          onClose={() => setDialog({ process: null, decision: null })}
          onSubmit={() => getCourtDecisions()}
        />
      )}

      {dialog.process === "delete" && dialog.decision && (
        <DeleteDecisionDialog
          decision={dialog.decision}
          onClose={() => setDialog({ process: null, decision: null })}
          onSubmit={() => getCourtDecisions()}
        />
      )}
    </section>
  );
}

function ShowDecisionDialog({
  decision,
  onSubmit,
  onClose,
}: DecisionDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex flex-col sm:flex-row items-center gap-2 truncate">
            {checkIsMissing(t, decision.caseNumber, () => (
              <p>
                {t("8331B0C9F")} {decision.caseNumber}
              </p>
            ))}
            <Badge variant="outline">{formatDate(decision.recordDate)}</Badge>
          </DialogTitle>
        </DialogHeader>
        <FieldGroup className="max-h-[50vh] md:max-h-[70vh] overflow-y-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel htmlFor="description">{t("B0AB3A2A4")}</FieldLabel>
              {checkIsMissing(t, decision.summary, () => (
                <p className="text-sm text-muted-foreground text-justify">
                  {decision.summary}
                </p>
              ))}
            </Field>
            <Field>
              <FieldLabel htmlFor="description">{t("BBF634251")}</FieldLabel>
              {checkIsMissing(t, decision.startDate, () => (
                <p className="text-sm text-muted-foreground text-justify">
                  {formatDate(decision.startDate)}
                </p>
              ))}
            </Field>
            <Field>
              <FieldLabel htmlFor="description">{t("23D4FE15A")}</FieldLabel>
              {checkIsMissing(t, decision.expireDate, () => (
                <p className="text-sm text-muted-foreground text-justify">
                  {formatDate(decision.expireDate)}
                </p>
              ))}
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="description">{t("36692BA5C")}</FieldLabel>
              {checkIsMissing(t, decision.relatedPerson, () =>
                decision.relatedPerson.map((person, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {checkIsMissing(t, person.nameSurname, () => (
                      <h4 className="text-sm font-semibold text-foreground">
                        {person.nameSurname}
                      </h4>
                    ))}
                    {checkIsMissing(t, person.idNumber, () => (
                      <Badge variant="outline">{person.idNumber}</Badge>
                    ))}
                  </div>
                )),
              )}
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="description">{t("8CEC3FEC7")}</FieldLabel>
              {checkIsMissing(t, decision.relatedProperties, () =>
                decision.relatedProperties.map((property, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <div key={index} className="flex items-center gap-3">
                      {checkIsMissing(t, property.ProperyType, () => (
                        <h4 className="text-sm font-semibold text-foreground">
                          {property.ProperyType}
                        </h4>
                      ))}
                      {checkIsMissing(t, property.propertyNumber, () => (
                        <Badge variant="outline">
                          {property.propertyNumber}
                        </Badge>
                      ))}
                    </div>
                    {checkIsMissing(t, property.propertyDesc, () => (
                      <p className="text-sm text-muted-foreground text-justify">
                        {property.propertyDesc}
                      </p>
                    ))}
                  </div>
                )),
              )}
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="description">{t("F7C86D366")}</FieldLabel>
              <div className="flex items-center flex-wrap gap-1">
                {checkIsMissing(t, decision.searchKeywords, () =>
                  decision.searchKeywords.map((keyword, index) => (
                    <Badge key={index} variant="outline">
                      {keyword}
                    </Badge>
                  )),
                )}
              </div>
            </Field>
          </div>
        </FieldGroup>
        <DialogFooter className="p-4">
          <DialogClose asChild>
            <Button variant="outline">{t("7D8F5F809")}</Button>
          </DialogClose>
          <Button type="submit" onClick={() => onSubmit()}>
            {t("3AA80D99C")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UpdateDecisionDialog({
  decision,
  onClose,
  onSubmit,
}: DecisionDialogProps) {
  const { showNotification } = useNotification();
  const { t, isLanguageLoading } = useLanguage();

  const { loading, fetch } = useFetch("POST", "UpdateOrder");

  const [keyword, setKeyword] = useState<string>("");

  const addKeyword = () => {
    if (keyword.trim() === "") return;

    if (formik.values.searchKeywords.includes(keyword.trim())) {
      showNotification(t("04FA764C0"));
      return;
    }

    formik.setFieldValue("searchKeywords", [
      ...formik.values.searchKeywords,
      keyword.trim(),
    ]);
    setKeyword("");
  };

  const updateDecision = (decision: IDecision) => {
    if (loading) return;

    fetch({
      params: decision,
      onSuccess: () => {
        showNotification(t("A49286AEB"));

        onSubmit();
        onClose();
      },
    });
  };

  const validationSchema = yup.object({
    caseOrderID: yup.number().required(t("2C936F5BA")),
    caseNumber: yup.string().required(t("2C936F5BA")),
    summary: yup.string().required(t("2C936F5BA")),
    startDate: yup.string().required(t("2C936F5BA")),
    expireDate: yup.string().required(t("2C936F5BA")),
    recordDate: yup.string().required(t("2C936F5BA")),
    r2Path: yup.string().required(t("2C936F5BA")),
    relatedPerson: yup
      .array()
      .of(
        yup.object({
          nameSurname: yup.string().required(t("2C936F5BA")),
          idNumber: yup.string().nullable().required(t("2C936F5BA")),
        }),
      )
      .min(1, t("AB49D15FD"))
      .required(t("2C936F5BA")),
    relatedProperties: yup
      .array()
      .of(
        yup.object({
          propertyNumber: yup.string().nullable().required(t("2C936F5BA")),
          propertyDesc: yup.string().required(t("2C936F5BA")),
          ProperyType: yup.string().required(t("2C936F5BA")),
        }),
      )
      .required(t("2C936F5BA")),
    searchKeywords: yup
      .array()
      .of(yup.string().required(t("2C936F5BA")))
      .required(t("2C936F5BA")),
  });

  const formik = useFormik({
    initialValues: decision,
    enableReinitialize: true,
    validationSchema: validationSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      updateDecision(values);
    },
  });

  useEffect(() => {
    if (isLanguageLoading) return;

    formik.validateForm();
  }, [isLanguageLoading]);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{t("99423F916")}</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            {t("3BA84F1A6")}
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-6 max-h-[50vh] md:max-h-[70vh] overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="caseNumber">{t("E75E7FFD6")}</FieldLabel>
              <Input
                id="caseNumber"
                name="caseNumber"
                type="text"
                required={true}
                disabled={loading}
                value={formik.values.caseNumber ?? ""}
                onChange={formik.handleChange}
                placeholder={t("E75E7FFD6")}
              />
              {formik.errors.caseNumber && (
                <FieldError>{formik.errors.caseNumber}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="title">{t("B0AB3A2A4")}</FieldLabel>
              <Textarea
                id="summary"
                name="summary"
                required={true}
                disabled={loading}
                value={formik.values.summary ?? ""}
                onChange={formik.handleChange}
                placeholder={t("B0AB3A2A4")}
              />
              {formik.errors.summary && (
                <FieldError>{formik.errors.summary}</FieldError>
              )}
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="startDate">{t("BBF634251")}</FieldLabel>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required={true}
                  disabled={loading}
                  value={formik.values.startDate ?? ""}
                  onChange={formik.handleChange}
                  placeholder={t("BBF634251")}
                />
                {formik.errors.startDate && (
                  <FieldError>{formik.errors.startDate}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="expireDate">{t("23D4FE15A")}</FieldLabel>
                <Input
                  id="expireDate"
                  name="expireDate"
                  type="date"
                  required={true}
                  disabled={loading}
                  value={formik.values.expireDate ?? ""}
                  onChange={formik.handleChange}
                  placeholder={t("23D4FE15A")}
                />
                {formik.errors.expireDate && (
                  <FieldError>{formik.errors.expireDate}</FieldError>
                )}
              </Field>
            </div>
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <FieldLabel className="text-sm font-semibold">
                {t("36692BA5C")}
              </FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  formik.setFieldValue("relatedPerson", [
                    ...formik.values.relatedPerson,
                    { nameSurname: "", idNumber: null },
                  ])
                }
              >
                {t("0E4115961")}
              </Button>
            </div>
            {formik.errors.relatedPerson &&
              (typeof formik.errors.relatedPerson === "string" ? (
                <FieldError>{formik.errors.relatedPerson}</FieldError>
              ) : null)}
            <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto] items-start gap-4">
              {formik.values.relatedPerson.map((_, index) => (
                <Fragment key={index}>
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor={`relatedPerson.${index}.nameSurname`}>
                      {t("B0AB3A2A4")} {index} {t("B90C49F20")}
                    </FieldLabel>
                    <Input
                      id={`relatedPerson.${index}.nameSurname`}
                      name={`relatedPerson.${index}.nameSurname`}
                      type="text"
                      required={true}
                      disabled={loading}
                      value={
                        formik.values.relatedPerson[index].nameSurname ?? ""
                      }
                      onChange={formik.handleChange}
                      placeholder={t("B90C49F20")}
                    />
                    {typeof formik.errors.relatedPerson?.[index] === "object" &&
                      formik.errors.relatedPerson[index]?.nameSurname && (
                        <FieldError>
                          {formik.errors.relatedPerson?.[index].nameSurname}
                        </FieldError>
                      )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`relatedPerson.${index}.idNumber`}>
                      {t("B0AB3A2A4")} {index + 1} {t("89141CD07")}
                    </FieldLabel>
                    <Input
                      id={`relatedPerson.${index}.idNumber`}
                      name={`relatedPerson.${index}.idNumber`}
                      type="number"
                      required={true}
                      disabled={loading}
                      value={formik.values.relatedPerson[index].idNumber ?? ""}
                      onChange={formik.handleChange}
                      placeholder={t("89141CD07")}
                    />
                    {typeof formik.errors.relatedPerson?.[index] === "object" &&
                      formik.errors.relatedPerson[index]?.idNumber && (
                        <FieldError>
                          {formik.errors.relatedPerson?.[index].idNumber}
                        </FieldError>
                      )}
                  </Field>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="mt-6"
                    type="button"
                    onClick={() =>
                      formik.setFieldValue(
                        "relatedPerson",
                        formik.values.relatedPerson.filter(
                          (_, i) => i !== index,
                        ),
                      )
                    }
                    disabled={loading}
                  >
                    <Trash2 />
                  </Button>
                </Fragment>
              ))}
            </div>
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <FieldLabel className="text-sm font-semibold">
                {t("8CEC3FEC7")}
              </FieldLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  formik.setFieldValue("relatedProperties", [
                    ...formik.values.relatedProperties,
                    { propertyNumber: null, propertyDesc: "", ProperyType: "" },
                  ])
                }
              >
                {t("D43469118")}
              </Button>
            </div>
            {formik.errors.relatedProperties &&
              (typeof formik.errors.relatedProperties === "string" ? (
                <FieldError>{formik.errors.relatedProperties}</FieldError>
              ) : null)}
            {formik.values.relatedProperties.map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto] items-start gap-4"
              >
                <Field className="col-span-2 sm:col-span-1">
                  <FieldLabel
                    htmlFor={`relatedProperties.${index}.propertyNumber`}
                  >
                    {t("A04A05310")} {index + 1} {t("729FA40C4")}
                  </FieldLabel>
                  <Input
                    id={`relatedProperties.${index}.propertyNumber`}
                    name={`relatedProperties.${index}.propertyNumber`}
                    type="number"
                    required={true}
                    disabled={loading}
                    value={
                      formik.values.relatedProperties[index].propertyNumber ??
                      ""
                    }
                    onChange={formik.handleChange}
                    placeholder={t("0E101F9A1")}
                  />
                  {typeof formik.errors.relatedProperties?.[index] ===
                    "object" &&
                    formik.errors.relatedProperties[index]?.propertyNumber && (
                      <FieldError>
                        {
                          formik.errors.relatedProperties?.[index]
                            .propertyNumber
                        }
                      </FieldError>
                    )}
                </Field>
                <Field className="order-last sm:order-[initial]">
                  <FieldLabel
                    htmlFor={`relatedProperties.${index}.ProperyType`}
                  >
                    {t("A04A05310")} {index + 1} {t("6E63411C1")}
                  </FieldLabel>
                  <Input
                    id={`relatedProperties.${index}.ProperyType`}
                    name={`relatedProperties.${index}.ProperyType`}
                    type="text"
                    required={true}
                    disabled={loading}
                    value={
                      formik.values.relatedProperties[index].ProperyType ?? ""
                    }
                    onChange={formik.handleChange}
                    placeholder={t("7E8AF404D")}
                  />
                  {typeof formik.errors.relatedProperties?.[index] ===
                    "object" &&
                    formik.errors.relatedProperties[index]?.ProperyType && (
                      <FieldError>
                        {formik.errors.relatedProperties?.[index].ProperyType}
                      </FieldError>
                    )}
                </Field>
                <Button
                  size="icon"
                  variant="destructive"
                  className="mt-6 order-last sm:order-[initial]"
                  type="button"
                  onClick={() =>
                    formik.setFieldValue(
                      "relatedProperties",
                      formik.values.relatedProperties.filter(
                        (_, i) => i !== index,
                      ),
                    )
                  }
                  disabled={loading}
                >
                  <Trash2 />
                </Button>
                <Field className="col-span-2 sm:col-span-3">
                  <FieldLabel
                    htmlFor={`relatedProperties.${index}.propertyDesc`}
                  >
                    {t("A04A05310")} {index + 1} {t("031F951E7")}
                  </FieldLabel>
                  <Textarea
                    id={`relatedProperties.${index}.propertyDesc`}
                    name={`relatedProperties.${index}.propertyDesc`}
                    required={true}
                    disabled={loading}
                    value={
                      formik.values.relatedProperties[index].propertyDesc ?? ""
                    }
                    onChange={formik.handleChange}
                    placeholder={t("3F3E42F1D")}
                  />
                  {typeof formik.errors.relatedProperties?.[index] ===
                    "object" &&
                    formik.errors.relatedProperties[index]?.propertyDesc && (
                      <FieldError>
                        {formik.errors.relatedProperties?.[index].propertyDesc}
                      </FieldError>
                    )}
                </Field>
              </div>
            ))}
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] items-start gap-4">
              <FieldLabel
                htmlFor="keyword"
                className="text-sm font-semibold sm:col-span-2"
              >
                {t("F7C86D366")}
              </FieldLabel>
              <Input
                id="keyword"
                name="keyword"
                type="text"
                disabled={loading}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t("2B5109439")}
              />
              <Button
                type="button"
                variant="outline"
                disabled={keyword === ""}
                onClick={addKeyword}
              >
                {t("D065B6213")}
              </Button>
            </div>
            {formik.errors.searchKeywords &&
              (typeof formik.errors.searchKeywords === "string" ? (
                <FieldError>{formik.errors.searchKeywords}</FieldError>
              ) : null)}
            <div className="flex items-center gap-1 flex-wrap">
              {formik.values.searchKeywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-2 pr-0.5"
                >
                  {keyword}
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    className="w-4 h-4 rounded-sm"
                    onClick={() =>
                      formik.setFieldValue(
                        "searchKeywords",
                        formik.values.searchKeywords.filter(
                          (_keyword) => _keyword !== keyword,
                        ),
                      )
                    }
                  >
                    <X className="size-2" />
                  </Button>
                </Badge>
              ))}
            </div>
          </FieldGroup>
        </form>
        <DialogFooter className="p-4">
          <DialogClose asChild disabled={loading}>
            <Button variant="outline">{t("1AF8F06BC")}</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={loading}
            onClick={() => formik.handleSubmit()}
          >
            {loading ? <Spinner /> : t("3AA80D99C")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDecisionDialog({
  decision,
  onSubmit,
  onClose,
}: DecisionDialogProps) {
  const { showNotification } = useNotification();
  const { t } = useLanguage();

  const { loading, fetch } = useFetch("GET", "DeleteOrder");

  const deleteDecision = () => {
    if (loading) return;

    fetch({
      params: { courtOrderID: decision.caseOrderID },
      onSuccess: () => {
        showNotification(t("B0E0841BA"));

        onSubmit();
        onClose();
      },
    });
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("3472C3FF9")}</AlertDialogTitle>
          <AlertDialogDescription>{t("38A1B4B9E")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>
            {t("1AF8F06BC")}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={deleteDecision}
            disabled={loading}
          >
            {loading ? <Spinner /> : t("E9C175950")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default CourtDecisions;
