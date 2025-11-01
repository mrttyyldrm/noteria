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
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import useAPI from "@/hooks/useAPI";
import { useNotification } from "@/context/NotificationContext";

function Reset() {
  const router = useRouter();
  const params = useParams();
  const { showNotification } = useNotification();
  const { GET } = useAPI();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetPassword = () => {
    if (isLoading) return;

    const resetData = {
      RequestID: params.hash,
      NewPass: formik.values.password,
    };

    setIsLoading(true);
    GET(
      "ResetPassword",
      resetData,
      () => {
        showNotification(
          "Your password has been successfully changed!",
          "success"
        );
        router.replace("/auth");
        setIsLoading(false);
      },
      () => {
        formik.resetForm();
        setIsLoading(false);
      }
    );
  };

  const validationSchema = Yup.object({
    password: Yup.string().required("This field is required!"),
    repassword: Yup.string()
      .required("This field is required!")
      .oneOf([Yup.ref("password")], "Passwords must match!"),
  });

  const formik = useFormik({
    initialValues: {
      password: "",
      repassword: "",
    },
    validationSchema: validationSchema,
    onSubmit: () => {
      resetPassword();
    },
  });

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold">Reset Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your new password to reset your account.
          </p>
        </div>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
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
              />
              <FieldDescription className="text-xs">
                Recommend using 8 or more characters that are a mix of letters,
                numbers, and symbols.
              </FieldDescription>
              {formik.touched.password && formik.errors.password && (
                <FieldError>{formik.errors.password}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="repassword">Confirm Password</FieldLabel>
              <Input
                id="repassword"
                name="repassword"
                type="password"
                disabled={isLoading}
                placeholder="Confirm Password"
                value={formik.values.repassword}
                onChange={formik.handleChange}
              />
              {formik.touched.repassword && formik.errors.repassword && (
                <FieldError>{formik.errors.repassword}</FieldError>
              )}
            </Field>
            <Field>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Reseting..." : "Reset Password"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}

export default Reset;
