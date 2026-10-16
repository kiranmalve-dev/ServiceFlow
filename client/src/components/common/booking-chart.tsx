
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/components/ui/chart";
import { bookingChartData } from "@/src/app/admin/(dashboard)/dashboard/dashbaord";

const chartConfig = {
  bookings: {
    label: "Bookings",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function BookingChart() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Booking Analytics</CardTitle>
        <CardDescription>
          Monthly booking trends for the last six months
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[300px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={bookingChartData}
            margin={{ left: 0, right: 12, top: 10 }}
          >
            <defs>
              <linearGradient
                id="bookingGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="var(--color-bookings)"
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-bookings)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={32}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />

            <Area
              dataKey="bookings"
              type="monotone"
              stroke="var(--color-bookings)"
              fill="url(#bookingGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
