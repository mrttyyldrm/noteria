"use client";

import React, { Fragment } from "react";
import Image from "next/image";
import { Text, Icon } from "@/components";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const steps = [
  {
    icon: "user",
    value: "Manage your appointments and clients effortlessly!",
  },
  {
    icon: "monitor-waveform",
    value: "Stay on top of regulatory requirements!",
  },
  {
    icon: "file-lines",
    value: "Handle your documents with ease!",
  },
  {
    icon: "box-archive",
    value: "Securely archive and manage your files!",
  },
];

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main>
      <section
        id="auth"
        className="grid min-h-screen w-full grid-cols-1 bg-white lg:grid-cols-[1fr_55rem]"
      >
        <div
          id="auth-container"
          className="grid grid-rows-[1fr_auto] gap-[2rem]"
        >
          <div
            id="auth-interface"
            className="flex flex-col items-center justify-center gap-[2rem] px-[1rem]"
          >
            <div id="auth-logo">
              <Image
                src="/img/logo.svg"
                alt=""
                width={75}
                height={90}
                className="h-[8rem] w-auto"
              />
            </div>
            <div id="auth-content" className="flex w-full justify-center">
              {children}
            </div>
          </div>
          <div
            id="auth-footer"
            className="py-[1rem] text-center flex flex-col items-center"
          >
            <Text size="text-xs">
              © 2025 Zhvillo Sh.p.k. All rights reserved.
            </Text>
          </div>
        </div>
        <aside id="auth-showcase" className="hidden h-full p-[1rem] lg:block">
          <div
            id="showcase-content"
            className="bg-auth relative flex h-full w-full flex-col justify-center gap-[5rem] overflow-hidden rounded-[2rem] bg-cover bg-center px-[8rem] py-[2rem]"
          >
            <div id="showcase-logo">
              <Image
                src="/img/logo-horizontal.svg"
                alt=""
                width={270}
                height={125}
                className="h-[12.5rem] w-auto"
              />
            </div>
            <ul
              id="showcase-steps"
              className="flex max-w-[40rem] flex-col gap-[1rem]"
            >
              {steps.map((step, index) => (
                <Fragment key={index}>
                  <li className="group grid grid-cols-[4.5rem_1fr] items-center gap-[2rem]">
                    <div className="transition-color flex aspect-square items-center justify-center rounded-full border-[0.15rem] border-white bg-transparent duration-300 group-hover:bg-white">
                      <Icon
                        type="regular"
                        icon={step.icon}
                        size="text-lg"
                        color="text-white"
                        className="group-hover:text-primary transition-colors duration-300"
                      />
                    </div>
                    <Text color="text-white">{step.value}</Text>
                  </li>
                  <hr className="ml-[2.35rem] h-[2rem] w-[0.15rem] border-none bg-white outline-none last:hidden" />
                </Fragment>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default AuthLayout;
