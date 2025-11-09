import { Skeleton } from "@/components/ui/skeleton";

function PersonSkeleton() {
  return (
    <section className="w-full lg:h-full gap-4 overflow-hidden grid grid-cols-1 lg:grid-cols-[20rem_1fr] items-start p-4">
      <Skeleton className="w-full h-96" />
      <div className="flex flex-col gap-4 h-full">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="w-full sm:max-w-3xs h-9" />
          <Skeleton className="w-full sm:w-52 h-9 shrink-0" />
        </div>
        <Skeleton className="w-full h-32 lg:h-full" />
      </div>
    </section>
  );
}

export default PersonSkeleton;
