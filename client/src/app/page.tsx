



import  { Suspense } from "react";
import ServicesSection from "../components/features/services";
import StatsStrip from "../components/features/statsStrip";
import Header from "../components/common/header";
import HeroSection from "../components/features/heroSection";
import ServicesHeader from "../components/features/servicesHeader";
import Loading from "./loading";

export default async function HomePage ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <>
    
      <Suspense fallback={<Loading />}>
      <Header />
      <section
        aria-labelledby="hero-heading"
        className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl"
        />
        <HeroSection />
      </section>
      <StatsStrip />
      <section
        id="services"
        aria-labelledby="services-heading"
        className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <ServicesHeader />
        <Suspense
          fallback={
            <ul
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} aria-hidden="true">
                  <div className="h-56 rounded-xl border border-zinc-200 bg-zinc-100 animate-pulse" />
                </li>
              ))}
            </ul>
          }
        >
          <ServicesSection searchParams={searchParams} />
        </Suspense>
      </section>
      </Suspense>
    </>
  );
}
