import React from "react";
import clsx from "clsx";

interface StackTypes {
  id?: string;
  className?: string;
  children: React.ReactNode;
}

function Stack({ id, className, children }: StackTypes) {
  return (
    <div
      id={id}
      className={clsx(
        "rounded-[0.8rem] border border-gray-light bg-white",
        className
      )}
    >
      {children}
    </div>
  );
}

export default React.memo(Stack);
