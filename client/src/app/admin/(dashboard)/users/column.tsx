"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { type DataTableFeatures } from "@/src/components/common/data-table-features";
import { User } from "./type";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";

interface UserColumnsProps {
  onDelete: (user: User) => void;
}

export const getUserColumns = ({
  onDelete,
}: UserColumnsProps): ColumnDef<DataTableFeatures, User, unknown>[] => [
  {
    accessorKey: "name",
    header: "Full Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone ?? "—",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString("en-IN"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDelete(row.original)}
      >
        Delete
      </Button>
    ),
  },
];
