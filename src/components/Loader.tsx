import React from "react";
import Image from "next/image";

function Loader() {
  return (
    <dialog
      id="loader"
      className="fixed left-0 top-0 z-[103] flex h-full w-full items-center justify-center bg-white px-[2rem] lg:h-screen"
    >
      <div id="loader-brand" className="relative h-[8rem] w-[8rem]">
        <div
          id="brand-background"
          className="absolute inset-0 animate-pending rounded-lg bg-primary-transparent"
        ></div>
        <div
          id="brand-icon"
          className="absolute inset-0 z-[20] flex items-center justify-center rounded-lg bg-primary"
        >
          <Image
            src="/img/logo-icon.svg"
            alt="Shitje Logo"
            width={60}
            height={60}
            className="h-[6rem] w-[6rem]"
          />
        </div>
      </div>
    </dialog>
  );
}

export default Loader;
