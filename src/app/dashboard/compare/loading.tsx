import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function CompareManagementsSkeleton() {
  return (
    <section className="w-full h-full grid grid-cols-2 gap-2 items-stretch p-2">
      <Skeleton className="w-full h-full" />
      <Skeleton className="w-full h-full" />
    </section>
  );
}

export default CompareManagementsSkeleton;
