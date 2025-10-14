"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useTranslation } from "@/context/TranslationContext";
import useAPI from "@/hooks/useAPI";

function Login() {
  const router = useRouter();
  const { t } = useTranslation();
  const { GET, POST } = useAPI();

  const otpRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTimeout, setIsTimeout] = useState<boolean>(false);
  const [countDown, setCountDown] = useState(120);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [code, setCode] = useState<string>("");
  const [isCodeError, setIsCodeError] = useState<boolean>(false);

  const resetTimer = () => {
    setIsTimeout(false);
    setIsCodeError(false);
    setCode("");
    setCountDown(120);
  };

  const sendOTP = () => {
    if (isLoading) return;

    const loginData = {
      Email: formik.values.email,
      Pass: formik.values.password,
    };

    setIsLoading(true);
    POST(
      "Auth",
      loginData,
      (response: any) => {
        formik.setFieldValue("requestID", response.requestID);
        resetTimer();
        setCurrentStep(2);
        setIsLoading(false);
      },
      () => {
        formik.resetForm();
        setIsLoading(false);
      }
    );
  };

  const submitVerify = () => {
    if (isLoading || code.length !== 6) return;

    const verifyData = {
      OTP: code,
      requestID: formik.values.requestID,
    };

    setIsLoading(true);
    GET(
      "CheckOTP",
      verifyData,
      () => {
        router.replace("/dashboard");
      },
      () => {
        setIsLoading(false);
        setIsCodeError(true);
        setCode("");

        setTimeout(() => {
          if (isTimeout) return;
          setIsCodeError(false);
        }, 500);
      }
    );
  };

  const validationSchema = Yup.object({
    email: Yup.string().required(t("validation_required")),
    password: Yup.string().required(t("validation_required")),
  });

  const formik = useFormik({
    initialValues: {
      email: "mrttyyldrm@gmail.com",
      password: "1234567890",
      requestID: "",
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      sendOTP();
    },
  });

  useEffect(() => {
    if (currentStep === 2 && !isTimeout) {
      setTimeout(() => {
        if (otpRef.current) {
          otpRef.current.focus();
        }
      }, 100);

      const timer = setInterval(() => {
        setCountDown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeout(true);
            setCode("");
            setIsCodeError(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentStep, isTimeout]);

  useEffect(() => {
    if (code.length === 6 && !isLoading && currentStep === 2) {
      submitVerify();
    }
  }, [code]);

  return (
    <div className="w-full max-w-[40rem]">
      <div className="flex flex-col gap-8">
        {currentStep === 1 && (
          <>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-3xl font-semibold">{t("login")}</h1>
              <p className="text-muted-foreground text-sm text-balance">
                {t("login_subtitle")}
              </p>
            </div>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-6"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    disabled={isLoading}
                    placeholder={t("email")}
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
                  <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    disabled={isLoading}
                    placeholder={t("password")}
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
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Loading..." : t("login")}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </>
        )}
        {currentStep === 2 && (
          <>
            <div className="flex flex-col items-center text-center gap-2">
              <h1 className="text-3xl font-semibold">
                {t("two_step_verification")}
              </h1>
              <p className="text-muted-foreground text-sm text-balance">
                {t("two_step_description").replace(
                  "{email}",
                  formik.values.email
                )}
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <Field className="flex justify-center">
                <InputOTP
                  ref={otpRef}
                  maxLength={6}
                  required
                  value={code}
                  onChange={(value) => {
                    setCode(value);
                    if (isCodeError) {
                      setIsCodeError(false);
                    }
                  }}
                  disabled={countDown === 0}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:h-10 *:data-[slot=input-otp-slot]:w-10 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-lg">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className={isCodeError ? "border-destructive" : ""}
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
                {isCodeError && (
                  <FieldError>Invalid verification code</FieldError>
                )}
              </Field>
              <div className="flex justify-center text-center">
                <p
                  className={`text-sm font-medium transition-colors duration-300 ${
                    countDown <= 30
                      ? "text-destructive"
                      : "text-muted-foreground"
                  }`}
                >
                  {countDown} {t("seconds_short")}
                </p>
              </div>
              <Field>
                {isTimeout ? (
                  <Button onClick={() => sendOTP()} className="w-full">
                    {t("resend")}
                  </Button>
                ) : (
                  <Button
                    onClick={submitVerify}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Loading..." : t("verify_button")}
                  </Button>
                )}
              </Field>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
