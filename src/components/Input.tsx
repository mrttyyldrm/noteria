"use client";

import React, { useState } from "react";
import { Text, Icon } from "@/components";
import clsx from "clsx";

interface IInput {
  name: string;
  label?: string;
  value: string | number;
  readonly?: boolean;
  type: "text" | "email" | "number" | "password" | "date";
  information?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function Input({
  name,
  label,
  value,
  type,
  readonly,
  error = "",
  placeholder,
  information,
  className,
  onChange,
}: IInput) {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
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
          },
        )}
      >
        <input
          name={name}
          type={
            type === "password"
              ? isPasswordVisible
                ? "text"
                : "password"
              : type
          }
          value={value}
          readOnly={readonly}
          onChange={(e) => onChange?.(e)}
          className="placeholder:text-gray w-full border-none bg-transparent text-sm font-semibold text-black outline-none"
          placeholder={placeholder}
        />
        {type === "password" && (
          <Icon
            type="regular"
            icon={isPasswordVisible ? "eye-slash" : "eye"}
            size="text-md"
            className="absolute right-[1.6rem] top-[50%] z-[1] translate-y-[-50%] cursor-pointer transition-colors duration-300"
            onClick={togglePasswordVisibility}
          />
        )}
      </div>
      {error && (
        <Text color="text-primary" size="text-xs" weight="font-semibold">
          {error}
        </Text>
      )}
      {information && <Text size="text-xs">{information}</Text>}
    </div>
  );
}

export default React.memo(Input);
