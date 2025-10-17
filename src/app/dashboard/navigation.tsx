"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger, SidebarMenuButton } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import useAPI from "@/hooks/useAPI";

interface IProfile {
  userType: string;
  noterLogo: string;
  noterName: string;
  fullName: string;
}

const pages = [
  { name: "File Management", route: "/dashboard" },
  { name: "User Management", route: "/dashboard/user-management" },
  { name: "Court Decisions", route: "/dashboard/court-decisions" },
];

function SidebarNavigation() {
  const { GET } = useAPI();
  const router = useRouter();

  const [profile, setProfile] = useState<IProfile | null>(null);

  const logoutDashboard = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace("/auth");
  };

  useEffect(() => {
    GET("GetProfile", {}, (data: IProfile) => {
      setProfile(data);
    });
  }, []);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b border-ring">
      <SidebarTrigger className="-ml-1" />
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
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel>Modules</DropdownMenuLabel>
              <DropdownMenuGroup>
                {pages.map((page) => (
                  <DropdownMenuItem
                    key={page.route}
                    onSelect={() => router.push(page.route)}
                  >
                    {page.name}
                  </DropdownMenuItem>
                ))}
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
      </div>
    </header>
  );
}

export default SidebarNavigation;
