"use client";

import React, { Fragment, useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Gavel,
  EllipsisVertical,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyHeader,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CourtDecisionsSkeleton from "./loading";
import { useDocument } from "@/context/DocumentContext";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, isDatePast } from "@/lib/date";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotification } from "@/context/NotificationContext";

interface IDecision {
  caseOrderID: number;
  caseNumber: string;
  summary: string;
  startDate: string;
  expireDate: string;
  recordDate: string;
  r2Path: string;
  relatedPerson: {
    nameSurname: string;
    idNumber: string | null;
  }[];
  relatedProperties: {
    propertyNumber: string | null;
    propertyDesc: string;
    ProperyType: string;
  }[];
  searchKeywords: string[];
}

interface ShowAndUpdateDecisionDialogProps {
  decision: IDecision;
  onClose: () => void;
  onSubmit: () => void;
}

function CourtDecisions() {
  const { GET } = useAPI();
  const { openProcess } = useDocument();

  const [decisions, setDecisions] = useState<IDecision[] | null>(null);
  const [processes, setProcesses] = useState<string[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dialog, setDialog] = useState<{
    process: "show" | "update" | null;
    decision: IDecision | null;
  }>({ process: null, decision: null });

  const getCourtDecisions = () => {
    GET("GetCourtList", {}, (data) => {
      setDecisions(data.orders);

      if (processes === null) {
        setProcesses(data.aiProcess);
      }
    });
  };

  useEffect(() => {
    if (processes !== null) return;

    setTimeout(() => {
      setProcesses([]);
    }, 3000);
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
      k.toLowerCase().includes(search)
    );
  });

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
              <TableHead className="pl-3">Case</TableHead>
              <TableHead>Start - End Date</TableHead>
              <TableHead>Related People</TableHead>
              <TableHead>Related Properties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-muted-foreground">
            {filteredDecisions && filteredDecisions.length > 0 ? (
              filteredDecisions.map((decision, index) => (
                <TableRow key={index}>
                  <TableCell className="pl-3">{decision.caseNumber}</TableCell>
                  <TableCell>
                    {formatDate(decision.startDate)} -{" "}
                    {formatDate(decision.expireDate)}
                  </TableCell>
                  <TableCell>
                    {decision.relatedPerson
                      .map((person) => person.nameSurname)
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    {decision.relatedProperties
                      .map((property) => property.ProperyType)
                      .join(", ")}
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
                  <TableCell className="flex justify-end items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" disabled={false}>
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
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            setDialog({ process: "update", decision })
                          }
                        >
                          Update Decision
                        </DropdownMenuItem>
                        <Link href={decision.r2Path}>
                          <DropdownMenuItem>Download Decision</DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() =>
                            openProcess("delete", decision.caseOrderID, "Court")
                          }
                        >
                          Delete Decision
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
                      <EmptyTitle>No Court Decision Found</EmptyTitle>
                      <EmptyDescription>
                        Try creating a new draft or uploading an existing one.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
            {processes &&
              processes.length > 0 &&
              processes.map((process, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6} className="p-1 bg-white">
                    <Skeleton className="p-3 flex justify-center items-center gap-2 text-center">
                      <Sparkles className="size-4" /> {process} is processing
                    </Skeleton>
                  </TableCell>
                </TableRow>
              ))}
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
    </section>
  );
}

