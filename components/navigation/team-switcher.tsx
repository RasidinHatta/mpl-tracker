"use client"

import Logo from "@/assets/svg/logo"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  teams: [
    {
      name: "MPLTrack",
      logo: (
        <Logo />
      ),
      plan: "MPL Track",
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
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTeam.name}</span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
