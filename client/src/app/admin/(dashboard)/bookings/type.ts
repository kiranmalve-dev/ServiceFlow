
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface Booking {
  id: string;
  status: BookingStatus;
  scheduledAt: string;
  address: string;
  notes: string | null;
  quotedPrice: number;
  quotedService: string;
  createdAt: string;
  updatedAt: string;
  service: {
    id: string;
    name: string;
    category: string;
    duration: number;
  };
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BookingPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
