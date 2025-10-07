// import { useToast } from "@/context/ToastContext";
import { useTranslation } from "@/context/TranslationContext";
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

    // const { showMessage } = useToast();
    // const { t } = useTranslation();

    const baseURL = "https://api.noteria.app/";

    const handleAPIResponse = (
        response: Response,
        onSuccess?: (data: object) => void,
        onError?: () => void): Promise<void> | null => {

        if (!response.ok) {
            if (response.status === 401) {
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                router.replace("/login");
                return null;
            }
            else {
                return Promise.reject(new Error());
            }
        }

        if (response.status === 200) {
            const newToken = response.headers.get("nauth");
            console.log("NAUTH: ", newToken, response.headers);

            if (newToken) {
                document.cookie = `token=${newToken}; path=/; samesite=Strict; secure; max-age=1200`;
            }

            return response.json().then((data: any) => {
                onSuccess?.(data);
            });
        }

        if (response.status === 202) {
            return response.json().then(() => {
                // showMessage?.(error.m);
                onError?.();
            });
        }

        return Promise.resolve();
    }

    const GET = (
        path: string,
        params: object,
        onSuccess?: (data: any) => void,
        onError?: () => void) => {

        let parameters = "";

        if (params) {
            const parsedParams = JSON.parse(JSON.stringify(params));
            parameters = "?" + new URLSearchParams(parsedParams).toString();
        }

        const token = getCookie("token");
        const language = getCookie("language");

        fetch(`${baseURL}${path}${parameters}`, {
            method: "GET",
            headers: {
                ...(token && { nauth: token }),
                ...(language && { nlng: language })
            },
            credentials: "include",
        })
            .then(response => handleAPIResponse(response, onSuccess, onError))
        // .catch(() => showMessage(getTranslation("error")));
    }

    const POST = (
        path: string,
        data: object,
        onSuccess?: (data: any) => void,
        onError?: () => void) => {

        const token = getCookie("token");
        const language = getCookie("language");

        fetch(`${baseURL}${path}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token && { nuath: token }),
                ...(language && { nlng: language })
            },
            credentials: "include",
            body: JSON.stringify(data)
        })
            .then(response => handleAPIResponse(response, onSuccess, onError))
        // .catch(() => showMessage(getTranslation("error.")));
    }

    return { GET, POST };
};

export default useAPI;