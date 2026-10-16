"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  CalendarCheck,
  Users,
  Tag,
  LogOut,
  LayoutDashboardIcon,
} from "lucide-react"
import { cn } from "cn"
import { Button } from "../ui/button"
import { logout } from "@/src/lib/auth"

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/admin/services",   label: "Services",   icon: Briefcase },
  { href: "/admin/bookings",   label: "Bookings",   icon: CalendarCheck },
  { href: "/admin/users",      label: "Users",      icon: Users },
  // { href: "/admin/categories", label: "Categories", icon: Tag },
] as const

export default function AdminSidebar() {
  const pathname = usePathname()
  const callLogoutApis= async ()=>{
    try{
      const res = await logout();
      if (res?.success) {
        window.location.href = "/admin/login"
      }
    }catch(error){
      console.log("error" , error)
    }
  }

  return (
    <aside
      className="flex h-full w-60 flex-col border-r bg-sidebar text-sidebar-foreground"
      aria-label="Admin navigation"
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <LayoutDashboard className="size-5 text-sidebar-primary" aria-hidden="true" />
        <span className="font-semibold text-sm">ServiceFlow Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          onClick={()=>callLogoutApis()}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          
        >
          <LogOut className="size-4 shrink-0" aria-hidden="true" />
          Sign out
        </Button>
      </div>
    </aside>
  )
}
