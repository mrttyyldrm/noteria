"use client";

import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { Button, Text, Input, Title } from "@/components/";
import useAPI from "@/hooks/useAPI";
import clsx from "clsx";

function Login() {
  const router = useRouter();
  const { GET, POST } = useAPI();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTimeout, setIsTimeout] = useState<boolean>(false);
  const [countDown, setCountDown] = useState(120);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  const [phone, setPhone] = useState<string>("");

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isCodeError, setIsCodeError] = useState<boolean>(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const changeValidationCode = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.key;
    const isNumber = /^[0-9]$/.test(value);
    const newCode = [...code];

    if (value === "Backspace") {
      newCode[index] = "";

      if (index > 0) {
        codeRefs.current[index - 1]?.focus();
      }
    } else if (isNumber) {
      newCode[index] = value;

      if (index < codeRefs.current.length - 1 && newCode[index + 1] === "") {
        codeRefs.current[index + 1]?.focus();
      }
    } else {
      e.preventDefault();
    }

    if (isCodeError) {
      setIsCodeError(false);
    }

    setCode(newCode);
  };

  const submitVerify = () => {
    if (isLoading) return;

    const OTPCode = code.join("");

    if (OTPCode.length === 6) {
      const verifyData = {
        OTP: OTPCode,
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
          setCode(["", "", "", "", "", ""]);
          codeRefs.current[0]?.focus();

          setTimeout(() => {
            if (isTimeout) return;

            setIsCodeError(false);
          }, 500);
        }
      );
    }
  };

  const resetTimer = () => {
    setIsTimeout(false);
    setIsCodeError(false);
    setCode(["", "", "", "", "", ""]);
    setCountDown(120);
  };

  const sendOTP = () => {
    if (isLoading) return;

    const loginData = {
      Email: formik.values.email,
      Pass: formik.values.password,
    };

    setPhone("");
    setIsLoading(true);
    POST(
      "Auth",
      loginData,
      (response: any) => {
        resetTimer();
        setPhone(response.phone);
        setCurrentStep(2);
        setIsLoading(false);
      },
      () => {
        formik.resetForm();
        setIsLoading(false);
      }
    );
  };

  const validationSchema = Yup.object({
    email: Yup.string().required("Bu alan zorunludur!"),
    password: Yup.string().required("Bu alan zorunludur!"),
  });

  const formik = useFormik({
    initialValues: {
      email: "mrttyyldrm@gmail.com",
      password: "1234567890",
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      sendOTP();
    },
  });

  useEffect(() => {
    if (currentStep === 2 && !isTimeout) {
      codeRefs.current[0]?.focus();
      const timer = setInterval(() => {
        setCountDown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimeout(true);
            setCode(["", "", "", "", "", ""]);
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
    if (code.join("").length === 6 && !isLoading) {
      submitVerify();
    }
  }, [code]);

  return (
    <article id="login" className="w-full max-w-[35rem]">
      <div id="login-content" className="flex flex-col gap-[2rem]">
        <div id="login-title" className="text-center">
          <Title>{currentStep === 1 ? "Login" : "Verify OTP"}</Title>
          {currentStep === 2 && phone && (
            <Text>
              OTP message sent to <b>{phone}</b>
            </Text>
          )}
        </div>
        {currentStep === 1 && (
          <div id="login-form" className="flex w-full flex-col gap-[2rem]">
            <form
              noValidate
              onSubmit={formik.handleSubmit}
              className="flex flex-col gap-[2rem]"
            >
              <Input
                name="email"
                label="Email"
                type="text"
                value={formik.values.email}
                error={formik.touched.email ? formik.errors.email : ""}
                onChange={formik.handleChange}
              />
              <Input
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                error={formik.touched.password ? formik.errors.password : ""}
                onChange={formik.handleChange}
              />
              <Button loading={isLoading}>Login</Button>
            </form>
          </div>
        )}
        {currentStep === 2 && (
          <div id="forgot-verify" className="flex flex-col gap-[2rem]">
            <div id="verify-controls">
              <form
                noValidate
                onSubmit={formik.handleSubmit}
                className="grid grid-cols-6 items-stretch gap-[1rem]"
              >
                {code.map((value, index) => (
                  <input
                    type="text"
                    inputMode="numeric"
                    name={`verify-${index}`}
                    key={index}
                    value={value}
                    ref={(el) => {
                      codeRefs.current[index] = el;
                    }}
                    disabled={countDown === 0 ? true : false}
                    onKeyDown={(e) => changeValidationCode(e, index)}
                    className={clsx(
                      "transition-color rounded-[1rem] p-[1.2rem] text-center text-md font-semibold text-black outline-none duration-300 border",
                      {
                        "border-gray-light": !isCodeError && value === "",
                        "border-primary": !isCodeError && value !== "",
                      },
                      {
                        "border-error": isCodeError,
                      }
                    )}
                  />
                ))}
              </form>
            </div>
            <div
              id="verify-countydown"
              className="border- flex justify-center text-center"
            >
              <Text
                color={countDown <= 30 ? "text-error" : "text-gray"}
                weight="font-semibold"
                className="transition-colors duration-300"
              >
                {countDown} sec.
              </Text>
            </div>
            <div
              id="verify-button"
              className="flex flex-col items-center gap-[2rem]"
            >
              {isTimeout ? (
                <Button onClick={() => sendOTP()} className="w-full">
                  Resend
                </Button>
              ) : (
                <Button
                  loading={isLoading}
                  onClick={submitVerify}
                  className="w-full"
                >
                  Verify
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default Login;
