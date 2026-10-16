"use client";

import api from "@/src/lib/axiosIntercepter";
import React from "react";
import { Service } from "./type";
import { getServiceColumns } from "./column";
import { DataTable } from "@/src/components/common/data-table";
import { useLocaleStore } from "@/src/store/localeStore";
import { t } from "@/src/i18";


export default function Services() {
  const { msgs } = useLocaleStore();
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchServices = React.useCallback(async () => {
    try {
      const response = await api.get("/admin/users");
      setServices(response?.data?.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleEdit = (service: Service) => {
    console.log("Edit service:", service);
    // Open your edit form or dialog here.
  };

  const handleDelete = async (service: Service) => {
    const confirmed = window.confirm(
      `${t(msgs, "admin.deleteConfirm")} "${service.name}"?`
    );

    if (!confirmed) return;

    try {
      // Confirm this route with your backend.
      await api.delete(`/admin/services/${service.id}`);

      setServices((previous) =>
        previous.filter((item) => item.id !== service.id)
      );
    } catch (error) {
      console.error("Failed to delete service:", error);
      window.alert(t(msgs, "admin.unableToDelete"));
    }
  };

  const columns = React.useMemo(
    () => getServiceColumns({
      onEdit: handleEdit,
      onDelete: handleDelete,
    }),
    []
  );

  if (loading) {
    return <div className="p-6">{t(msgs, "admin.loadingServices")}</div>;
  }
  console.log("data", services)
  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">{t(msgs, "admin.users")}</h1>
        <p className="text-sm text-muted-foreground">
          {t(msgs, "admin.usersSubtitle")}
        </p>
      </div>

      <DataTable columns={columns} data={services} />
    </div>
  );
}

