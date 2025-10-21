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
import { Badge } from "@/components/ui/badge";
import { Search, Gavel, Trash2, Info, Download } from "lucide-react";
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
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/dropzone";

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

function CourtDecisions() {
  const { GET } = useAPI();
  const { openProcess } = useDocument();

  const [decisions, setDecisions] = useState<IDecision[] | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [openDecision, setOpenDecision] = useState<IDecision | null>(null);

  const formatDate = (dateString?: string | null): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const isDatePast = (dateString?: string | null): boolean => {
    if (!dateString) return false;

    const today = new Date();
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return false;

    const todayMidnight = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return date < todayMidnight;
  };

  const getCourtDecisions = () => {
    GET("GetCourtList", {}, (data) => {
      setDecisions(data.orders);
    });
  };

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
              <TableHead>Record Date</TableHead>
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
                  <TableCell>{formatDate(decision.recordDate)}</TableCell>
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
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setOpenDecision(decision)}
                    >
                      <Info />
                    </Button>
                    <Link href={decision.r2Path}>
                      <Button variant="outline" size="icon">
                        <Download />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() =>
                        openProcess("delete", decision.caseOrderID, "Court")
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

      {openDecision && (
        <ShowAndUpdateDecisionDialog
          decision={openDecision}
          onClose={() => setOpenDecision(null)}
        />
      )}
    </section>
  );
}

interface ShowAndUpdateDecisionDialogProps {
  decision: IDecision;
  onClose: () => void;
}

function ShowAndUpdateDecisionDialog({
  decision,
  onClose,
}: ShowAndUpdateDecisionDialogProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    const fileName = file.name.split(".").slice(0, -1).join(".");

    formik.setFieldValue("file", file);
    formik.setFieldValue("title", fileName);
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
    onSubmit: (values) => {},
  });

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Court Decision</DialogTitle>
          <DialogDescription className="flex flex-col gap-2">
            Edit and update court decision details.
          </DialogDescription>
        </DialogHeader>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-4"
        >
          {isEditing ? (
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="title">Case</FieldLabel>
                <Input
                  id="case"
                  name="case"
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
              <div className="grid grid-cols-2 gap-4">
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
              {/* <Field>
                <FieldLabel htmlFor="file">File</FieldLabel>
                <Dropzone
                  accept={{
                    "application/pdf": [".pdf"],
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                      [".docx"],
                    "application/msword": [".doc"],
                  }}
                  maxFiles={1}
                  disabled={isLoading}
                  maxSize={1024 * 1024 * 50}
                  onDrop={handleDrop}
                  src={
                    formik.values.caseOrderID
                      ? [formik.values.caseOrderID]
                      : undefined
                  }
                >
                  <DropzoneEmptyState />
                  <DropzoneContent />
                </Dropzone>
                {formik.touched.caseOrderID && formik.errors.caseOrderID && (
                  <FieldError>{formik.errors.caseOrderID}</FieldError>
                )}
              </Field> */}
            </FieldGroup>
          ) : (
            <ul className="flex flex-col gap-2">
              <li></li>
            </ul>
          )}
          <DialogFooter>
            <DialogClose asChild disabled={isLoading}>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            {isEditing ? (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Save"}
              </Button>
            ) : (
              <Button type="submit" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CourtDecisions;
