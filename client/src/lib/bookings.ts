import api from "@/src/lib/axiosIntercepter";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface BookingService {
  id: string;
  name: string;
  category: string;
  duration: number; // minutes
}

export interface BookingUser {
  id: number;
  name: string;
  email: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  scheduledAt: string; // ISO-8601
  address: string;
  notes: string;
  quotedPrice: number;
  quotedService: string;
  createdAt: string;
  updatedAt: string;
  service: BookingService;
  user: BookingUser;
}

export interface BookingsMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface BookingsResponse {
  success: boolean;
  message: string;
  data: {
    data: Booking[];
    meta: BookingsMeta;
  };
}

/**
 * Fetch the currently authenticated customer's bookings.
 * GET /bookings/mine
 */
export async function getMyBookings(): Promise<{
  bookings: Booking[];
  meta: BookingsMeta;
}> {
  const body = (await api.get("/bookings/mine")) as BookingsResponse;
  return {
    bookings: body.data.data,
    meta: body.data.meta,
  };
}
