"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
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
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
} from "@/components/ui/breadcrumb";
import useAPI from "@/hooks/useAPI";
import Image from "next/image";

interface IProfile {
  userType: "Clerk" | "Notary";
  noterLogo: string;
  noterName: string;
  fullName: string;
}

const pages = [
  {
    name: "File Management",
    route: "/dashboard",
    userTypes: ["Clerk", "Notary"],
    showcase: "/file-management-showcase.png",
    description: "Manage and organize all your files securely and efficiently.",
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

function SidebarNavigation() {
  const { GET } = useAPI();
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState<IProfile | null>(null);
  const [page, setPage] = useState<string | null>(null);

  const logoutDashboard = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/auth");
  };

  useEffect(() => {
    const currentPage = pages.find((page) => pathname === page.route);

    setPage(currentPage?.name || null);
  }, [pathname]);

  useEffect(() => {
    GET("GetProfile", {}, (data: IProfile) => {
      setProfile(data);
    });
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b border-ring">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        {page && (
          <Breadcrumb className="hidden sm:block">
            <BreadcrumbList>
              <BreadcrumbItem>{page}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="flex items-center gap-2">
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
                    {profile.fullName || "Unknown User"}
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
          <Skeleton className="w-56 h-12" />
        )}
        <TranslationDropdown />
      </div>
    </header>
  );
}

export default SidebarNavigation;
