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
import { CalendarDays, LayoutDashboard, PieChartIcon, Trophy } from "lucide-react"
import { NavMain } from "./nav-main"


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const pathname = usePathname()

  const navMain = [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboard />,
      isActive: pathname === "/",
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
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </Card>
  )
}
