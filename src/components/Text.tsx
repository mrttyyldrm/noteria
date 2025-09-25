import React from "react";
import clsx from "clsx";

interface IText {
  color?: `text-${string}`;
  size?: `text-${string}`;
  weight?: `font-${"normal" | "medium" | "semibold" | "bold"}`;
  className?: string;
  children: React.ReactNode;
}

function Text({
  color = "text-gray",
  size = "text-sm",
  weight = "font-medium",
  className,
  children,
}: IText) {
  return (
    <p className={clsx("leading-relaxed", color, size, weight, className)}>
      {children}
    </p>
  );
}

export default React.memo(Text);
