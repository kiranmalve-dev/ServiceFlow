"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCustomerAuthStore } from "@/src/store/customerAuthStore";
import LoginDialog from "./loginDialog";
import { useLocaleStore } from "@/src/store/localeStore";
import { t } from "../../i18";
interface BookButtonProps {
  serviceId: string;
  serviceName: string;
}

export default function BookButton({ serviceId, serviceName }: BookButtonProps) {
  const { isAuthenticated } = useCustomerAuthStore();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { msgs } = useLocaleStore();
  const serviceUrl = `/customer/services/${serviceId}`;

  // ── Authenticated: original behaviour (plain Link kept below) ──────────────
  if (isAuthenticated) {
    return (
      // Old code — unchanged
      <Link
        href={serviceUrl}
        aria-label={`Book ${serviceName}`}
        className="block w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm
          text-center hover:bg-blue-700 active:bg-blue-800
          focus:outline-2 focus:outline-offset-2 focus:outline-blue-800
          transition-all"
      >
          {t(msgs, "services.bookNow")}
      </Link>
    );
  }

  // ── Unauthenticated: open login dialog, then navigate after success ─────────
  return (
    <>
      <button
        type="button"
        aria-label={`Book ${serviceName} — sign in required`}
        onClick={() => setDialogOpen(true)}
        className="block w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm
          text-center hover:bg-blue-700 active:bg-blue-800
          focus:outline-2 focus:outline-offset-2 focus:outline-blue-800
          transition-all"
      >
        Book Now
      </button>

      <LoginDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => router.push(serviceUrl)}
      />
    </>
  );
}
