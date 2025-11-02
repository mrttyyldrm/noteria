import { notFound } from "next/navigation";
import React from "react";

interface ResetLayoutTypes {
  children: React.ReactNode;
  params: Promise<{ hash: string }>;
}

const hashRegex =
  /^([0-9A-Fa-f]{8}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{4}-?[0-9A-Fa-f]{12})$/;

async function ResetLayout({ children, params }: ResetLayoutTypes) {
  const { hash } = await params;

  if (!hashRegex.test(hash)) {
    notFound();
  } else {
    return children;
  }
}

export default ResetLayout;
