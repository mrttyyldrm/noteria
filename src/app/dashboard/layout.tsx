import { DocumentProvider } from "@/context/DocumentContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import SidebarNavigation from "./navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DocumentProvider>
        <SidebarInset className="flex flex-col">
          <SidebarNavigation />
          <div className="flex flex-1 flex-col gap-4 w-full">{children}</div>
        </SidebarInset>
      </DocumentProvider>
    </SidebarProvider>
  );
}
