"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IFile, useDocument } from "@/context/DocumentContext";
import { LanguageDropdown, useLanguage } from "@/context/LanguageContext";
import useFetch from "@/hooks/useFetch";
import { cn } from "@/lib/utils";
import {
  ChevronsUpDown,
  CircleAlert,
  File,
  FileSearch2,
  Gavel,
  Plus,
  Search,
  SearchIcon,
  SearchX,
  User,
} from "lucide-react";
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
  description: string;
  icon: React.ReactNode;
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
  const { selectDocument, openProcess } = useDocument();

  const { data: profile, fetch: fetchGetProfile } = useFetch<IProfile>(
    "GET",
    "GetProfile",
  );
  const { loading: searchOptionsLoading, fetch: fetchSearchOptions } = useFetch(
    "GET",
    "Search",
  );
  const { fetch: fetchDrafts } = useFetch("GET", "GetDraftList");
  const { fetch: fetchStartDocumentProcess } = useFetch(
    "GET",
    "StartDocProcess",
  );

  const [page, setPage] = useState<IPage | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [searchSuggestions, setSearchSuggestions] = useState<
    ISuggestion[] | null
  >(null);
  const [drafts, setDrafts] = useState<IFile[] | null>(null);
  const [isDraftsOpen, setIsDraftsOpen] = useState<boolean>(false);
  const [draftSearch, setDraftSearch] = useState<string>("");
  const [draftProcessing, setDraftProcessing] = useState<{
    id: number | null;
    status: boolean;
  }>({ id: null, status: false });

  const pages: IPage[] = [
    {
      name: t("C3A79F67D"),
      route: "/dashboard/document-management",
      blacklist: [],
      description: t("D38507840"),
      icon: <File className="size-5" />,
    },
    {
      name: t("AF77627FE"),
      route: "/dashboard/user-management",
      blacklist: [1],
      description: t("5D4C01092"),
      icon: <User className="size-5" />,
    },
    {
      name: t("8A64E6185"),
      route: "/dashboard/court-decisions",
      blacklist: [],
      description: t("DC28EC857"),
      icon: <Gavel className="size-5" />,
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

  const getDrafts = () => {
    fetchDrafts({
      params: {},
      onSuccess: (data: IFile[]) => setDrafts(data),
      onLoading: (loading) => {
        if (loading) {
          setDrafts(null);
        }
      },
    });
  };

  const startDocumentProcess = (draftID: number) => {
    fetchStartDocumentProcess({
      params: { DocID: draftID },
      onSuccess: (data: IFile) => {
        selectDocument(data);
      },
      onLoading: (loading) => {
        if (loading) return;

        setDraftProcessing({ id: null, status: false });
        setIsDraftsOpen(false);
        setDraftSearch("");
      },
    });
  };

  useEffect(() => {
    if (!isCommandOpen) return;

    setSearch("");
    setSearchSuggestions(null);
  }, [isCommandOpen]);

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
    if (!isDraftsOpen) return;

    getDrafts();
    setDraftSearch("");
  }, [isDraftsOpen]);

  useEffect(() => {
    if (!draftProcessing.status || !draftProcessing.id) return;

    startDocumentProcess(draftProcessing.id);
  }, [draftProcessing]);

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

  const filteredDrafts = drafts
    ? drafts.filter((draft) =>
        draft.title.toLowerCase().includes(draftSearch.toLowerCase()),
      )
    : [];

  const isSearchSuggestionsEmpty =
    searchSuggestions && searchSuggestions.length === 0;

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
      <div className="max-w-2xs hidden lg:flex gap-2">
        <InputGroup onClick={() => setIsCommandOpen(true)}>
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
        <Button size="icon" onClick={() => setIsDraftsOpen(true)}>
          <Plus className="size-5" />
        </Button>
      </div>
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
                        className="flex-col sm:flex-row items-start gap-2"
                      >
                        <div className="shrink-0 rounded-lg bg-white flex justify-center items-center border border-border aspect-square w-10 sm:mt-1">
                          {page.icon}
                        </div>
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
          className="lg:hidden"
          size="icon"
          onClick={() => setIsDraftsOpen(true)}
        >
          <Plus className="size-5" />
        </Button>
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
                  {searchSuggestions.map((suggestion: ISuggestion, index) => {
                    const isParamExist =
                      suggestion.detail.param !== undefined &&
                      suggestion.detail.param !== null &&
                      suggestion.detail.param !== "";

                    return (
                      <CommandItem
                        key={index}
                        value={suggestion.resultText}
                        className={
                          !isParamExist
                            ? "data-[selected=true]:bg-white !text-muted-foreground data-[selected=true]:text-muted-foreground"
                            : "cursor-pointer"
                        }
                        onSelect={() =>
                          isParamExist && redirectSuggestion(suggestion)
                        }
                      >
                        {!isParamExist && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="destructive" className="p-1">
                                <CircleAlert className="text-white !size-3" />
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>{t("865810336")}</TooltipContent>
                          </Tooltip>
                        )}
                        {suggestionIcons[suggestion.resultType]}
                        {suggestion.resultText}
                      </CommandItem>
                    );
                  })}
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
                      {isSearchSuggestionsEmpty ? <SearchX /> : <FileSearch2 />}
                    </EmptyMedia>
                    <EmptyTitle>
                      {isSearchSuggestionsEmpty
                        ? t("8453B3772")
                        : t("1928A896B")}
                    </EmptyTitle>
                    <EmptyDescription>
                      {isSearchSuggestionsEmpty
                        ? t("EB20D261D")
                        : t("EAFB1CD6B")}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </div>
            )
          ) : (
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-11" />
              ))}
            </div>
          )}
        </CommandList>
      </CommandDialog>

      <Dialog open={isDraftsOpen} onOpenChange={setIsDraftsOpen}>
        <DialogContent className="sm:max-w-xl p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>{t("4B19A68BC")}</DialogTitle>
            <DialogDescription>{t("1E28955B0")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="px-4">
              <InputGroup>
                <InputGroupInput
                  placeholder={t("EDE685569")}
                  value={draftSearch}
                  onChange={(e) => setDraftSearch(e.target.value)}
                />
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
            </div>
            <div className="grid grid-cols-4 items-start gap-3 max-h-[30vh] md:max-h-[50vh] overflow-auto px-4">
              {drafts !== null ? (
                filteredDrafts.length > 0 ? (
                  filteredDrafts.map((draft, index) => (
                    <Card
                      key={index}
                      className="border-none group transition-colors duration-300 divide-y gap-0 overflow-hidden hover:border-primary cursor-pointer"
                      onClick={() =>
                        setDraftProcessing({
                          id: draft.documentID,
                          status: true,
                        })
                      }
                    >
                      <CardHeader
                        className={cn(
                          "border-none rounded-lg aspect-video flex justify-center items-center bg-accent text-muted-foreground transition-colors duration-300 group-hover:bg-primary/10 group-hover:text-primary",
                          {
                            "cursor-default bg-primary/10 text-primary":
                              draftProcessing.status &&
                              draftProcessing.id === draft.documentID,
                          },
                        )}
                      >
                        {draftProcessing.status &&
                        draftProcessing.id === draft.documentID ? (
                          <Spinner className="size-8" />
                        ) : (
                          <File className="size-8" />
                        )}
                      </CardHeader>
                      <CardContent className="px-0 py-1 text-sm text-muted-foreground">
                        {draft.title}.{draft.extension}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-4">
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <FileSearch2 />
                        </EmptyMedia>
                        <EmptyTitle>{t("84833A1EB")}</EmptyTitle>
                        <EmptyDescription>{t("EB20D261D")}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                )
              ) : (
                Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-28" />
                ))
              )}
            </div>
          </div>
          <DialogFooter className="p-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={draftProcessing.status}>
                {t("7D8F5F809")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={draftProcessing.status}
              onClick={() => {
                openProcess("upload", null, "draft");
                setIsDraftsOpen(false);
              }}
            >
              {t("6B85AF24A")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export default SidebarNavigation;
