"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import * as React from "react";
import { JSX } from "react";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

export function ThemeButton() {
  const { systemTheme, theme, setTheme } = useTheme();

  const themeIcons: Record<string, JSX.Element> = {
    light: <Moon />,
    dark: <Sun />,
  };

  const currentTheme = (theme === "system" ? systemTheme : theme) || "light";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
    >
      {themeIcons[currentTheme]}
    </Button>
  );
}
