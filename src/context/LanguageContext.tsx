"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { Loader } from "@/components";
import useAPI, { getCookie } from "@/hooks/useAPI";

interface LanguageContextTypes {
  isLanguageLoading: boolean;
  currentLanguage: string | null;
  languages: Record<string, string> | [];
  languagePackage: Record<string, string>;
  changeLanguage: (languageCode: string) => void;
}

const LanguageContextDefaultValues: LanguageContextTypes = {
  isLanguageLoading: false,
  currentLanguage: "EN",
  languages: {},
  languagePackage: {},
  changeLanguage: () => {},
};

const LanguageContext = createContext<LanguageContextTypes>(
  LanguageContextDefaultValues
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { GET } = useAPI();

  const [isLanguageLoading, setIsLanguageLoading] = useState<boolean>(false);
  const [currentLanguage, setCurrentLanguage] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [languagePackage, setLanguagePackage] = useState<
    Record<string, string>
  >({});

  const checkStoredLanguagePackage = () => {
    const updateDate = localStorage.getItem("languagePackageUpdateDate");
    const todayDate = new Date().toLocaleDateString();

    if (updateDate !== todayDate) {
      localStorage.removeItem("languagePackage");
      localStorage.removeItem("languagePackageUpdateDate");
    }
  };

  const changeLanguage = (languageCode: string) => {
    setIsLanguageLoading(true);
    setCurrentLanguage(languageCode);
    document.cookie = `language=${languageCode}; path=/; samesite=Strict; secure; max-age=31536000;`;

    GET(
      "GetLanguagePackage",
      undefined,
      (response: any) => {
        setLanguagePackage(response);
        localStorage.setItem("languagePackage", JSON.stringify(response));
        localStorage.setItem(
          "languagePackageUpdateDate",
          new Date().toLocaleDateString()
        );
        setIsLanguageLoading(false);
      },
      () => setIsLanguageLoading(false)
    );
  };

  useEffect(() => {
    if (Object.keys(languages).length === 0) {
      setIsLanguageLoading(true);

      GET(
        "GetLanguages",
        undefined,
        (response: any) => {
          setLanguages(
            response.reduce((acc: any, lang: any) => {
              acc[lang.langCode] = lang.languageName;
              return acc;
            }, {})
          );
          setIsLanguageLoading(false);
        },
        () => setIsLanguageLoading(false)
      );
    }
  }, []);

  useEffect(() => {
    checkStoredLanguagePackage();

    const language = getCookie("language");
    const storedLanguagePackage = localStorage.getItem("languagePackage");

    if (!language) {
      const newLanguage = navigator.language.split("-")[0].toUpperCase();

      document.cookie = `language=${newLanguage}; path=/; samesite=Strict; secure; max-age=31536000;`;
      changeLanguage(newLanguage);
      return;
    }

    if (!storedLanguagePackage) {
      changeLanguage(language);
    } else {
      setCurrentLanguage(language);
      setLanguagePackage(JSON.parse(storedLanguagePackage));
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        isLanguageLoading,
        currentLanguage,
        languages,
        languagePackage,
        changeLanguage,
      }}
    >
      {Object.keys(languagePackage).length === 0 ? <Loader /> : children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
