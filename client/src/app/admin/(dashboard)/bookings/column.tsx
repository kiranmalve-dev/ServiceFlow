"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/src/components/common/data-table-features";
import { Booking, BookingStatus } from "./type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { type Messages, t } from "@/src/i18";

const STATUS_PILL: Record<BookingStatus, string> = {
  PENDING:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100   text-blue-800   border-blue-200",
  COMPLETED: "bg-green-100  text-green-800  border-green-200",
  CANCELLED: "bg-red-100    text-red-700    border-red-200",
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING:   "admin.status.pending",
  CONFIRMED: "admin.status.confirmed",
  COMPLETED: "admin.status.completed",
  CANCELLED: "admin.status.cancelled",
};

interface BookingColumnsProps {
  onStatusChange: (id: string, status: BookingStatus) => void;
  msgs: Messages;
}

export function getBookingColumns({
  onStatusChange,
  msgs,
}: BookingColumnsProps): ColumnDef<DataTableFeatures, Booking, unknown>[] {
  return [
    {
      accessorKey: "user.name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="min-w-[140px]">
          <p className="font-medium leading-snug">{row.original.user.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.user.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "service.name",
      header: "Service",
      cell: ({ row }) => (
        <div className="min-w-[110px]">
          <p className="font-medium leading-snug">{row.original.service.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.service.category}</p>
        </div>
      ),
    },
    {
      accessorKey: "scheduledAt",
      header: "Scheduled",
      cell: ({ row }) => {
        const d = new Date(row.original.scheduledAt);
        return (
          <div className="min-w-[110px] text-sm">
            <p>{d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
            <p className="text-xs text-muted-foreground">
              {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <span
          className="block max-w-[180px] truncate text-sm"
          title={row.original.address}
        >
          {row.original.address}
        </span>
      ),
    },
    {
      accessorKey: "quotedPrice",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-semibold text-sm">₹{row.original.quotedPrice}</span>
      ),
    },
    {
      id: "statusBadge",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const label = t(msgs, STATUS_LABELS[status]);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs
              font-medium border whitespace-nowrap ${STATUS_PILL[status]}`}
          >
            {label}
          </span>
        );
      },
    },
    {
      id: "statusAction",
      header: "Change Status",
      cell: ({ row }) => {
        const booking = row.original;
        const isTerminal =
          booking.status === "COMPLETED" || booking.status === "CANCELLED";

        if (isTerminal) {
          return (
            <span className="text-xs text-muted-foreground italic">No actions</span>
          );
        }

        return (
          <Select
            value={booking.status}
            onValueChange={(value) =>
              onStatusChange(booking.id, value as BookingStatus)
            }
          >
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">{t(msgs, "admin.status.pending")}</SelectItem>
              <SelectItem value="CONFIRMED">{t(msgs, "admin.status.confirmed")}</SelectItem>
              <SelectItem value="COMPLETED">{t(msgs, "admin.status.completed")}</SelectItem>
              <SelectItem value="CANCELLED">{t(msgs, "admin.status.cancelled")}</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
        }),
    },
  ];
}
