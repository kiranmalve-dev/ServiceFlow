
export const dashboardStats = [
  {
    title: "Total Services",
    value: 24,
    description: "18 active services",
    icon: "services",
  },
  {
    title: "Total Bookings",
    value: 156,
    description: "Across all services",
    icon: "bookings",
  },
  {
    title: "Pending Bookings",
    value: 18,
    description: "Awaiting confirmation",
    icon: "pending",
  },
  {
    title: "Completed Bookings",
    value: 112,
    description: "Successfully completed",
    icon: "completed",
  },
];

export const bookingChartData = [
  { month: "May", bookings: 24 },
  { month: "Jun", bookings: 38 },
  { month: "Jul", bookings: 32 },
  { month: "Aug", bookings: 45 },
  { month: "Sep", bookings: 56 },
  { month: "Oct", bookings: 68 },
];

export const recentBookings = [
  {
    id: "BK-1001",
    customer: "Kiran Malve",
    email: "kiran@example.com",
    service: "HVCA",
    date: "2026-10-18T10:00:00",
    amount: 20,
    status: "PENDING",
  },
  {
    id: "BK-1002",
    customer: "Rahul Sharma",
    email: "rahul@example.com",
    service: "Deep Cleaning",
    date: "2026-10-19T12:30:00",
    amount: 50,
    status: "CONFIRMED",
  },
  {
    id: "BK-1003",
    customer: "Priya Patel",
    email: "priya@example.com",
    service: "Home Maintenance",
    date: "2026-10-20T09:00:00",
    amount: 80,
    status: "COMPLETED",
  },
  {
    id: "BK-1004",
    customer: "Amit Verma",
    email: "amit@example.com",
    service: "HVCA-A",
    date: "2026-10-21T14:00:00",
    amount: 20,
    status: "CANCELLED",
  },
  {
    id: "BK-1005",
    customer: "Neha Singh",
    email: "neha@example.com",
    service: "Deep Cleaning",
    date: "2026-10-22T11:00:00",
    amount: 50,
    status: "PENDING",
  },
];

export const serviceOverview = [
  {
    id: "SRV-01",
    name: "HVCA",
    category: "Cleaning",
    price: 20,
    duration: 60,
    isActive: true,
  },
  {
    id: "SRV-02",
    name: "HVCA-A",
    category: "Cleaning",
    price: 20,
    duration: 60,
    isActive: true,
  },
  {
    id: "SRV-03",
    name: "Deep Cleaning",
    category: "Cleaning",
    price: 50,
    duration: 120,
    isActive: true,
  },
  {
    id: "SRV-04",
    name: "Home Maintenance",
    category: "Maintenance",
    price: 80,
    duration: 90,
    isActive: false,
  },
];
