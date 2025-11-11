"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Field, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useDocument } from "@/context/DocumentContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import useFetch from "@/hooks/useFetch";
import { File, FileUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface IStatus {
  isValid: boolean;
  message: string;
  courtDoc: string;
  parameters: string[];
}

function Dashboard() {
  const { showNotification } = useNotification();
  const { t } = useLanguage();
  const { selectedDocument, documents, selectDocument } = useDocument();

  const { loading: isVerifying, fetch: fetchVerifyDocument } = useFetch(
    "GET",
    "CheckDoc",
  );
  const { loading: calculatePriceLoading, fetch: fetchCalculatePrice } =
    useFetch("GET", "CalcPrice");

  const [status, setStatus] = useState<IStatus>({
    isValid: true,
    message: "",
    courtDoc: "",
    parameters: [],
  });
  const [price, setPrice] = useState<number | "">("");
  const [details, setDetails] = useState<Record<string, number> | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const verifyDocument = () => {
    if (!selectedDocument || isVerifying) return;

    fetchVerifyDocument({
      params: { DocID: selectedDocument.documentID },
      onSuccess: (data: IStatus) => {
        setStatus(data);

        if (!data.isValid) return;

        setCurrentStep(2);
      },
      onLoading: (loading) => {
        if (loading) setOpen(false);
      },
    });
  };

  const calcPrice = () => {
    if (!price || calculatePriceLoading) return;

    fetchCalculatePrice({
      params: { Price: price },
      onSuccess: (data) => {
        setDetails(data);
      },
      onLoading: (loading) => {
        if (loading) setDetails({});
      },
    });
  };

  const finishDocument = () => {
    selectDocument(null);
    showNotification(t("CEDBABF59"), "success");
    setCurrentStep(1);
  };

  return (
    <section className="relative rounded-b-lg w-full h-full gap-4 overflow-hidden flex justify-center items-center">
      {currentStep === 1 ? (
        selectedDocument !== null ? (
          <>
            {isVerifying && (
              <Skeleton className="absolute top-0 left-0 w-full h-full rounded-t-none z-50 flex justify-center items-center">
                <Empty className="p-2">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-white/20">
                      <FileUp />
                    </EmptyMedia>
                    <EmptyTitle>{t("4BB8EF004")}</EmptyTitle>
                    <EmptyDescription>{t("6815D771D")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </Skeleton>
            )}
            <iframe
              src={`${process.env.NEXT_PUBLIC_BASE_URL}/document?id=${selectedDocument.documentID}&mode=edit`}
              className="w-full h-full"
            />
            <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 shadow-lg">
              <Button variant="outline" onClick={() => selectDocument(null)}>
                {t("CE4708006")}
              </Button>
              {selectedDocument.editable && (
                <Button disabled={isVerifying} onClick={() => setOpen(true)}>
                  {isVerifying ? <Spinner /> : t("FD0C7F9C4")}
                </Button>
              )}
            </Card>
          </>
        ) : (
          documents !== null && (
            <Empty className="p-2">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <File />
                </EmptyMedia>
                <EmptyTitle>{t("6EB16FCAD")}</EmptyTitle>
                <EmptyDescription>{t("E8FAC7E57")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )
        )
      ) : null}

      {currentStep === 2 && (
        <>
          <div className="p-4 w-full max-w-md mx-auto flex flex-col items-center gap-4 mb-11">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-3xl font-semibold">{t("404CC10E0")}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {t("534870AF8")}
              </p>
            </div>
            <ButtonGroup className="w-full max-w-xs">
              <InputGroup>
                <InputGroupInput
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder={t("B5CF6ADC6")}
                />
                <InputGroupAddon align="inline-end">€</InputGroupAddon>
              </InputGroup>
              <Button variant="outline" onClick={calcPrice}>
                {t("A49592C0B")}
              </Button>
            </ButtonGroup>
            {details !== null ? (
              Object.keys(details).length > 0 ? (
                <Card className="w-full max-w-xs py-4 gap-4">
                  <CardHeader className="px-4">
                    <CardTitle className="text-muted-foreground font-normal text-center">
                      {t("D1889CDF6")}
                    </CardTitle>
                    <p className="text-4xl font-semibold text-foreground text-center">
                      {Object.values(details)
                        .reduce((sum, value) => sum + value, 0)
                        .toFixed(2)}
                      <span className="text-xl ml-1">€</span>
                    </p>
                  </CardHeader>
                  <Separator />
                  <CardContent className="flex flex-col gap-4 px-4">
                    <ul className="flex flex-col gap-3">
                      {Object.entries(details).map(([key, value]) => (
                        <li
                          key={key}
                          className="flex justify-between items-center gap-2"
                        >
                          <p className="text-sm text-muted-foreground">{key}</p>
                          <p className="text-sm text-foreground font-semibold">
                            {value.toFixed(2)} €
                          </p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                <Skeleton className="w-full h-96 max-w-xs" />
              )
            ) : null}
          </div>
          <Card className="p-2 absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 shadow-lg">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              {t("3CF519BD6")}
            </Button>
            <Button onClick={() => setCurrentStep(3)}>{t("B970607EA")}</Button>
          </Card>
        </>
      )}

      {currentStep === 3 && (
        <>
          <iframe
            src={`${process.env.NEXT_PUBLIC_BASE_URL}/document?id=${selectedDocument?.documentID}&mode=print`}
            className="w-full h-full"
          />
          <Card className="absolute p-2 bottom-2 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2 shadow-lg">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              {t("3CF519BD6")}
            </Button>
            <Button onClick={finishDocument}>{t("C9FA164C5")}</Button>
          </Card>
        </>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("B5A943A0F")}</AlertDialogTitle>
            <AlertDialogDescription>{t("6EC830880")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("1AF8F06BC")}</AlertDialogCancel>
            <Button onClick={verifyDocument}>{t("67C4B27A7")}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!status.isValid}
        onOpenChange={(open) =>
          !open &&
          setStatus({
            isValid: true,
            message: "",
            courtDoc: "",
            parameters: [],
          })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("C267D86DF")}</AlertDialogTitle>
            <AlertDialogDescription>{status.message}</AlertDialogDescription>
            <Field>
              <FieldLabel>{t("A142D666D")}</FieldLabel>
              {status.parameters?.length > 0 && (
                <div className="flex items-center flex-wrap gap-1">
                  {status.parameters.map((parameter, index) => (
                    <Badge key={index} variant="outline">
                      {parameter}
                    </Badge>
                  ))}
                </div>
              )}
            </Field>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("1AF8F06BC")}</AlertDialogCancel>
            <Link href={status.courtDoc} target="_blank">
              <Button variant="outline">{t("62CA2893B")}</Button>
            </Link>
            <AlertDialogAction onClick={() => setCurrentStep(2)}>
              {t("E9C175950")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export default Dashboard;
