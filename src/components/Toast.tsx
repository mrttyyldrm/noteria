"use client";

import React from "react";
import { Text, Icon } from "@/components";
import { useToast } from "@/context/ToastContext";
import clsx from "clsx";

function Toast() {
  const { toasts } = useToast();
  return (
    <section
      id="toast"
      className="pointer-events-none fixed top-0 left-[50%] z-[401] flex h-full w-full translate-x-[-50%] items-end justify-end p-[3rem] pt-[10%]"
    >
      <div
        id="toast-content"
        className="flex flex-col items-center gap-[1rem] overflow-hidden"
      >
        {toasts.map((toast: any, index: number) => (
          <div
            key={index}
            className="animate-fade-up border-gray-light flex items-center gap-[1rem] rounded-full border bg-white py-[0.5rem] pr-[2.4rem] pl-[0.8rem]"
          >
            <div
              className={clsx(
                "flex h-[4.1rem] w-[4.1rem] items-center justify-center rounded-full",
                {
                  "bg-green": toast.type === "success",
                  "bg-primary": toast.type === "error",
                },
              )}
            >
              <Icon
                icon={
                  toast.type === "success"
                    ? "circle-check"
                    : "circle-exclamation"
                }
                color="text-white"
              />
            </div>
            <Text weight="font-semibold" color="text-black">
              {toast.message}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(Toast);
