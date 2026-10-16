import React from "react"

export default function StatsStrip() {
    return <section aria-label="Key stats" className="bg-white border-b border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                {[
                    { value: "500+", label: "Happy Customers" },
                    { value: "8", label: "Services" },
                    { value: "3", label: "Categories" },
                    { value: "4.9★", label: "Average Rating" },
                ].map(({ value, label }) => (
                    <div key={label}>
                        <dt className="text-2xl font-extrabold text-blue-600">{value}</dt>
                        <dd className="mt-0.5 text-sm text-zinc-500">{label}</dd>
                    </div>
                ))}
            </dl>
        </div>
    </section>
}