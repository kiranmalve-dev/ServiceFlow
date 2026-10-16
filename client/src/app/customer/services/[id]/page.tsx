import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailContent from "@/src/components/features/serviceDetailContent";

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;   // minutes
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const CATEGORY_PILL: Record<string, string> = {
  Cleaning: "bg-teal-100   text-teal-700",
  Beauty: "bg-pink-100   text-pink-700",
  Fitness: "bg-orange-100 text-orange-700",
  Wellness: "bg-purple-100 text-purple-700",
  Plumbing: "bg-blue-100   text-blue-700",
  Electrical: "bg-yellow-100 text-yellow-700",
  HVAC: "bg-cyan-100   text-cyan-700",
  Gardening: "bg-green-100  text-green-700",
};

const CATEGORY_BAR: Record<string, string> = {
  Cleaning: "bg-teal-400",
  Beauty: "bg-pink-400",
  Fitness: "bg-orange-400",
  Wellness: "bg-purple-400",
  Plumbing: "bg-blue-400",
  Electrical: "bg-yellow-400",
  HVAC: "bg-cyan-400",
  Gardening: "bg-green-400",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { service } = await getService(id);
  return {
    title: service ? `${service.name} — ServiceFlow` : "Service — ServiceFlow",
    description: service?.description ?? "Book a service with ServiceFlow.",
  };
}

async function getService(id: string): Promise<{
  service: Service | null;
  error: string | null;
}> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/services/${id}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return {
        service: null,
        error: `Failed to load service (${res.status} ${res.statusText})`,
      };
    }
    const json = await res.json();
    const service: Service = json.data;
    return { service, error: null };
  } catch (err) {
    console.log(err);
    return {
      service: null,
      error: "Unable to connect to the server.",
    };
  }
}


export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { service } = await getService(id);

  if (!service) {
    notFound();
  }

  const pillClass = CATEGORY_PILL[service.category] ?? "bg-zinc-100 text-zinc-600";
  const barClass = CATEGORY_BAR[service.category] ?? "bg-zinc-300";

  return (
    <main
      id="main-content"
      className="flex-1 bg-gradient-to-br from-zinc-50 to-blue-50 py-10 px-4"
    >
        <div className="max-w-6xl mx-auto">
          <ServiceDetailContent
            service={service}
            pillClass={pillClass}
            barClass={barClass}
          />
        </div>
      </main>
  );
}
