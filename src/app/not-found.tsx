"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import useAPI from "@/hooks/useAPI";

interface ILog {
  message: string;
  status: string;
  timestamp: string;
  resource: string;
}

function NotFound() {
  const { POST } = useAPI();
  const pathname = usePathname();

  const [log] = useState<ILog>({
    message: "Page not found",
    status: "404",
    timestamp: new Date().toISOString(),
    resource: pathname,
  });
  const [isSend, setIsSend] = useState<boolean>(false);

  const sendLog = () => {
    if (!log) return;

    POST("SendLog", log, () => {
      setIsSend(true);
    });
  };

  useEffect(() => {
    sendLog();
  }, []);

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
        <Card className="py-4 w-full max-w-lg my-2">
          <CardContent>
            <ul className="flex flex-col gap-2">
              <li className="w-full flex justify-between items-center gap-2">
                <h6 className="text-sm font-semibold text-foreground">
                  Error:
                </h6>
                <p className="text-sm text-muted-foreground">{log.message}</p>
              </li>
              <li className="w-full flex justify-between items-center gap-2">
                <h6 className="text-sm font-semibold text-foreground">
                  Status:
                </h6>
                <p className="text-sm text-muted-foreground">{log.status}</p>
              </li>
              <li className="w-full flex justify-between items-center gap-2">
                <h6 className="text-sm font-semibold text-foreground">
                  Timestamp:
                </h6>
                <p className="text-sm text-muted-foreground">{log.timestamp}</p>
              </li>
              <li className="w-full flex justify-between items-center gap-2">
                <h6 className="text-sm font-semibold text-foreground">
                  Resource:
                </h6>
                <p className="text-sm text-muted-foreground">{log.resource}</p>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Link href="/" className={isSend ? "animate-scale" : "opacity-0"}>
          <Button>Return to Home Page</Button>
        </Link>
      </section>
    </main>
  );
}

export default NotFound;
