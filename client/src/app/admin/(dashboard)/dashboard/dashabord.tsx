
"use client";

import Link from "next/link";
import {
  ArrowUpRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import React  from "react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { recentBookings, serviceOverview } from "./dashbaord";
import BookingChart from "@/src/components/common/booking-chart";
import api from "@/src/lib/axiosIntercepter";
import { DashboardCards, type DashboardStatsData } from "./dashbaordCard";


function statusVariant(status: string) {
  switch (status) {
    case "COMPLETED":
      return "default" as const;
    case "CANCELLED":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export default function Dashboard() {
  const [dashabordData, setDashbaordData] = React.useState<DashboardStatsData | undefined>(undefined);

  const fetchDashbaord = React.useCallback(() => {
    Promise.resolve()
      .then(() => api.get<{ data: DashboardStatsData }>("/admin/summary"))
      .then((response) => {
        setDashbaordData(response?.data);
      })
      .catch((error: unknown) => {
        console.error("Failed to fetch dashboard:", error);
      });
  }, []);

  React.useEffect(() => {
    fetchDashbaord();
  }, [fetchDashbaord]);


  

  return (
    <main className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here is your service management overview.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCards apiData={dashabordData} />
      </div>

      <div className="grid gap-6">
        <BookingChart />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Recent Bookings</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Latest customer service requests
            </p>
          </div>

          <Button variant="outline" size="sm">
            <Link href="/admin/bookings">
              View all
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col justify-between gap-3 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {booking.customer}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {booking.service} · {booking.id}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(booking.date).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                  <span className="text-sm font-semibold">
                    ₹{booking.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Services Overview</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Service pricing and availability
            </p>
          </div>

          <Button variant="outline" size="sm">
            <Link href="/admin/services">
              View all
              <ArrowUpRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {serviceOverview.map((service) => (
              <div
                key={service.id}
                className="flex flex-col justify-between gap-2 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {service.category} · {service.duration} min
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    ₹{service.price}
                  </span>
                  <Badge
                    variant={
                      service.isActive ? "default" : "secondary"
                    }
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
