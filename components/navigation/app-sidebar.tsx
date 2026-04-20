"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { TeamSwitcher } from "@/components/navigation/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"
import { CalendarDays, LayoutDashboard, PieChartIcon, Trophy, History } from "lucide-react"
import { NavMain } from "./nav-main"
import { NavUser } from "./nav-user"


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: any;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      isActive: pathname === "/dashboard",
    },
    {
      title: "Standing",
      url: "/standing",
      icon: <Trophy />,
      isActive: pathname.startsWith("/standing"),
    },
    {
      title: "Schedule",
      url: "/schedule",
      icon: <CalendarDays />,
      isActive: pathname.startsWith("/schedule"),
    },
    {
      title: "Prediction",
      url: "/prediction",
      icon: <PieChartIcon />,
      isActive: pathname.startsWith("/prediction"),
    },
    {
      title: "History",
      url: "/history",
      icon: <History />,
      isActive: pathname.startsWith("/history"),
    },
  ]

  return (
    <Card className="flex flex-col h-full">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <TeamSwitcher />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navMain} />
        </SidebarContent>
        <SidebarFooter>
          {user && <NavUser user={user} />}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </Card>
  )
}
