import React from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

function Home() {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="rounded-lg border w-full h-full"
    >
      <ResizablePanel defaultSize={75} className="min-w-md">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Draft Preview</span>
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={25} className="min-w-sm">
        <div className="flex h-full items-center justify-center p-6">
          <span className="font-semibold">Controls</span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default Home;
