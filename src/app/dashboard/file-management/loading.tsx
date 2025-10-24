import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function FileManagementSkeleton() {
  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <Skeleton className="w-full sm:w-60 h-9" />
        <Skeleton className="w-full sm:w-52 h-9" />
      </div>
      <Skeleton className="w-full h-full" />
    </section>
  );
}

export default FileManagementSkeleton;
