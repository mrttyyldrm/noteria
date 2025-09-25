"use client";

import React, { useState, useEffect } from "react";
import { Text, Icon } from "@/components";
import clsx from "clsx";

interface SearchTypes {
  name: string;
  label?: string;
  value: string;
  error?: string;
  className?: string;
  children?: React.ReactNode;
  onChange?: (e: string) => void;
}

function Search({
  name,
  label,
  value = "",
  error = "",
  className,
  children,
  onChange,
}: SearchTypes) {
  const [isLabelActive, setIsLabelActive] = useState<boolean>(value !== "");

  useEffect(() => {
    setIsLabelActive(value !== "");
  }, [value]);

  const clearInputValue = () => {
    setIsLabelActive(false);
    onChange?.("");
  };

  return (
    <div className={clsx("flex w-full flex-col gap-[0.6rem]", className)}>
      {label && <label className="text-xs font-bold text-black">{label}</label>}
      <div
        className={clsx(
          "relative flex w-full items-center justify-between gap-[1.5rem] rounded-[0.8rem] border bg-white px-[1.6rem] py-[0.9rem] transition-colors duration-300",
          {
            "border-primary": error,
            "border-gray-light": !error,
          }
        )}
      >
        <input
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="placeholder:text-gray w-full border-none bg-transparent text-sm font-semibold text-black outline-none"
        />
        {value.length > 0 && (
          <Icon
            icon="xmark"
            size="text-sm"
            color="text-black"
            className="cursor-pointer"
            onClick={clearInputValue}
          />
        )}
      </div>
      {error && (
        <Text color="text-error" size="text-xs" weight="font-semibold">
          {error}
        </Text>
      )}
      {value && children && (
        <ul className="absolute left-0 top-[5.8rem] z-10 flex w-full animate-load flex-col gap-[0.5rem] overflow-hidden rounded-sm border border-gray-light bg-white p-[1rem] shadow">
          {children}
        </ul>
      )}
    </div>
  );
}

interface SearchOptionTypes {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function SearchOption({ children, className, onClick }: SearchOptionTypes) {
  return (
    <li
      className={clsx(
        "min-h-[4.5rem] w-full cursor-pointer rounded-sm px-[1.6rem] py-[0.9rem] transition-colors duration-300 hover:bg-background",
        className
      )}
      onClick={onClick}
    >
      {children}
    </li>
  );
}
React.memo(SearchOption);

export default React.memo(Search);
export { SearchOption };
