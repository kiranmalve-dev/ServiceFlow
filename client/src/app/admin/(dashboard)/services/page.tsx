"use client";

import api from "@/src/lib/axiosIntercepter";
import React from "react";
import { Plus } from "lucide-react";
import { Service } from "./type";
import { getServiceColumns } from "./column";
import { DataTable } from "@/src/components/common/data-table";
import { Button } from "@/src/components/ui/button";
import CreateServiceDialog from "./createServiceDialog";
import { useLocaleStore } from "@/src/store/localeStore";
import { t } from "@/src/i18";

export default function Services() {
  const { msgs } = useLocaleStore();
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);

  const fetchServices = React.useCallback(async () => {
    try {
      const response = await api.get("/services");
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
  };

  const handleDelete = async (service: Service) => {
    const confirmed = window.confirm(
      `${t(msgs, "admin.deleteConfirm")} "${service.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/services/${service.id}`);

      setServices((previous) =>
        previous.filter((item) => item.id !== service.id)
      );
    } catch (error) {
      console.error("Failed to delete service:", error);
      window.alert(t(msgs, "admin.unableToDelete"));
    }
  };

  const handleCreated = (newService: Service) => {
    setServices((prev) => [newService, ...prev]);
  };

  const columns = React.useMemo(
    () =>
      getServiceColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    []
  );

  if (loading) {
    return <div className="p-6">{t(msgs, "admin.loadingServices")}</div>;
  }

  return (
    <>
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t(msgs, "admin.services")}</h1>
            <p className="text-sm text-muted-foreground">
              {t(msgs, "admin.servicesSubtitle")}
            </p>
          </div>

          <Button
            onClick={() => setCreateOpen(true)}
            className="gap-1.5 shrink-0"
          >
            <Plus className="size-4" aria-hidden="true" />
            {t(msgs, "admin.newService")}
          </Button>
        </div>

        <DataTable columns={columns} data={services} />
      </div>

      <CreateServiceDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </>
  );
}
