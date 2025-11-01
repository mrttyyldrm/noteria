import React from "react";
import { notFound } from "next/navigation";

interface ResetLayoutTypes {
  children: React.ReactNode;
  params: {
    hash: string;
  };
}

const hashRegex =
  /^([0-9A-Fa-f]{8}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{12})$/;

function ResetLayout({ children, params }: ResetLayoutTypes) {
  const hash = params.hash;

  if (!hashRegex.test(hash)) {
    notFound();
  } else {
    return children;
  }
}

export default ResetLayout;
