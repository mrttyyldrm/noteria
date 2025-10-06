"use client";

import { createContext, useContext, useState } from "react";
import translation from "@/locales/translation.json";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export type LanguageKeys = keyof typeof translation;

interface TranslationContextTypes {
  currentLanguage: LanguageKeys;
  languages?: LanguageKeys[];
  translations: Record<string, string> | [];
  changeLanguage: (languageCode: LanguageKeys) => void;
  t: (languageKey: string) => string;
}

const TranslationContextDefaultValues: TranslationContextTypes = {
  currentLanguage: "en",
  languages: ["en", "sq"],
  translations: {},
  changeLanguage: () => {},
  t: () => "",
};

const TranslationContext = createContext<TranslationContextTypes>(
  TranslationContextDefaultValues
);

export function TranslationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageKeys>(
    TranslationContextDefaultValues.currentLanguage
  );
  const [translations, setTranslations] = useState<Record<string, string>>(
    translation[TranslationContextDefaultValues.currentLanguage] || {}
  );

  const changeLanguage = (newLanguage: LanguageKeys) => {
    if (!TranslationContextDefaultValues.languages?.includes(newLanguage))
      return;

    setCurrentLanguage(newLanguage);
    setTranslations(translation[newLanguage]);
  };

  const t = (languageKey: string) => {
    const value = languageKey.split(".").reduce((object: any, key) => {
      return object?.[key];
    }, translations);

    return value ?? "";
  };

  return (
    <TranslationContext.Provider
      value={{
        currentLanguage,
        translations,
        changeLanguage,
        t,
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}

const languageOptions: Record<LanguageKeys, string> = {
  en: "English",
  sq: "Shqip",
};

export function TranslationDropdown() {
  const { currentLanguage, changeLanguage } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuGroup>
          {Object.entries(languageOptions).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              disabled={key === currentLanguage}
              textValue={key}
              onSelect={() => changeLanguage(key as LanguageKeys)}
            >
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
