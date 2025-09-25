import React from "react";
import clsx from "clsx";

interface IIcon {
  type?: "solid" | "regular" | "thin" | "brands";
  icon: string;
  color?: `text-${string}`;
  size?: `text-${string}`;
  animation?: "spin";
  className?: string;
  onClick?: () => void;
}

function Icon({
  type = "solid",
  icon,
  color = "text-black",
  size = "text-md",
  animation,
  className,
  onClick,
}: IIcon) {
  return (
    <i
      className={clsx(
        `fa-${type}`,
        `fa-${icon}`,
        size,
        color,
        animation && `fa-${animation}`,
        className
      )}
      onClick={onClick}
    ></i>
  );
}

export default React.memo(Icon);
