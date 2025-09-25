import React from "react";
import { Text, Icon } from "@/components";
import clsx from "clsx";

interface ButtonTypes {
  children?: React.ReactNode;
  variant?: "primary" | "secondary";
  icon?: string;
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

function Button({
  children,
  icon,
  loading = false,
  variant = "primary",
  className,
  onClick,
}: ButtonTypes) {
  return (
    <button
      className={clsx(
        "relative flex h-[4.1rem] items-center justify-center gap-[1rem] rounded-[0.8rem] border py-[0.8rem] text-center transition-all duration-300",
        {
          "bg-primary border-transparent": variant === "primary",
          "border-gray-light bg-white": variant === "secondary",
        },
        {
          "hover:bg-primary-light": variant === "primary" && !loading,
          "hover:bg-background": variant === "secondary" && !loading,
        },
        {
          "cursor-default opacity-80": loading,
          "cursor-pointer": !loading,
        },
        {
          "w-[4.1rem] px-[0.8rem]": icon,
          "px-[1.6rem]": !icon,
        },
        className
      )}
      onClick={onClick}
    >
      {loading && (
        <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
          <Icon
            icon="loader"
            animation="spin"
            color={
              clsx({
                "text-white": variant === "primary",
                "text-black": variant === "secondary",
              }) as `text-${string}`
            }
          />
        </div>
      )}
      {icon ? (
        <Icon
          type="regular"
          icon={icon}
          color={
            clsx({
              "text-white": variant === "primary",
              "text-black": variant === "secondary",
            }) as `text-${string}`
          }
          className={clsx("transition-colors duration-300", {
            "opacity-0": loading,
          })}
        />
      ) : (
        <Text
          weight="font-bold"
          color={
            clsx({
              "text-white": variant === "primary",
              "text-black": variant === "secondary",
            }) as `text-${string}`
          }
          className={clsx("transition-colors duration-300", {
            "opacity-0": loading,
          })}
        >
          {children}
        </Text>
      )}
    </button>
  );
}

export default React.memo(Button);
