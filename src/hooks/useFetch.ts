import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

export const getCookie = (cookieName: string): string | null => {
  const name = `${cookieName}=`;
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }

  return null;
};

interface IOptions {
  params?: Record<string, any>;
  onSuccess?: (data: any) => void,
  onError?: (error: string) => void,
  onLoading?: (loading: boolean) => void
}

const useFetch = (
  method: "GET" | "POST",
  path: string,
) => {
  const router = useRouter();
  const { t } = useLanguage();
  const { showNotification } = useNotification();

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const doFetch = useCallback(async (options: IOptions = {}) => {
    if (loading) return;

    const { params, onSuccess, onError, onLoading } = options;

    setLoading(true);
    setError(null);
    setData(null);
    onLoading?.(true);

    try {
      let parameters = "";

      if (method === "GET" && params && Object.keys(params).length > 0) {
        const parsedParams = JSON.parse(JSON.stringify(params));
        parameters = "?" + new URLSearchParams(parsedParams).toString();
      }

      const token = getCookie("token");
      const language = getCookie("language");

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}${path}${method === "GET" ? parameters : ""}`, {
        method,
        headers: {
          ...(token && { nauth: token }),
          ...(language && { nlng: language }),
          ...(method === "POST" && { "Content-Type": "application/json" }),
        },
        ...((method === "POST" && { body: JSON.stringify(params) })),
        credentials: "include",
      });

      if (!response.ok && response.status === 401) {
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.replace("/auth");
        throw new Error(t("4256EEA6A"));
      }

      const result = await response.json();

      if (response.status === 200) {
        const newToken = response.headers.get("nauth");
        if (newToken) {
          document.cookie = `token=${newToken}; path=/; samesite=Strict; secure; max-age=1200`;
        }
        setData(result);
        onSuccess?.(result);
      }

      if (response.status === 202) {
        throw new Error(result.m || t("894FF0F4F"));
      }

    } catch (error: unknown) {
      if (error instanceof Error) {
        showNotification(error.message);
        setError(error.message);
        onError?.(error.message);
      }
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  }, [method, path, t]);

  return { data, error, loading, fetch: doFetch };
};

export default useFetch;