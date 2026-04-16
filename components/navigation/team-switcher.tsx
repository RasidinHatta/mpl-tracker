"use client"


import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Logo from "../shadcn-studio/logo"

const data = {
  teams: [
    {
      logo: (
        <Logo />
      ),
    },
  ],
}

export function TeamSwitcher() {
  const activeTeam = data.teams[0]

  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg">
          {activeTeam.logo}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
