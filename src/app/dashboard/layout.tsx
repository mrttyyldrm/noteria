"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Badge } from "@/components";
import { useRouter } from "next/navigation";
import clsx from "clsx";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);

  const dashboardLogout = () => {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.replace(`/auth/login`);
  };

  return (
    <main>
      <section
        id="dashboard"
        className="fixed top-0 left-0 grid h-full w-full grid-cols-1 items-stretch overflow-hidden md:grid-cols-[auto_1fr]"
      >
        <aside
          id="dashboard-aside"
          className={clsx(
            "border-gray-light fixed z-[403] grid h-full grid-rows-[auto_1fr_auto] gap-[5rem] border-r bg-white p-[2rem] transition-[left] duration-500 md:static md:transition-none",
            {
              "left-0": isAsideOpen,
              "left-[-30rem]": !isAsideOpen,
            }
          )}
        >
          <div id="aside-logo">
            <Image
              src="/img/logo.svg"
              alt=""
              width={60}
              height={75}
              className="h-auto w-[6rem]"
            />
          </div>
          <div
            id="aside-button"
            className="mt-[1rem] flex justify-center md:hidden"
          >
            <Button
              icon="xmark"
              variant="secondary"
              onClick={() => setIsAsideOpen(false)}
            />
          </div>
          <nav id="aside-navigation" className="flex justify-center">
            <ul className="flex flex-col gap-[2rem]">
              <li className="relative group">
                <Link href="/dashboard/blacklist">
                  <Button
                    icon="gavel"
                    variant="secondary"
                    onClick={dashboardLogout}
                  />
                  <div className="group-hover:flex hidden animate-fade-right absolute top-[50%] left-[5rem] translate-y-[-50%]">
                    <Badge variant="primary">Court Desicion Blacklist</Badge>
                  </div>
                </Link>
              </li>
            </ul>
          </nav>
          <div
            id="aside-logout"
            onClick={dashboardLogout}
            className="flex justify-center"
          >
            <Button
              icon="arrow-left-from-bracket"
              variant="secondary"
              onClick={dashboardLogout}
            />
          </div>
        </aside>
        <div id="dashboard-interface" className="p-[2rem] flex justify-center">
          <div
            id="dashboard-content"
            className="w-full max-w-[55rem] lg:max-w-[110rem]"
          >
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
