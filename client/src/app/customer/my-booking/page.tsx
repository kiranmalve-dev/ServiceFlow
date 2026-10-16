"use client";

import  { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, MapPin, RefreshCw } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useLocaleStore } from "../../../store/localeStore";
import { useCustomerAuthStore } from "../../../store/customerAuthStore";
import { t } from "../../../i18";
import { getMyBookings, type Booking, type BookingStatus } from "@/src/lib/bookings";
import api from "@/src/lib/axiosIntercepter";


const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING:     "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED:   "bg-green-100  text-green-800  border-green-200",
  IN_PROGRESS: "bg-blue-100   text-blue-800   border-blue-200",
  COMPLETED:   "bg-zinc-100   text-zinc-700   border-zinc-200",
  CANCELLED:   "bg-red-100    text-red-700    border-red-200",
};

function statusLabel(msgs: ReturnType<typeof useLocaleStore>, status: BookingStatus): string {
  const map: Partial<Record<BookingStatus, string>>["msgs"] = {
    CONFIRMED: t(msgs, "myBooking.status.confirmed"),
    PENDING:   t(msgs, "myBooking.status.pending"),
    CANCELLED: t(msgs, "myBooking.status.cancelled"),
  };
  return map[status] ?? status;
}

function BookingSkeleton() {
  return (
    <ul role="list" className="flex flex-col gap-4" aria-label="Loading bookings">
      {[1, 2, 3].map((n) => (
        <li key={n}>
          <div className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm
            flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-zinc-200 rounded w-1/3" />
              <div className="h-3 bg-zinc-100 rounded w-1/2" />
              <div className="h-3 bg-zinc-100 rounded w-2/5" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 bg-zinc-200 rounded-full" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function MyBookingPage() {
  const { msgs } = useLocaleStore();
  const { isAuthenticated } = useCustomerAuthStore();
  const router = useRouter();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { bookings: data } = await getMyBookings();
      setBookings(data);
    } catch (err) {
      const e = err as { message?: string };
      setError(e?.message ?? "Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCancelBooking=async (id:string)=>{
    try {
      const result =await  api.patch(`/bookings/${id}/cancel`);
      if(result.success){
        fetchBookings()
      }
    } catch (error) {
      console.log('error' , error)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, fetchBookings]);

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 sm:text-4xl">
            {t(msgs, "myBooking.title")}
          </h1>
          <p className="mt-2 text-zinc-500 text-base">
            {t(msgs, "myBooking.subtitle")}
          </p>
        </div>

        {!loading && (
          <button
            type="button"
            onClick={fetchBookings}
            aria-label="Refresh bookings"
            className="mt-1 p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors
              focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
          >
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        )}
      </header>

      {loading && <BookingSkeleton />}

      {!loading && error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 flex items-center justify-between gap-4"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchBookings}
            className="text-red-700 font-medium underline hover:no-underline
              focus:outline-2 focus:outline-offset-2 focus:outline-red-600 rounded"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 text-lg mb-4">
            {t(msgs, "myBooking.noBookings")}
          </p>
          <Link
            href="/customer/services"
            className="inline-block px-6 py-2.5 rounded bg-blue-600 text-white
              font-medium text-sm hover:bg-blue-700 transition-colors
              focus:outline-2 focus:outline-offset-2 focus:outline-blue-800"
          >
            {t(msgs, "myBooking.browseServices")}
          </Link>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <ul
          role="list"
          className="flex flex-col gap-4"
          aria-label={t(msgs, "myBooking.title")}
        >
          {bookings.map((booking) => {
            const scheduled = parseISO(booking.scheduledAt);
            const dateStr   = format(scheduled, "PPP");   // e.g. "November 5, 2026"
            const timeStr   = format(scheduled, "p");     // e.g. "10:00 AM"
            const label     = statusLabel(msgs, booking.status);

            return (
              <li key={booking.id}>
                <article
                  aria-labelledby={`booking-service-${booking.id}`}
                  className="rounded-xl border border-zinc-200 bg-white p-5 sm:p-6
                    shadow-sm flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4
                    hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <h2
                      id={`booking-service-${booking.id}`}
                      className="text-base font-semibold text-zinc-900 truncate"
                    >
                      {booking.service.name}
                    </h2>

                    <p className="text-xs text-zinc-400 font-mono">
                      #{booking.id.slice(-8).toUpperCase()}
                    </p>

                    <dl className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-zinc-500 mt-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={13} className="text-zinc-400 flex-shrink-0" aria-hidden="true" />
                        <dt className="sr-only">{t(msgs, "myBooking.date")}</dt>
                        <dd>
                          <time dateTime={booking.scheduledAt}>{dateStr}</time>
                        </dd>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-zinc-400 flex-shrink-0" aria-hidden="true" />
                        <dt className="sr-only">{t(msgs, "myBooking.time")}</dt>
                        <dd>{timeStr}</dd>
                      </div>

                      <div className="flex items-center gap-1.5 w-full sm:w-auto">
                        <MapPin size={13} className="text-zinc-400 flex-shrink-0" aria-hidden="true" />
                        <dt className="sr-only">Address</dt>
                        <dd className="truncate max-w-[220px]">{booking.address}</dd>
                      </div>
                    </dl>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-sm font-bold text-blue-700">
                        ₹{booking.quotedPrice}
                      </span>
                      <span className="text-zinc-300">·</span>
                      <span className="text-xs text-zinc-500">
                        {booking.service.category}
                      </span>
                      <span className="text-zinc-300">·</span>
                      <span className="text-xs text-zinc-500">
                        {booking.service.duration} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0 pt-0.5">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full
                        text-xs font-medium border ${STATUS_STYLES[booking.status]}`}
                      aria-label={`Status: ${label}`}
                    >
                      {label}
                    </span>

                    {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                      <button
                        type="button"
                        className="text-sm text-red-600 font-medium
                          hover:text-red-800 hover:underline
                          focus:outline-2 focus:outline-offset-2 focus:outline-red-600 rounded"
                        onClick={()=>handleCancelBooking(booking.id)}
                      >
                        {t(msgs, "myBooking.cancel")}
                      </button>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div></>
  );
}
