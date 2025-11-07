import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function FileManagementSkeleton() {
  return (
    <section className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <Skeleton className="w-full sm:w-60 h-9" />
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:flex items-center gap-2">
          <Skeleton className="w-full sm:w-40 h-9" />
          <Skeleton className="w-full sm:w-40 h-9" />
        </div>
      </div>
      <Skeleton className="w-full h-full" />
    </section>
  );
}

export default FileManagementSkeleton;
