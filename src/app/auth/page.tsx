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
import { useLanguage } from "@/context/LanguageContext";
import useAPI from "@/hooks/useAPI";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import * as Yup from "yup";

function Auth() {
  const router = useRouter();
  const { t } = useLanguage();
  const { GET, POST } = useAPI();

  const otpRef = useRef<HTMLInputElement>(null);

  const [qrLink, setQrLink] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [code, setCode] = useState<string>("");
  const [isOTPInvalid, setIsOTPInvalid] = useState<boolean>(false);

  const auth = () => {
    if (isLoading) return;

    const authData = {
      Email: formik.values.email,
      Pass: formik.values.password,
    };

    setIsLoading(true);
    POST(
      "Auth",
      authData,
      (data) => {
        formik.setFieldValue("requestID", data.requestID);
        setCurrentStep(data.mfaqr ? 2 : 3);
        setQrLink(data.mfaqr || "");
        setIsLoading(false);
      },
      () => {
        formik.resetForm();
        setIsLoading(false);
      },
    );
  };

  const checkOTP = () => {
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
        setIsOTPInvalid(true);
        setCode("");

        setTimeout(() => {
          setIsOTPInvalid(false);
        }, 2000);
      },
    );
  };

  const validationSchema = Yup.object({
    email: Yup.string()
      .required("This field is required")
      .email("Invalid email format!"),
    password: Yup.string().required("This field is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "mrttyyldrm@gmail.com",
      password: "1234567890",
      requestID: "",
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      auth();
    },
  });

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
    if (code.length === 6 && !isLoading && currentStep === 3) {
      checkOTP();
    }
  }, [code]);

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col gap-6">
        {currentStep === 1 && (
          <>
            <div className="flex flex-col items-center text-center gap-2">
              <h1 className="text-3xl font-semibold">Login</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter your credentials to access your account.
              </p>
            </div>
            <form
              noValidate
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-6"
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    disabled={isLoading}
                    placeholder="Email"
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
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    disabled={isLoading}
                    placeholder="Password"
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
                    {isLoading ? "Loading..." : "Login"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </>
        )}
        {currentStep === 2 && (
          <>
            <div className="flex flex-col items-center text-center gap-2">
              <h1 className="text-3xl font-semibold">Setup Authenticator</h1>
              <p className="text-muted-foreground text-sm text-balance">
                Scan the QR code below with Google Authenticator app to complete
                the setup.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <div className="mx-auto p-4 rounded-lg border border-border">
                <QRCodeCanvas width={200} value={qrLink} fgColor="#364a63" />
              </div>
              <Field>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Loading..." : "Next"}
                </Button>
              </Field>
            </div>
          </>
        )}
        {currentStep === 3 && (
          <>
            <div className="flex flex-col items-center text-center gap-2">
              <h1 className="text-3xl font-semibold">
                Enter Verification Code
              </h1>
              <p className="text-muted-foreground text-sm text-balance">
                Enter the 6-digit code from your Google Authenticator app to
                complete the auth process.
              </p>
            </div>
            <div className="flex flex-col gap-6">
              <Field className="flex justify-center">
                <InputOTP
                  ref={otpRef}
                  maxLength={6}
                  required
                  disabled={isLoading}
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
                  onClick={checkOTP}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Loading..." : "Verify"}
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
            Return to Login
          </Button>
        )}
      </div>
    </div>
  );
}

export default Auth;
