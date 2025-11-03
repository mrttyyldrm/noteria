"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAPI, { getCookie } from "@/hooks/useAPI";
import { Globe } from "lucide-react";
import Image from "next/image";
import { createContext, useContext, useEffect, useState } from "react";

interface LanguageContextTypes {
  isLanguageLoading: boolean;
  currentLanguage: string | null;
  languages: Record<string, string> | [];
  changeLanguage: (languageCode: string) => void;
  t: (languageCode: string) => string;
}

const LanguageContextDefaultValues: LanguageContextTypes = {
  isLanguageLoading: false,
  currentLanguage: "EN",
  languages: {},
  changeLanguage: () => {},
  t: () => "",
};

const LanguageContext = createContext<LanguageContextTypes>(
  LanguageContextDefaultValues,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { GET } = useAPI();

  const [isLanguageLoading, setIsLanguageLoading] =
    useState<LanguageContextTypes["isLanguageLoading"]>(false);
  const [currentLanguage, setCurrentLanguage] =
    useState<LanguageContextTypes["currentLanguage"]>(null);
  const [languages, setLanguages] = useState<LanguageContextTypes["languages"]>(
    {},
  );
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
    if (isLanguageLoading) return;

    setIsLanguageLoading(true);
    setCurrentLanguage(languageCode);
    document.cookie = `language=${languageCode}; path=/; samesite=Strict; secure; max-age=31536000;`;

    GET(
      "GetLanguagePackage",
      {},
      (response: any) => {
        setLanguagePackage(response);
        localStorage.setItem("languagePackage", JSON.stringify(response));
        localStorage.setItem(
          "languagePackageUpdateDate",
          new Date().toLocaleDateString(),
        );
        setIsLanguageLoading(false);
      },
      () => setIsLanguageLoading(false),
    );
  };

  const t = (languageCode: string) => {
    return languagePackage[languageCode];
  };

  useEffect(() => {
    if (Object.keys(languages).length === 0) {
      setIsLanguageLoading(true);

      GET(
        "GetLanguages",
        {},
        (response: any) => {
          setLanguages(
            response.reduce((acc: any, lang: any) => {
              acc[lang.langCode] = lang.languageName;
              return acc;
            }, {}),
          );
          setIsLanguageLoading(false);
        },
        () => setIsLanguageLoading(false),
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

  const value = {
    isLanguageLoading,
    currentLanguage,
    languages,
    languagePackage,
    changeLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {Object.keys(languagePackage).length === 0 ? (
        <LanguageLoader />
      ) : (
        children
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

function LanguageLoader() {
  return (
    <dialog className="fixed left-0 top-0 z-[100] flex h-full w-full items-center justify-center bg-white p-4 lg:h-screen">
      <div className="relative h-28 w-28 scale-75 md:scale-100">
        <div className="absolute inset-0 rounded-full bg-primary/15 animate-ping"></div>
        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={96}
            height={96}
            className="w-full h-full animate-scale"
          />
        </div>
      </div>
    </dialog>
  );
}

export function LanguageDropdown() {
  const { languages, currentLanguage, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuGroup>
          {Object.entries(languages).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              disabled={key === currentLanguage}
              textValue={key}
              onSelect={() => changeLanguage(key)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
