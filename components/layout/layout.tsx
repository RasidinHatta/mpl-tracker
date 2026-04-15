import { AppSidebar } from "@/components/navigation/app-sidebar";
import BreadHeader from "@/components/navigation/bread-header";
import { ModeToggle } from "@/components/themes/ModeToggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Footer from "../shadcn-studio/blocks/footer-component-01/footer-component-01";

export default async function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 justify-between shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                        <div className="flex items-center gap-2 px-4">
                            <SidebarTrigger className="-ml-1 text-foreground" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
                            />
                            <BreadHeader />
                        </div>
                        <div className="m-4">
                            <ModeToggle />
                        </div>
                    </header>
                    {children}
                    < Footer />
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    )
}