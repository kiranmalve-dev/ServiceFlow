"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon } from "lucide-react";
import { format, isBefore, startOfToday } from "date-fns";
import { Calendar } from "@/src/components/ui/calendar";
import api from "@/src/lib/axiosIntercepter";

interface Service {
  id: string;
  title: string;
  price: number;
  duration: string;
}

interface Props {
  service: Service;
}

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
];

export default function BookingForm({ service }: Props) {
  const today = startOfToday();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [address,      setAddress]      = useState("");
  const [notes,        setNotes]        = useState("");
  const [submitted,    setSubmitted]    = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [apiError,     setApiError]     = useState<string | null>(null);

  const calendarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    }
    if (calendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  const isValid =
    selectedDate !== undefined &&
    selectedTime !== "" &&
    address.trim().length >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !selectedDate) return;

    const [hours, minutes] = selectedTime.split(":").map(Number) as [number, number];
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    setApiError(null);
    setSubmitting(true);
    try {
      await api.post("/bookings", {
        serviceId:   service.id,
        scheduledAt: scheduledAt.toISOString(),
        address:     address.trim(),
        notes:       notes.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err) {
      const apiErr = err as { message?: string };
      setApiError(apiErr?.message ?? "Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm p-10 text-center">
        <div className="text-5xl mb-4" aria-hidden="true">🎉</div>
        <h3 className="text-zinc-900 text-2xl font-bold mb-2">Booking Confirmed!</h3>
        <p className="text-zinc-600 mb-1">
          <strong>{service.title}</strong>
          {selectedDate && (
            <> on <strong>{format(selectedDate, "PPP")}</strong> at <strong>{selectedTime}</strong></>
          )}
        </p>
        <p className="text-zinc-500 text-sm mb-6">
          We&apos;ll send a confirmation to your email shortly.
        </p>
        <a
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold
            px-6 py-3 rounded-xl transition-colors text-sm
            focus:outline-2 focus:outline-offset-2 focus:outline-blue-800"
        >
          Browse More Services
        </a>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
        Schedule &amp; Booking Form
      </p>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border border-zinc-200 bg-white shadow-sm p-6 flex flex-col gap-6"
      >

        <div>
          <label
            id="date-label"
            className="block text-xs font-bold uppercase tracking-widest text-zinc-700 mb-2"
          >
            Preferred Date <span className="text-red-500">*</span>
          </label>

          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={calendarOpen}
              aria-labelledby="date-label"
              onClick={() => setCalendarOpen((v) => !v)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left
                bg-zinc-50 border transition-colors
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${selectedDate
                  ? "text-zinc-900 border-zinc-300"
                  : "text-zinc-400 border-zinc-200"}
              `}
            >
              <CalendarIcon
                size={16}
                aria-hidden="true"
                className="flex-shrink-0 text-zinc-400"
              />
              <span className="flex-1">
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </span>
              <svg
                aria-hidden="true"
                className={`w-4 h-4 flex-shrink-0 text-zinc-400 transition-transform ${calendarOpen ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {calendarOpen && (
              <div
                role="dialog"
                aria-label="Date picker calendar"
                className="absolute z-50 mt-2 left-0 rounded-xl border border-zinc-200
                  bg-white shadow-lg overflow-hidden"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }}
                  disabled={(date) => isBefore(date, today)}
                  initialFocus
                />
              </div>
            )}
          </div>
        </div>

        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-widest text-zinc-700 mb-3">
            Preferred Time <span className="text-red-500">*</span>
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedTime(slot)}
                  aria-pressed={isSelected}
                  className={`
                    py-2 px-1 rounded-lg text-xs font-semibold border transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500
                    ${isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "text-zinc-600 border-zinc-200 hover:border-blue-300 hover:bg-blue-50 bg-white"
                    }
                  `}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="service-address"
            className="block text-xs font-bold uppercase tracking-widest text-zinc-700 mb-2"
          >
            Service Address <span className="text-red-500">*</span>
          </label>
          <input
            id="service-address"
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Tech Lane, Tel Aviv"
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl
              text-zinc-900 placeholder-zinc-400 text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors hover:border-zinc-300"
          />
          {address.trim().length > 0 && address.trim().length < 5 && (
            <p role="alert" className="mt-1.5 text-xs text-red-500">
              Address must be at least 5 characters.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="booking-notes"
            className="block text-xs font-bold uppercase tracking-widest text-zinc-700 mb-2"
          >
            Additional Notes{" "}
            <span className="text-zinc-400 font-normal normal-case">(Optional)</span>
          </label>
          <textarea
            id="booking-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific instructions..."
            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl
              text-zinc-900 placeholder-zinc-400 text-sm resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors hover:border-zinc-300"
          />
        </div>

        <div className={`flex items-center gap-2 text-sm ${isValid ? "text-green-600" : "text-amber-600"}`}>
          {isValid ? (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Ready to submit</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>
                {!selectedDate
                  ? "Pick a date to continue"
                  : !selectedTime
                  ? "Pick a time slot"
                  : "Enter a service address (min 5 chars)"}
              </span>
            </>
          )}
        </div>

        {apiError && (
          <div
            role="alert"
            className="flex items-start gap-2 text-sm text-red-600
              bg-red-50 border border-red-200 rounded-xl px-4 py-3"
          >
            <span aria-hidden="true" className="flex-shrink-0 mt-0.5">✕</span>
            {apiError}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || submitting}
          aria-disabled={!isValid || submitting}
          aria-busy={submitting}
          className={`
            w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600
            ${isValid && !submitting
              ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm shadow-blue-200"
              : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            }
          `}
        >
          {submitting ? "Creating Booking…" : "Confirm & Book"}
        </button>
      </form>
    </div>
  );
}
