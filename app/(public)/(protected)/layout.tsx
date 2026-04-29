import { AppSidebar } from "@/components/navigation/app-sidebar";
import BreadHeader from "@/components/navigation/bread-header";
import { ModeToggle } from "@/components/themes/ModeToggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/navigation/footer";

export default async function ProtectedLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const headersList = await headers();

    const session = await auth.api.getSession({
        headers: headersList,
    });
    
    // We pass the user down to the Sidebar explicitly, as finance tracker did
    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar user={session?.user} />
                <SidebarInset>
                    <header className="sticky top-0 z-50 flex h-16 justify-between shrink-0 items-center gap-2 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
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
                    <Footer />
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    )
}
