"use client";

import { createContext, useContext, useState } from "react";
import { Text, Icon } from "@/components";
import clsx from "clsx";

interface IToast {
  message: string;
  type: "success" | "error";
}

interface IToastContext {
  toasts: IToast[];
  showMessage: (message: string, type?: "success" | "error") => void;
}

const toastContextDefaultValues: IToastContext = {
  toasts: [],
  showMessage: () => {},
};

const ToastContext = createContext<IToastContext>(toastContextDefaultValues);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<IToast[]>([]);

  const showMessage = (
    message: string,
    type: "success" | "error" = "error"
  ) => {
    const newToast = {
      message: message,
      type: type,
    };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, Math.max(message.length * 50, 5000));
  };

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showMessage,
      }}
    >
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
              className="animate-fade-up border-gray-light flex items-center gap-[1rem] rounded-full border bg-white py-[0.5rem] pr-[2.4rem] pl-[0.8rem] min-w-[30rem]"
            >
              <div
                className={clsx(
                  "flex h-[4.1rem] w-[4.1rem] items-center justify-center rounded-full",
                  {
                    "bg-success": toast.type === "success",
                    "bg-error": toast.type === "error",
                  }
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
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
