import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function NotFound() {
  return (
    <main className="flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <section className="w-full flex flex-col items-center gap-4 p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <Image src="/logo.svg" alt="Logo" width={52} height={52} />
          <h1 className="text-8xl md:text-9xl font-semibold text-foreground">
            404
          </h1>
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground">
            Page Not Found
          </h2>
          <p className="text-base text-muted-foreground">
            Oops! The page you&#39;re looking for doesn&#39;t exist. It might
            have been moved or deleted.
          </p>
        </div>
        <Link href="/">
          <Button>Return to Home Page</Button>
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
