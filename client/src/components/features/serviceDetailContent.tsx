"use client";

import {  Tag, CheckCircle, XCircle } from "lucide-react";
import { useLocaleStore } from "../../store/localeStore";
import { t } from "../../i18";
import BookingForm from "./serviceBokingForm";
import Link from "next/link";

interface ServiceDetailContentProps {
  service: {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number;
    duration: number;
    isActive: boolean;
  };
  pillClass: string;
  barClass: string;
}


export default function ServiceDetailContent({
  service,
  pillClass,
  barClass,
}: ServiceDetailContentProps) {
  const { msgs } = useLocaleStore();

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8 items-start">
       <div>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">
            {t(msgs, "serviceDetail.serviceDetails")}
          </p>

          <article
            className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
            aria-labelledby="service-name"
          >
            <div aria-hidden="true" className={`h-1.5 w-full ${barClass}`} />

            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${pillClass}`}>
                <Tag size={11} className="inline mr-1 -mt-0.5" aria-hidden="true" />
                {service.category}
              </span>
              <h1
                id="service-name"
                className="text-white text-2xl sm:text-3xl font-bold"
              >
                {service.name}
              </h1>
            </div>

            <div className="p-6 space-y-6">

              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                  {t(msgs, "serviceDetail.aboutService")}
                </h2>
                <p className="text-zinc-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    {t(msgs, "serviceDetail.price")}
                  </p>
                  <p className="text-2xl font-extrabold text-blue-600">
                    ₪{service.price}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    {t(msgs, "serviceDetail.duration")}
                  </p>
                  <p className="text-2xl font-extrabold text-zinc-900 flex items-end gap-1">
                    {service.duration}
                    <span className="text-sm font-medium text-zinc-500 mb-0.5">{t(msgs, "serviceDetail.minutes")}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {service.isActive ? (
                  <>
                    <CheckCircle
                      size={15}
                      className="text-green-500 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-zinc-600">
                      {t(msgs, "serviceDetail.currentlyAvailable")}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle
                      size={15}
                      className="text-red-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-zinc-500">
                      {t(msgs, "serviceDetail.notAvailable")}
                    </span>
                  </>
                )}
              </div>
            </div>
          </article>
        </div>

        {service.isActive ? (
          <BookingForm
            service={{
              id:       service.id,
              title:    service.name,
              price:    service.price,
              duration: String(service.duration) + " min",
            }}
          />
        ) : (
          <div
            className="rounded-xl border border-zinc-200 bg-white shadow-sm p-10 text-center"
          >
            <p className="text-4xl mb-4" aria-hidden="true">🚫</p>
            <h2 className="text-zinc-900 text-xl font-bold mb-2">
              {t(msgs, "serviceDetail.notAvailableTitle")}
            </h2>
            <p className="text-zinc-500 text-sm">
              {t(msgs, "serviceDetail.notAvailableMessage")}
            </p>
            <Link
              href="/"
              className="inline-block mt-6 px-6 py-2.5 rounded-lg bg-blue-600 text-white
                font-medium text-sm hover:bg-blue-700 transition-colors
                focus:outline-2 focus:outline-offset-2 focus:outline-blue-800"
            >
              {t(msgs, "serviceDetail.browseOtherServices")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
