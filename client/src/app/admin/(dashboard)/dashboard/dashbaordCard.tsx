import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Calendar, DollarSign, Wrench, Users } from "lucide-react";

// 1. API Response ki exact shape
export interface DashboardStatsData {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    totalCents: number;
    totalFormatted: string;
  };
  services: {
    total: number;
    active: number;
  };
  customers: {
    total: number;
  };
}

// 2. Component Props Interface
interface DashboardCardsProps {
  apiData: DashboardStatsData;
}

export function DashboardCards({ apiData }: DashboardCardsProps) {
  return (
    <>
      {/* 1. Bookings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apiData.bookings.total}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {apiData.bookings.pending} pending, {apiData.bookings.cancelled} cancelled
          </p>
        </CardContent>
      </Card>

      {/* 2. Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apiData.revenue.totalFormatted}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Total earnings to date
          </p>
        </CardContent>
      </Card>

      {/* 3. Services Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Active Services</CardTitle>
          <Wrench className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apiData.services.active}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Out of {apiData.services.total} total services
          </p>
        </CardContent>
      </Card>

      {/* 4. Customers Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          <Users className="size-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{apiData.customers.total}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Registered clients
          </p>
        </CardContent>
      </Card>
    </>
  );
}