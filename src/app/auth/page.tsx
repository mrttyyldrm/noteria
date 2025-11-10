"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/context/LanguageContext";
import useFetch from "@/hooks/useFetch";
import { useFormik } from "formik";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";

function Auth() {
  const { t, isLanguageLoading } = useLanguage();

  const { loading: authLoading, fetch: fetchAuth } = useFetch("POST", "Auth");
  const { fetch: fetchCheckOTP } = useFetch("GET", "CheckOTP");

  const validationSchema = Yup.object({
    email: Yup.string().required(t("2C936F5BA")).email(t("9F2BE0310")),
    password: Yup.string().required(t("2C936F5BA")),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      requestID: "",
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      auth();
    },
  });

  const otpRef = useRef<HTMLInputElement>(null);

  const [qrLink, setQrLink] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [code, setCode] = useState<string>("");
  const [isOTPInvalid, setIsOTPInvalid] = useState<boolean>(false);
  const [checkOTPLoading, setCheckOTPLoading] = useState<boolean>(false);

  const auth = () => {
    fetchAuth({
      params: {
        Email: formik.values.email,
        Pass: formik.values.password,
      },
      onSuccess: (data) => {
        formik.setFieldValue("requestID", data.requestID);
        setCurrentStep(data.mfaqr ? 2 : 3);
        setQrLink(data.mfaqr || "");
      },
    });
  };

  const checkOTP = () => {
    fetchCheckOTP({
      params: {
        OTP: code,
        requestID: formik.values.requestID,
      },
      onSuccess: () => {
        location.href = "/dashboard";
      },
      onError: () => {
        setIsOTPInvalid(true);
        setCheckOTPLoading(false);
        setCode("");

        setTimeout(() => {
          setIsOTPInvalid(false);
        }, 2000);
      },
      onLoading: (loading) => {
        if (loading) setCheckOTPLoading(loading);
      },
    });
  };

  useEffect(() => {
    if (currentStep === 3) {
      setTimeout(() => {
        if (otpRef.current) {
          otpRef.current.focus();
        }
      }, 100);
    }
  }, [currentStep]);

  useEffect(() => {
    if (isLanguageLoading) return;

    formik.validateForm();
  }, [isLanguageLoading]);

  useEffect(() => {
    if (code.length === 6 && !checkOTPLoading && currentStep === 3) {
      checkOTP();
    }
  }, [code]);

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col gap-6">
        {currentStep === 1 && (
          <>
            <div className="flex flex-col items-center text-center gap-2">
              <h1 className="text-3xl font-semibold">{t("6DFA8AFAB")}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {t("C52C391DA")}
              </p>
            </div>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-6"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">{t("F69047778")}</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    disabled={authLoading}
                    placeholder={t("F69047778")}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    aria-invalid={
                      formik.touched.email && formik.errors.email
                        ? "true"
                        : "false"
                    }
                  />
                  {formik.touched.email && formik.errors.email && (
                    <FieldError>{formik.errors.email}</FieldError>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">{t("CE78FC317")}</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    disabled={authLoading}
                    placeholder={t("CE78FC317")}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    aria-invalid={
                      formik.touched.password && formik.errors.password
                        ? "true"
                        : "false"
                    }
                  />
                  {formik.touched.password && formik.errors.password && (
                    <FieldError>{formik.errors.password}</FieldError>
                  )}
                </Field>
                <Field>
                  <Button
                    type="submit"
                    disabled={authLoading}
                    className="w-full"
                  >
                    {authLoading ? <Spinner /> : t("6DFA8AFAB")}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </>
        )}
        {currentStep === 2 && (
          <>
            <div className="flex flex-col items-center text-center gap-2">
              <h1 className="text-3xl font-semibold">{t("6D024C2BC")}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {t("9FCA181DC")}
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="mx-auto p-4 rounded-lg border border-border">
                <QRCodeCanvas width={200} value={qrLink} fgColor="#364a63" />
              </div>
              <Field>
                <Button onClick={() => setCurrentStep(3)} className="w-full">
                  {t("729241038")}
                </Button>
              </Field>
            </div>
          </>
        )}
        {currentStep === 3 && (
          <>
            <div className="flex flex-col items-center text-center gap-2">
              <h1 className="text-3xl font-semibold">{t("F0673494C")}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {t("686CE075D")}
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <Field className="flex justify-center">
                <InputOTP
                  ref={otpRef}
                  maxLength={6}
                  required
                  disabled={checkOTPLoading}
                  value={code}
                  onChange={(value) => {
                    setCode(value);
                    if (isOTPInvalid) {
                      setIsOTPInvalid(false);
                    }
                  }}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:h-10 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-lg">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className={isOTPInvalid ? "border-destructive" : ""}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </Field>
              <Field>
                <Button
                  onClick={() => checkOTP()}
                  disabled={checkOTPLoading}
                  className="w-full"
                >
                  {checkOTPLoading ? <Spinner /> : t("81253CC97")}
                </Button>
              </Field>
            </div>
          </>
        )}
        {currentStep > 1 && (
          <Button
            variant="ghost"
            className="mx-auto"
            onClick={() => setCurrentStep(1)}
          >
            {t("6297AFCE8")}
          </Button>
        )}
      </div>
    </div>
  );
}

export default Auth;
