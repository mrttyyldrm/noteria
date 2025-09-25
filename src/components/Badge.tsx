import React from "react";
import { Text } from "@/components";
import clsx from "clsx";

interface BadgeTypes {
  size?: "small" | "default";
  variant?: "primary" | "success" | "error";
  children: React.ReactNode;
  className?: string;
}

function Badge({
  size = "default",
  variant = "primary",
  children,
  className,
}: BadgeTypes) {
  return (
    <div
      className={clsx(
        "shrink-0",
        {
          "rounded-[0.8rem] px-[0.8rem] py-[0.2rem]": size === "small",
          "rounded-[0.6rem] px-[1rem] py-[0.3rem]": size === "default",
        },
        {
          "bg-black": variant === "primary",
          "bg-success-transparent": variant === "success",
          "bg-error-transparent": variant === "error",
        },
        className
      )}
    >
      <Text
        size={
          clsx({
            "text-2xs": size === "small",
            "text-sm": size === "default",
          }) as `text-${string}`
        }
        weight="font-semibold"
        color={
          clsx({
            "text-white": variant === "primary",
            "text-success": variant === "success",
            "text-error": variant === "error",
          }) as `text-${string}`
        }
      >
        {children}
      </Text>
    </div>
  );
}

export default Badge;
