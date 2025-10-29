"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  SidebarTrigger,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  FileSearch2,
  Search,
  SearchIcon,
  SearchX,
  TextSearch,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { TranslationDropdown } from "@/context/TranslationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import * as React from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
} from "@/components/ui/breadcrumb";
import useAPI from "@/hooks/useAPI";
import Image from "next/image";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";

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

const dummyData = [
  { text: "Document Management", route: "/dashboard/document-management" },
  { text: "User Management", route: "/dashboard/user-management" },
  { text: "Court Decisions", route: "/dashboard/court-decisions" },
  { text: "Profile Settings", route: "/dashboard/profile" },
  { text: "Billing Information", route: "/dashboard/billing" },
  { text: "Calendar View", route: "/dashboard/calendar" },
  { text: "Notifications", route: "/dashboard/notifications" },
  { text: "Reports", route: "/dashboard/reports" },
  { text: "Help Center", route: "/dashboard/help" },
  { text: "Logout", route: "/auth" },
];

function SidebarNavigation() {
  const { GET } = useAPI();
  const router = useRouter();
  const pathname = usePathname();
  const { setOpen, open, isMobile } = useSidebar();

  const [profile, setProfile] = useState<IProfile | null>(null);
  const [page, setPage] = useState<IPage | null>(null);
  const [isCommandOpen, setIsCommandOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [isSearchLoading, setIsSearchLoading] = useState<boolean>(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[] | null>(
    null
  );

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
      "GetProfile",
      { Query: search },
      (data) => {
        // setSearchOptions(data);
        setSearchSuggestions(dummyData);
        setIsSearchLoading(false);
      },
      () => setIsSearchLoading(false)
    );
  };

  useEffect(() => {
    const currentPage = pages.find((page) => pathname === page.route);

    setPage(currentPage || null);

    if (currentPage?.route === pages[0].route) {
      setOpen(false);
    }
  }, [pathname]);

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

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b border-ring">
      <div className="flex items-center gap-2 shrink-0">
        <SidebarTrigger
          className="-ml-1"
          disabled={page?.route === pages[0].route}
        />
        {page && !open && (
          <Breadcrumb className="shrink-0 hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>
                <p className="max-w-44 truncate">{page.name}</p>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      {!open && (
        <InputGroup
          className="max-w-2xs hidden md:flex"
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
      )}
      <div className="md:shrink-0 flex items-center gap-2">
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
                          if (parts.length === 0) return "Unknown User";
                          if (parts.length === 1) return parts[0];
                          return `${parts[0]} ${parts[parts.length - 1][0]}.`;
                        })()
                      : profile.fullName || "Unknown User"}
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
                          width={100}
                          height={100}
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
          className="md:hidden"
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
                  {searchSuggestions.map((suggesion, index) => (
                    <CommandItem
                      key={index}
                      onSelect={() => {
                        router.push(suggesion.route);
                        setIsCommandOpen(false);
                      }}
                    >
                      {suggesion.text}
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
