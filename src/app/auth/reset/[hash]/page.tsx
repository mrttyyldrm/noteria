"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import useFetch from "@/hooks/useFetch";
import { useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import * as Yup from "yup";

function Reset() {
  const router = useRouter();
  const params = useParams();
  const { showNotification } = useNotification();
  const { t, isLanguageLoading } = useLanguage();

  const { loading, fetch } = useFetch("GET", "ResetPass");

  const resetPassword = () => {
    fetch({
      params: {
        RequestID: params.hash,
        NewPass: formik.values.password,
      },
      onSuccess: () => {
        showNotification(t("FC77C34B3"), "success");
        router.replace("/auth");
      },
      onError: () => formik.resetForm(),
    });
  };

  const validationSchema = Yup.object({
    password: Yup.string().required(t("2C936F5BA")),
    repassword: Yup.string()
      .required(t("2C936F5BA"))
      .oneOf([Yup.ref("password")], t("230B5524D")),
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

  useEffect(() => {
    if (isLanguageLoading) return;

    formik.validateForm();
  }, [isLanguageLoading]);

  return (
    <div className="w-full max-w-xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold">{t("6E41E68BE")}</h1>
          <p className="text-muted-foreground text-sm text-balance">
            {t("B8E473388")}
          </p>
        </div>
        <form
          noValidate
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-6"
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">{t("CE78FC317")}</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                disabled={loading}
                placeholder={t("CE78FC317")}
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              <FieldDescription className="text-xs">
                {t("3E5A68B3D")}
              </FieldDescription>
              {formik.touched.password && formik.errors.password && (
                <FieldError>{formik.errors.password}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="repassword">{t("A2B162E01")}</FieldLabel>
              <Input
                id="repassword"
                name="repassword"
                type="password"
                disabled={loading}
                placeholder={t("A2B162E01")}
                value={formik.values.repassword}
                onChange={formik.handleChange}
              />
              {formik.touched.repassword && formik.errors.repassword && (
                <FieldError>{formik.errors.repassword}</FieldError>
              )}
            </Field>
            <Field>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Spinner /> : t("8E8050D17")}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
}

export default Reset;
