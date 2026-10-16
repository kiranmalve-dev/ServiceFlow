
"use client";

import type { ColumnDef } from "@tanstack/react-table";
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
}: ServiceColumnsProps): ColumnDef<Service>[] => [
  {
    accessorKey: "name",
    header: "Ful Name",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.isActive ? "default" : "destructive"}
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
