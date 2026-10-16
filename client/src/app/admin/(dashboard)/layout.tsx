import React from "react"
import AdminSidebar from "@/src/components/common/adminSidebar"
import AdminHeader from "@/src/components/common/adminHeader"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6 bg-muted/30"
        >
          {children}
        </main>
      </div>
    </div>
  )
}
