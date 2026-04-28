"use client"

import { useSidebar } from "@/components/ui/sidebar"
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, BadgeCheckIcon, BellIcon } from "lucide-react"
import { SignOutButton } from "../auth/sign-out-button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { UpdateUserForm } from "@/components/auth/update-user-form"
import { ChangePasswordForm } from "@/components/auth/change-password-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { useState } from "react"

export function NavUser({
    user,
}: {
    user: { name: string; email: string; image: string | null } | null
}) {
    const { isMobile } = useSidebar()
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    
    // Do not render anything if the user is not signed in
    if (!user) return null;

    const userImage = user?.image || "/avatars/shadcn.jpg"

    return (
        <>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                />
                            }
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={userImage} alt={user?.name} />
                                <AvatarFallback className="rounded-lg">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{user?.name}</span>
                                <span className="truncate text-xs">{user?.email}</span>
                            </div>
                            <ChevronsUpDownIcon className="ml-auto size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="p-0 font-normal">
                                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                        <Avatar className="h-8 w-8 rounded-lg">
                                            <AvatarImage src={userImage} alt={user?.name} />
                                            <AvatarFallback className="rounded-lg">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-medium">{user?.name}</span>
                                            <span className="truncate text-xs">{user?.email}</span>
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                                    <div className="flex cursor-pointer items-center w-full">
                                        <BadgeCheckIcon className="mr-2 h-4 w-4" />
                                        Profile
                                    </div>
                                </DropdownMenuItem>

                                <DropdownMenuItem>
                                    <div className="flex cursor-pointer items-center w-full">
                                        <BellIcon className="mr-2 h-4 w-4" />
                                        Notifications
                                    </div>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="p-0">
                                <SignOutButton />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>

            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Profile Information</DialogTitle>
                        <DialogDescription>
                            Update your account details and password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 px-1">
                        <Tabs defaultValue="account" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="account">Account</TabsTrigger>
                                <TabsTrigger value="password">Password</TabsTrigger>
                            </TabsList>
                            <TabsContent value="account">
                                <Card className="border-t-4 border-t-blue-600 shadow-sm transition-all hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle>Update User</CardTitle>
                                        <CardDescription>Change your display name or profile image.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <UpdateUserForm
                                            name={user?.name ?? ""}
                                            image={user?.image ?? ""}
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="password">
                                <Card className="border-t-4 border-t-red-600 shadow-sm transition-all hover:shadow-md">
                                    <CardHeader>
                                        <CardTitle>Change Password</CardTitle>
                                        <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ChangePasswordForm />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
