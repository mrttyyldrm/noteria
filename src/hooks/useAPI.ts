import { useLanguage } from "@/context/LanguageContext";
import { useNotification } from "@/context/NotificationContext";
import { useRouter } from "next/navigation";

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

const useAPI = () => {
  const router = useRouter();

  const { t } = useLanguage();
  const { showNotification } = useNotification();

  const BASE_URL = "https://api.noteria.app/";

  const handleAPIResponse = (
    response: Response,
    onSuccess?: (data: object) => void,
    onError?: () => void,
  ): Promise<void> | null => {
    if (!response.ok) {
      if (response.status === 401) {
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.replace("/auth");
        return null;
      } else {
        return Promise.reject(new Error());
      }
    }

    if (response.status === 200) {
      const newToken = response.headers.get("nauth");

      if (newToken) {
        document.cookie = `token=${newToken}; path=/; samesite=Strict; secure; max-age=1200`;
      }

      return response.json().then((data: any) => {
        onSuccess?.(data);
      });
    }

    if (response.status === 202) {
      return response.json().then((error) => {
        showNotification(error.m);
        onError?.();
      });
    }

    return Promise.resolve();
  };

  const GET = (
    path: string,
    params: object,
    onSuccess?: (data: any) => void,
    onError?: () => void,
  ) => {
    let parameters = "";

    if (Object.keys(params).length > 0) {
      const parsedParams = JSON.parse(JSON.stringify(params));
      parameters = "?" + new URLSearchParams(parsedParams).toString();
    }

    const token = getCookie("token");
    const language = getCookie("language");

    fetch(`${BASE_URL}${path}${parameters}`, {
      method: "GET",
      headers: {
        ...(token && { nauth: token }),
        ...(language && { nlng: language }),
      },
      credentials: "include",
    })
      .then((response) => handleAPIResponse(response, onSuccess, onError))
      .catch(() => {
        showNotification(t("asdad"));
        onError?.();
      });
  };

  const POST = (
    path: string,
    data: object,
    onSuccess?: (data: any) => void,
    onError?: () => void,
  ) => {
    const token = getCookie("token");
    const language = getCookie("language");

    fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { nauth: token }),
        ...(language && { nlng: language }),
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
      .then((response) => handleAPIResponse(response, onSuccess, onError))
      .catch(() => {
        showNotification(t("error.unknown"));
        onError?.();
      });
  };

  return { GET, POST };
};

export default useAPI;
