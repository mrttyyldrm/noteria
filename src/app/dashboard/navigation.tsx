"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
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
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
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
  SidebarTrigger,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocument } from "@/context/DocumentContext";
import { TranslationDropdown } from "@/context/TranslationContext";
import useAPI from "@/hooks/useAPI";
import {
  ChevronsUpDown,
  FileSearch2,
  Gavel,
  Search,
  SearchIcon,
  SearchX,
  File,
  User,
} from "lucide-react";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as React from "react";

interface IProfile {
  userType: "Clerk" | "Notary";
  noterLogo: string;
  noterName: string;
  fullName: string;
}

interface IPage {
  name: string;
  route: string;
  userTypes: ("Clerk" | "Notary")[];
  showcase: string;
  description: string;
}

interface ISuggestion {
  resultText: string;
  resultType: "Document" | "Person" | "Court";
  detail: any;
}

const pages: IPage[] = [
  {
    name: "Document Management",
    route: "/dashboard/document-management",
    userTypes: ["Clerk", "Notary"],
    showcase: "/document-management-showcase.png",
    description:
      "Manage and organize all your documents securely and efficiently.",
  },
  {
    name: "User Management",
    route: "/dashboard/user-management",
    userTypes: ["Notary"],
    showcase: "/user-management-showcase.png",
    description: "Add, edit, and control user access and permissions.",
  },
  {
    name: "Court Decisions",
    route: "/dashboard/court-decisions",
    userTypes: ["Clerk", "Notary"],
    showcase: "/court-decisions-showcase.png",
    description: "View and track court decisions relevant to your cases.",
  },
];

const suggestionIcons: { [key in ISuggestion["resultType"]]: React.ReactNode } =
  {
    Document: <File />,
    Person: <User />,
    Court: <Gavel />,
  };

function SidebarNavigation() {
  const { GET } = useAPI();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpen, isMobile } = useSidebar();
  const { selectDocument } = useDocument();

  const [profile, setProfile] = useState<IProfile | null>(null);
  const [page, setPage] = useState<IPage | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [searchSuggestions, setSearchSuggestions] = useState<
    ISuggestion[] | null
  >(null);

  const logoutDashboard = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/auth");
  };

  const getProfile = () => {
    GET("GetProfile", {}, (data: IProfile) => {
      setProfile(data);
    });
  };

  const getSearchOptions = () => {
    if (isSearchLoading) return;

    setIsSearchLoading(true);
    GET(
      "Search",
      { Query: search },
      (data) => {
        setSearchSuggestions(data);
        setIsSearchLoading(false);
      },
      () => setIsSearchLoading(false),
    );
  };

  const redirectSuggestion = (suggestion: ISuggestion) => {
    switch (suggestion.resultType) {
      case "Document":
        selectDocument(suggestion.detail);
        break;
      case "Person":
        router.push(`/dashboard/person/${suggestion.detail.profileID}`);
        break;
      case "Court":
        router.push(
          `/dashboard/court-decisions?filter=${suggestion.detail.courtOrderID}`,
        );
        break;
    }

    setIsCommandOpen(false);
    setSearch("");
    setSearchSuggestions(null);
  };

  useEffect(() => {
    const currentPage = pages.find((page) => pathname === page.route);

    setPage(currentPage || null);

    if (currentPage?.route === pages[0].route) {
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!isCommandOpen) return;

    const timer = window.setTimeout(() => {
      if (search.trim().length <= 3) return;
      getSearchOptions();
    }, 500);

    return () => {
      clearTimeout(timer);
      setSearchSuggestions(null);
    };
  }, [search]);

  useEffect(() => {
    getProfile();

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
        <SidebarTrigger
          className="-ml-1"
          disabled={page?.route === pages[0].route}
        />
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
          placeholder="Search..."
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
                        profile.userType === "Notary"
                          ? "bg-primary text-white"
                          : "bg-white"
                      }`}
                      variant={
                        profile.userType === "Notary" ? "secondary" : "outline"
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
              <DropdownMenuLabel>Modules</DropdownMenuLabel>
              <DropdownMenuGroup>
                {pages.map((page) => {
                  if (page.userTypes.includes(profile.userType)) {
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
              <DropdownMenuSeparator />
              <DropdownMenuItem textValue="logout" onSelect={logoutDashboard}>
                Logout
              </DropdownMenuItem>
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
        <TranslationDropdown />
      </div>

      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput
          placeholder="Search anything..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {!isSearchLoading ? (
            searchSuggestions && searchSuggestions.length > 0 ? (
              <>
                <CommandGroup heading="Suggestions">
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
                      <EmptyTitle>No Search Results Found</EmptyTitle>
                      <EmptyDescription>
                        Try adjusting your search terms or check for typos.
                      </EmptyDescription>
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
                    <EmptyTitle>Search for files or folders</EmptyTitle>
                    <EmptyDescription>
                      Use the search bar to quickly find everything you need.
                    </EmptyDescription>
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
