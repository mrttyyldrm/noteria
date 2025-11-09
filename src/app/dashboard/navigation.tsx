"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import {
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocument } from "@/context/DocumentContext";
import { LanguageDropdown, useLanguage } from "@/context/LanguageContext";
import useFetch from "@/hooks/useFetch";
import {
  ChevronsUpDown,
  File,
  FileSearch2,
  Gavel,
  Search,
  SearchIcon,
  SearchX,
  User,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface IProfile {
  userType: string;
  noterLogo: string;
  noterName: string;
  fullName: string;
  userTypeID: number;
}

interface IPage {
  name: string;
  route: string;
  blacklist: number[];
  showcase: string;
  description: string;
}

interface ISuggestion {
  resultText: string;
  resultType: "Document" | "Profile" | "Url";
  detail: any;
}

const suggestionIcons: { [key in ISuggestion["resultType"]]: React.ReactNode } =
  {
    Document: <File />,
    Profile: <User />,
    Url: <Gavel />,
  };

function SidebarNavigation() {
  const { t, isLanguageLoading } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpen, isMobile } = useSidebar();
  const { selectDocument } = useDocument();

  const { data: profile, fetch: fetchGetProfile } = useFetch<IProfile>(
    "GET",
    "GetProfile",
  );
  const { loading: searchOptionsLoading, fetch: fetchSearchOptions } = useFetch(
    "GET",
    "Search",
  );

  const [page, setPage] = useState<IPage | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchSuggestions, setSearchSuggestions] = useState<
    ISuggestion[] | null
  >(null);

  const pages: IPage[] = [
    {
      name: t("C3A79F67D"),
      route: "/dashboard/document-management",
      blacklist: [],
      showcase: "/document-management-showcase.png",
      description: t("D38507840"),
    },
    {
      name: t("AF77627FE"),
      route: "/dashboard/user-management",
      blacklist: [1],
      showcase: "/user-management-showcase.png",
      description: t("5D4C01092"),
    },
    {
      name: t("8A64E6185"),
      route: "/dashboard/court-decisions",
      blacklist: [],
      showcase: "/court-decisions-showcase.png",
      description: t("DC28EC857"),
    },
  ];

  const getSearchOptions = () => {
    if (searchOptionsLoading) return;

    fetchSearchOptions({
      params: { Query: search },
      onSuccess: (data: ISuggestion[]) => setSearchSuggestions(data),
    });
  };

  const redirectSuggestion = (suggestion: ISuggestion) => {
    switch (suggestion.resultType) {
      case "Document":
        const { config, ...document } = suggestion.detail;
        selectDocument(document);
        break;
      case "Profile":
        router.push(`/dashboard/profile/${suggestion.detail.param}`);
        break;
      case "Url":
        router.push(suggestion.detail.param);
        break;
    }

    setIsCommandOpen(false);
    setSearch("");
    setSearchSuggestions(null);
  };

  useEffect(() => {
    if (isLanguageLoading) return;

    const currentPage = pages.find((page) => pathname === page.route);

    setPage(currentPage || null);

    if (currentPage?.route === pages[0].route) {
      setOpen(false);
    }
  }, [pathname, isLanguageLoading]);

  useEffect(() => {
    if (!isCommandOpen) return;

    const timer = window.setTimeout(() => {
      if (search.trim().length < 5) return;
      getSearchOptions();
    }, 500);

    return () => {
      clearTimeout(timer);
      setSearchSuggestions(null);
    };
  }, [search]);

  useEffect(() => {
    fetchGetProfile();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b border-ring">
      <div className="flex items-center gap-2 shrink-0">
        <SidebarTrigger className="-ml-1" />
        {page && (
          <Breadcrumb className="shrink-0 hidden md:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <p className="max-w-44 truncate">{page.name}</p>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <InputGroup
        className="max-w-2xs hidden lg:flex"
        onClick={() => setIsCommandOpen(true)}
      >
        <InputGroupInput
          readOnly={true}
          placeholder={t("D0BBBC0DB")}
          className="cursor-pointer"
        />
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </InputGroupAddon>
      </InputGroup>
      <div className="lg:shrink-0 flex items-center gap-2">
        {profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="transition-colors data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg hidden sm:block">
                  <AvatarImage
                    src={profile.noterLogo}
                    alt={profile.noterName}
                  />
                  <AvatarFallback className="rounded-lg">
                    {profile.fullName ? profile.fullName[0] : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight max-w-44 overflow-hidden ml-1 sm:ml-0">
                  <span className="truncate font-medium text-foreground flex items-center gap-0.5">
                    {isMobile
                      ? (() => {
                          const parts = profile.fullName.split(" ") || [];
                          if (parts.length === 1) return parts[0];
                          return `${parts[0]} ${parts[parts.length - 1][0]}.`;
                        })()
                      : profile.fullName}
                    <Badge
                      className={`scale-90 ${
                        profile.userTypeID !== 1
                          ? "bg-primary text-white"
                          : "bg-white"
                      }`}
                      variant={
                        profile.userTypeID !== 1 ? "secondary" : "outline"
                      }
                    >
                      {profile.userType}
                    </Badge>
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {profile.noterName}
                  </span>
                </div>
                <ChevronsUpDown className="ml-2 size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-3xs sm:w-xs" align="end">
              <DropdownMenuLabel>{t("776FAE1E9")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                {pages.map((page) => {
                  if (!page.blacklist.includes(profile.userTypeID)) {
                    return (
                      <DropdownMenuItem
                        disabled={pathname === page.route}
                        key={page.route}
                        onSelect={() => router.push(page.route)}
                        className="items-start sm:items-center"
                      >
                        <Image
                          src={page.showcase}
                          alt={page.name}
                          width={200}
                          height={200}
                          className="rounded-lg object-cover object-center mr-1 border border-border aspect-square w-12 sm:w-20 mt-1 sm:mt-0"
                        />
                        <div className="flex flex-col">
                          <p className="text-sm font-semibold text-foreground">
                            {page.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {page.description}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    );
                  }
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Skeleton className="w-44 md:w-56 h-12" />
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsCommandOpen(true)}
          className="lg:hidden"
        >
          <Search />
        </Button>
        <LanguageDropdown />
      </div>

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput
          placeholder={t("E0B486BCB")}
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {!searchOptionsLoading ? (
            searchSuggestions && searchSuggestions.length > 0 ? (
              <>
                <CommandGroup heading={t("B8936AA58")}>
                  {searchSuggestions.map((suggestion: ISuggestion, index) => (
                    <CommandItem
                      key={index}
                      value={suggestion.resultText}
                      onSelect={() => redirectSuggestion(suggestion)}
                    >
                      {suggestionIcons[suggestion.resultType]}
                      {suggestion.resultText}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandEmpty>
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <SearchX />
                      </EmptyMedia>
                      <EmptyTitle>{t("6C1F629B6")}</EmptyTitle>
                      <EmptyDescription>{t("EB20D261D")}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </CommandEmpty>
              </>
            ) : (
              <div className="p-4">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileSearch2 />
                    </EmptyMedia>
                    <EmptyTitle>{t("1928A896B")}</EmptyTitle>
                    <EmptyDescription>{t("EAFB1CD6B")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-2 p-2">
              <Skeleton className="w-full h-11" />
              <Skeleton className="w-full h-11" />
              <Skeleton className="w-full h-11" />
              <Skeleton className="w-full h-11" />
              <Skeleton className="w-full h-11" />
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
}

export default SidebarNavigation;