function UpdateDecisionDialog({
  decision,
  onClose,
  onSubmit,
}: ShowAndUpdateDecisionDialogProps) {
  const { POST } = useAPI();
  const { showNotification } = useNotification();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<string>("");

  const addKeyword = () => {
    if (keyword.trim() === "") return;

    if (formik.values.searchKeywords.includes(keyword.trim())) {
      showNotification("Keyword already exists!");
      return;
    }

    formik.setFieldValue("searchKeywords", [
      ...formik.values.searchKeywords,
      keyword.trim(),
    ]);
    setKeyword("");
  };

  const updateDecision = (decision: IDecision) => {
    POST(
      "UpdateOrder",
      decision,
      () => {
        showNotification("Court decision updated successfully!");
        setIsLoading(false);

        onSubmit();
        onClose();
      },
      () => setIsLoading(false)
    );
  };

  const validationSchema = yup.object({
    caseOrderID: yup.number().required("Case Order ID is required!"),
    caseNumber: yup.string().required("Case Number is required!"),
    summary: yup.string().required("Summary is required!"),
    startDate: yup.string().required("Start Date is required!"),
    expireDate: yup.string().required("Expire Date is required!"),
    recordDate: yup.string().required("Record Date is required!"),
    r2Path: yup.string().required("R2 Path is required!"),
    relatedPerson: yup
      .array()
      .of(
        yup.object({
          nameSurname: yup.string().required("Name Surname is required!"),
          idNumber: yup.string().nullable().required("ID Number is required!"),
        })
      )
      .min(1, "At least 1 person are required!")
      .required("Related Person is required!"),
    relatedProperties: yup
      .array()
      .of(
        yup.object({
          propertyNumber: yup
            .string()
            .nullable()
            .required("Property Number is required!"),
          propertyDesc: yup
            .string()
            .required("Property Description is required!"),
          ProperyType: yup.string().required("Property Type is required!"),
        })
      )
      .required("Related Properties is required!"),
    searchKeywords: yup
      .array()
      .of(yup.string().required("Keyword is required!"))
      .required("Search Keywords are required!"),
  });

  const formik = useFormik({
    initialValues: decision,
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      updateDecision(values);
    },
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Update Court Decision</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Edit and update court decision details.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-6 max-h-[50vh] md:max-h-[70vh] overflow-y-auto px-4"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="caseNumber">Case</FieldLabel>
              <Input
                id="caseNumber"
                name="caseNumber"
                type="text"
                required={true}
                disabled={isLoading}
                value={formik.values.caseNumber}
                onChange={formik.handleChange}
                placeholder="Case"
              />
              {formik.touched.caseNumber && formik.errors.caseNumber && (
                <FieldError>{formik.errors.caseNumber}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="title">Summary</FieldLabel>
              <Textarea
                id="summary"
                name="summary"
                required={true}
                disabled={isLoading}
                value={formik.values.summary}
                onChange={formik.handleChange}
                placeholder="Summary"
              />
              {formik.touched.summary && formik.errors.summary && (
                <FieldError>{formik.errors.summary}</FieldError>
              )}
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required={true}
                  disabled={isLoading}
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  placeholder="Start Date"
                />
                {formik.touched.startDate && formik.errors.startDate && (
                  <FieldError>{formik.errors.startDate}</FieldError>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="expireDate">Expire Date</FieldLabel>
                <Input
                  id="expireDate"
                  name="expireDate"
                  type="date"
                  required={true}
                  disabled={isLoading}
                  value={formik.values.expireDate}
                  onChange={formik.handleChange}
                  placeholder="Expire Date"
                />
                {formik.touched.expireDate && formik.errors.expireDate && (
                  <FieldError>{formik.errors.expireDate}</FieldError>
                )}
              </Field>
            </div>
          </FieldGroup>
          <FieldSeparator />
          <FieldGroup>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <FieldLabel className="text-sm font-semibold">
                Related People
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
                Add Person
              </Button>
            </div>
            {formik.touched.relatedPerson &&
              formik.errors.relatedPerson &&
              (typeof formik.errors.relatedPerson === "string" ? (
                <FieldError>{formik.errors.relatedPerson}</FieldError>
              ) : null)}
            <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto] items-start gap-4">
              {formik.values.relatedPerson.map((_, index) => (
                <Fragment key={index}>
                  <Field className="col-span-2 sm:col-span-1">
                    <FieldLabel htmlFor={`relatedPerson.${index}.nameSurname`}>
                      Person {index} Full Name
                    </FieldLabel>
                    <Input
                      id={`relatedPerson.${index}.nameSurname`}
                      name={`relatedPerson.${index}.nameSurname`}
                      type="text"
                      required={true}
                      disabled={isLoading}
                      value={formik.values.relatedPerson[index].nameSurname}
                      onChange={formik.handleChange}
                      placeholder="Name Surname"
                    />
                    {formik.touched.relatedPerson?.[index]?.nameSurname &&
                      typeof formik.errors.relatedPerson?.[index] ===
                        "object" &&
                      formik.errors.relatedPerson[index]?.nameSurname && (
                        <FieldError>
                          {formik.errors.relatedPerson?.[index].nameSurname}
                        </FieldError>
                      )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`relatedPerson.${index}.idNumber`}>
                      Person {index + 1} ID Number
                    </FieldLabel>
                    <Input
                      id={`relatedPerson.${index}.idNumber`}
                      name={`relatedPerson.${index}.idNumber`}
                      type="number"
                      required={true}
                      disabled={isLoading}
                      value={formik.values.relatedPerson[index].idNumber ?? ""}
                      onChange={formik.handleChange}
                      placeholder="ID Number"
                    />
                    {formik.touched.relatedPerson?.[index]?.idNumber &&
                      typeof formik.errors.relatedPerson?.[index] ===
                        "object" &&
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
                          (_, i) => i !== index
                        )
                      )
                    }
                    disabled={isLoading}
                    aria-label={`Remove person ${index + 1}`}
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
                Related Properties
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
                Add Property
              </Button>
            </div>
            {formik.touched.relatedProperties &&
              formik.errors.relatedProperties &&
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
                    Property {index + 1} Number
                  </FieldLabel>
                  <Input
                    id={`relatedProperties.${index}.propertyNumber`}
                    name={`relatedProperties.${index}.propertyNumber`}
                    type="number"
                    required={true}
                    disabled={isLoading}
                    value={
                      formik.values.relatedProperties[index].propertyNumber ??
                      ""
                    }
                    onChange={formik.handleChange}
                    placeholder="Property Number"
                  />
                  {formik.touched.relatedProperties?.[index]?.propertyNumber &&
                    typeof formik.errors.relatedProperties?.[index] ===
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
                    Property {index + 1} Type
                  </FieldLabel>
                  <Input
                    id={`relatedProperties.${index}.ProperyType`}
                    name={`relatedProperties.${index}.ProperyType`}
                    type="text"
                    required={true}
                    disabled={isLoading}
                    value={formik.values.relatedProperties[index].ProperyType}
                    onChange={formik.handleChange}
                    placeholder="Property Type"
                  />
                  {formik.touched.relatedProperties?.[index]?.ProperyType &&
                    typeof formik.errors.relatedProperties?.[index] ===
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
                        (_, i) => i !== index
                      )
                    )
                  }
                  disabled={isLoading}
                  aria-label={`Remove property ${index + 1}`}
                >
                  <Trash2 />
                </Button>
                <Field className="col-span-2 sm:col-span-3">
                  <FieldLabel
                    htmlFor={`relatedProperties.${index}.propertyDesc`}
                  >
                    Property {index + 1} Description
                  </FieldLabel>
                  <Textarea
                    id={`relatedProperties.${index}.propertyDesc`}
                    name={`relatedProperties.${index}.propertyDesc`}
                    required={true}
                    disabled={isLoading}
                    value={formik.values.relatedProperties[index].propertyDesc}
                    onChange={formik.handleChange}
                    placeholder="Property Description"
                  />
                  {formik.touched.relatedProperties?.[index]?.propertyDesc &&
                    typeof formik.errors.relatedProperties?.[index] ===
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
                Search Keywords
              </FieldLabel>
              <Input
                id="keyword"
                name="keyword"
                type="text"
                disabled={isLoading}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Type keyword..."
              />
              <Button
                type="button"
                variant="outline"
                disabled={keyword === ""}
                onClick={addKeyword}
              >
                Add Keyword
              </Button>
            </div>
            {formik.touched.searchKeywords &&
              formik.errors.searchKeywords &&
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
                          (_keyword) => _keyword !== keyword
                        )
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
          <DialogClose asChild disabled={isLoading}>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={isLoading}
            onClick={() => formik.handleSubmit()}
          >
            {isLoading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShowDecisionDialog({
  decision,
  onSubmit,
  onClose,
}: ShowAndUpdateDecisionDialogProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="flex flex-col sm:flex-row items-center gap-2 truncate">
            <p>Case {decision.caseNumber}</p>
            <Badge variant="outline">{formatDate(decision.recordDate)}</Badge>
          </DialogTitle>
        </DialogHeader>
        <FieldGroup className="max-h-[50vh] md:max-h-[70vh] overflow-y-auto px-4">
          <div className="grid grid-cols-2 gap-4">
            <Field className="col-span-2">
              <FieldLabel htmlFor="description">Summary</FieldLabel>
              <p className="text-sm text-muted-foreground text-justify">
                {decision.summary}
              </p>
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Start Date</FieldLabel>
              <p className="text-sm text-muted-foreground text-justify">
                {formatDate(decision.startDate)}
              </p>
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Expire Date</FieldLabel>
              <p className="text-sm text-muted-foreground text-justify">
                {formatDate(decision.expireDate)}
              </p>
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="description">Related People</FieldLabel>
              {decision.relatedPerson.map((person, index) => (
                <div key={index} className="flex items-center gap-3">
                  <h4 className="text-sm font-semibold text-foreground">
                    {person.nameSurname}
                  </h4>
                  <Badge variant="outline">{person.idNumber}</Badge>
                </div>
              ))}
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="description">Related Properties</FieldLabel>
              {decision.relatedProperties.map((property, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div key={index} className="flex items-center gap-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      {property.ProperyType}
                    </h4>
                    <Badge variant="outline">{property.propertyNumber}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground text-justify">
                    {property.propertyDesc}
                  </p>
                </div>
              ))}
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="description">Keywords</FieldLabel>
              <div className="flex items-center flex-wrap gap-1">
                {decision.searchKeywords.map((keyword, index) => (
                  <Badge key={index} variant="outline">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Field>
          </div>
        </FieldGroup>
        <DialogFooter className="p-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <Button type="submit" onClick={() => onSubmit()}>
            Update Decision
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CourtDecisions;
