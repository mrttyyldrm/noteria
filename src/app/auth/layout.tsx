import { TranslationDropdown } from "@/context/TranslationContext";
import Image from "next/image";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="relative flex justify-center gap-2 md:justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Image src="/logo.svg" alt="Logo" width={32} height={32} />
            Noteria
          </div>
          <div className="absolute top-1/2 right-0 -translate-y-1/2">
            <TranslationDropdown />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:flex overflow-hidden m-2 ml-0 rounded-lg bg-auth bg-bottom-left bg-cover bg-no-repeat flex-col justify-end p-8 gap-10">
        <div className="flex flex-col">
          <p className="text-3xl text-muted font-light">
            Kosovo’s AI Powered Notary App
          </p>
          <h1 className="text-9xl text-muted font-semibold">Noteria</h1>
        </div>
        <p className="text-muted font-normal text-sm">
          © 2025 Powered by Zhvillo®
        </p>
      </div>
    </div>
  );
}

export default AuthLayout;
