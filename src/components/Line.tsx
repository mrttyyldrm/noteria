import React from "react";
import { Text } from "@/components";
import clsx from "clsx";

interface ILine {
  align?: "left" | "center" | "right";
  children?: React.ReactNode;
  className?: string;
}

function Line({ align = "left", children, className }: ILine) {
  return (
    <div
      className={clsx(
        "grid items-center gap-[1rem]",
        {
          "grid-cols-[auto_1fr]": align === "left" && children,
          "grid-cols-[1fr_auto_1fr]": align === "center" && children,
          "grid-cols-[1fr_auto]": align === "right" && children,
        },
        {
          "grid-cols-1": !children,
        },
        className
      )}
    >
      {(align === "center" || align === "right") && (
        <hr className="bg-gray/20 h-[0.1rem] w-full border-none outline-none" />
      )}
      <Text color="text-black" weight="font-semibold">
        {children}
      </Text>
      {(align === "center" || align === "left") && (
        <hr className="bg-gray/20 h-[0.1rem] w-full border-none outline-none" />
      )}
    </div>
  );
}

export default React.memo(Line);
