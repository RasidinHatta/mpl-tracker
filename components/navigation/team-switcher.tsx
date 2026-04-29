"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import Logo from "./logo"
import { ChevronsUpDown } from "lucide-react"
import { MatchGroup } from "@/lib/generated/prisma/enums"

const groups = [
  { name: "MPL ID", id: MatchGroup.MPLID },
  { name: "MPL PH", id: MatchGroup.MPLPH },
  { name: "MPL MY", id: MatchGroup.MPLMY },
]

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentGroupId = searchParams.get("group") ?? "MPLID"
  const activeGroup = groups.find((g) => g.id === currentGroupId) || groups[0]

  const setGroup = (groupId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("group", groupId)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full justify-start rounded-md border-none px-0 py-0 ring-0 focus:ring-0 outline-none hover:bg-transparent data-[state=open]:bg-transparent focus:outline-none flex outline-hidden">
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground w-full"
            >
              <div>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Logo />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className='text-xl font-black tracking-tight'>MPL<span className="text-primary tracking-normal">Tracker</span></span>
                  <span className="truncate text-xs">{activeGroup.name}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[200px] rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Select Group
              </DropdownMenuLabel>
              {groups.map((group) => (
                <DropdownMenuItem
                  key={group.id}
                  onClick={() => setGroup(group.id)}
                  className="gap-2 p-2"
                >
                  {group.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
