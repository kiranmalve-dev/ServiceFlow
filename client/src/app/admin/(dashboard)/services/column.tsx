"use client";

import type { ColumnDef, TableFeatures } from "@tanstack/react-table";
import { Service } from "./type";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

interface ServiceColumnsProps {
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export const getServiceColumns = ({
  onEdit,
  onDelete,
}: ServiceColumnsProps): ColumnDef<TableFeatures,
  Service,
  unknown>[] => [
  {
    accessorKey: "name",
    header: "Service Name",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span
        className="block max-w-[240px] truncate"
        title={row.original.description}
      >
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(row.original.price),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => `${row.original.duration} min`,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.isActive ? "default" : "secondary"}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("en-IN"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(row.original)}
        >
          Edit
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(row.original)}
        >
          Delete
        </Button>
      </div>
    ),
  },
];