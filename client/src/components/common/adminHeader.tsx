"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"

export default function AdminHeader() {
  return (
    <header
      role="banner"
      className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6 gap-4"
    >
      <div className="relative w-64">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search…"
          className="pl-8"
          aria-label="Search admin"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="size-4" aria-hidden="true" />
        </Button>

        <div
          className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold select-none"
          aria-label="Admin user"
        >
          AD
        </div>
      </div>
    </header>
  )
}
