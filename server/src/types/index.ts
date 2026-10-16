// These mirror Prisma's generated types but are kept for use in
// API request/response shapes where we don't want to expose the full model.

export interface LoginBody {
  email: string;
  password: string;
  portal: "customer" | "admin";
}

export interface AuthPayload {
  id: number;
  email: string;
  role: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ── Booking ───────────────────────────────────────────────────────────────────

/** Valid booking statuses (mirrors the Booking.status string column) */
export type BookingStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

/** Allowed forward transitions for status changes */
export const VALID_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING:     ["CONFIRMED", "CANCELLED"],
  CONFIRMED:   ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED"],
  COMPLETED:   [],
  CANCELLED:   [],
};

export interface CreateBookingBody {
  serviceId: string;
  scheduledAt: string; // ISO date string from client
  address: string;
  notes?: string;
}


export interface AdminBookingFilters {
  status?: BookingStatus | undefined;
  userId?: number | undefined;
  serviceId?: string | undefined;
  search?: string | undefined;
  dateFrom?: string | undefined;
  dateTo?: string | undefined;
  page?: number;
  pageSize?: number;
}