"use client";

import { useEffect } from "react";
import { useDocument } from "@/context/DocumentContext";

function Home() {
  const { currentDocument } = useDocument();

  useEffect(() => {
    console.log("DOCUMENT CHANGED", currentDocument);
  }, [currentDocument]);

  return <></>;
}

export default Home;
