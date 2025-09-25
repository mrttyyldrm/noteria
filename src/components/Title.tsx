import React from "react";
import clsx from "clsx";

interface ITitle {
  level?: 0 | 1 | 2 | 3 | 4 | 5;
  color?: `text-${string}`;
  className?: string;
  children: React.ReactNode;
}

function Title({
  level = 1,
  color = "text-black",
  className,
  children,
}: ITitle) {
  switch (level) {
    case 1:
      return (
        <h1
          className={clsx(
            "text-2xl leading-relaxed font-bold",
            color,
            className,
          )}
        >
          {children}
        </h1>
      );
    case 2:
      return (
        <h2
          className={clsx(
            "text-xl leading-relaxed font-bold",
            color,
            className,
          )}
        >
          {children}
        </h2>
      );
    case 3:
      return (
        <h3
          className={clsx(
            "text-lg leading-relaxed font-bold",
            color,
            className,
          )}
        >
          {children}
        </h3>
      );
    case 4:
      return (
        <h4
          className={clsx(
            "text-md leading-relaxed font-bold",
            color,
            className,
          )}
        >
          {children}
        </h4>
      );
    case 5:
      return (
        <h5
          className={clsx(
            "text-sm leading-relaxed font-bold",
            color,
            className,
          )}
        >
          {children}
        </h5>
      );
  }
}

export default React.memo(Title);
