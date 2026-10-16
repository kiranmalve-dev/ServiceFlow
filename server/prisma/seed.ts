import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── 1. Users (1 admin + 2 customers) ────────────────────────────────────────
  const usersData = [
    { name: "Admin User",   email: "admin@serviceflow.com", password: "Admin@123",  role: "admin"    },
    { name: "Kiran Malve",  email: "kiran@example.com",     password: "Kiran@123",  role: "customer" },
    { name: "Rahul Sharma", email: "rahul@example.com",     password: "Rahul@123",  role: "customer" },
  ];

  const createdUsers: Record<string, number> = {};

  for (const u of usersData) {
    const hashed = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where:  { email: u.email },
      update: { name: u.name, password: hashed, role: u.role },
      create: { name: u.name, email: u.email, password: hashed, role: u.role },
    });
    createdUsers[u.email] = user.id;
  }
  console.log("✓ Users seeded:", Object.keys(createdUsers).join(", "));

  // ── 2. Services (6 across 3 categories) ─────────────────────────────────────
  const servicesData = [
    // Cleaning (3)
    { name: "Deep Home Cleaning",    category: "Cleaning",   description: "Full interior deep clean including kitchen, bathrooms, and all living areas.",           price: 50,  duration: 120, isActive: true  },
    { name: "Office Cleaning",       category: "Cleaning",   description: "Professional cleaning of office spaces — desks, floors, windows, and common areas.",    price: 35,  duration: 90,  isActive: true  },
    { name: "Post-Construction Clean",category: "Cleaning",  description: "Remove construction dust, debris, and residue for a move-in-ready space.",              price: 80,  duration: 180, isActive: false },
    // Plumbing (2)
    { name: "Pipe Repair",           category: "Plumbing",   description: "Diagnose and fix leaking or burst pipes using quality fittings and sealants.",           price: 60,  duration: 60,  isActive: true  },
    { name: "Drain Unblocking",      category: "Plumbing",   description: "High-pressure hydro-jetting to clear blocked drains and restore full water flow.",       price: 45,  duration: 45,  isActive: true  },
    // Electrical (1)
    { name: "Wiring Inspection",     category: "Electrical", description: "Full safety audit of home or office wiring, sockets, and circuit breaker panels.",      price: 70,  duration: 75,  isActive: true  },
  ];

  const createdServices: Record<string, string> = {};

  for (const s of servicesData) {
    const svc = await prisma.service.upsert({
      where:  { id: s.name.toLowerCase().replace(/\s+/g, "-") },
      update: { ...s },
      create: { id: s.name.toLowerCase().replace(/\s+/g, "-"), ...s },
    });
    createdServices[s.name] = svc.id;
  }
  console.log("✓ Services seeded:", Object.keys(createdServices).join(", "));

  // ── 3. Bookings (12, mixed dates and statuses) ───────────────────────────────
  // Reference dates relative to a fixed anchor so the seed stays consistent.
  // All times are stored as UTC ISO strings.
  const K = createdUsers["kiran@example.com"]!;
  const R = createdUsers["rahul@example.com"]!;

  const SVC = createdServices;

  const bookingsData = [
    // --- Kiran's bookings (6) ---
    {
      userId: K, serviceId: SVC["Deep Home Cleaning"]!,
      scheduledAt: new Date("2026-11-05T09:00:00Z"), address: "12 Maple Street, Bangalore",
      notes: "Please bring eco-friendly products", quotedPrice: 50, quotedService: "Deep Home Cleaning",
      status: "CONFIRMED",
    },
    {
      userId: K, serviceId: SVC["Pipe Repair"]!,
      scheduledAt: new Date("2026-11-10T14:00:00Z"), address: "12 Maple Street, Bangalore",
      notes: "", quotedPrice: 60, quotedService: "Pipe Repair",
      status: "PENDING",
    },
    {
      userId: K, serviceId: SVC["Wiring Inspection"]!,
      scheduledAt: new Date("2026-10-20T10:00:00Z"), address: "12 Maple Street, Bangalore",
      notes: "Check all sockets in the garage", quotedPrice: 70, quotedService: "Wiring Inspection",
      status: "COMPLETED",
    },
    {
      userId: K, serviceId: SVC["Drain Unblocking"]!,
      scheduledAt: new Date("2026-10-28T11:00:00Z"), address: "12 Maple Street, Bangalore",
      notes: "", quotedPrice: 45, quotedService: "Drain Unblocking",
      status: "CANCELLED",
    },
    {
      userId: K, serviceId: SVC["Office Cleaning"]!,
      scheduledAt: new Date("2026-11-15T08:00:00Z"), address: "45 Tech Park, Bangalore",
      notes: "After hours cleaning preferred", quotedPrice: 35, quotedService: "Office Cleaning",
      status: "PENDING",
    },
    {
      userId: K, serviceId: SVC["Pipe Repair"]!,
      scheduledAt: new Date("2026-09-12T13:00:00Z"), address: "12 Maple Street, Bangalore",
      notes: "", quotedPrice: 60, quotedService: "Pipe Repair",
      status: "COMPLETED",
    },
    // --- Rahul's bookings (6) ---
    {
      userId: R, serviceId: SVC["Deep Home Cleaning"]!,
      scheduledAt: new Date("2026-11-08T09:00:00Z"), address: "78 Lake View, Mumbai",
      notes: "Focus on kitchen and bathrooms", quotedPrice: 50, quotedService: "Deep Home Cleaning",
      status: "IN_PROGRESS",
    },
    {
      userId: R, serviceId: SVC["Wiring Inspection"]!,
      scheduledAt: new Date("2026-11-12T15:00:00Z"), address: "78 Lake View, Mumbai",
      notes: "", quotedPrice: 70, quotedService: "Wiring Inspection",
      status: "PENDING",
    },
    {
      userId: R, serviceId: SVC["Drain Unblocking"]!,
      scheduledAt: new Date("2026-10-18T09:00:00Z"), address: "78 Lake View, Mumbai",
      notes: "Kitchen sink is very slow", quotedPrice: 45, quotedService: "Drain Unblocking",
      status: "COMPLETED",
    },
    {
      userId: R, serviceId: SVC["Office Cleaning"]!,
      scheduledAt: new Date("2026-11-20T07:30:00Z"), address: "22 Biz Hub, Mumbai",
      notes: "", quotedPrice: 35, quotedService: "Office Cleaning",
      status: "CONFIRMED",
    },
    {
      userId: R, serviceId: SVC["Pipe Repair"]!,
      scheduledAt: new Date("2026-10-05T12:00:00Z"), address: "78 Lake View, Mumbai",
      notes: "Bathroom tap leaking", quotedPrice: 60, quotedService: "Pipe Repair",
      status: "CANCELLED",
    },
    {
      userId: R, serviceId: SVC["Deep Home Cleaning"]!,
      scheduledAt: new Date("2026-09-25T09:00:00Z"), address: "78 Lake View, Mumbai",
      notes: "", quotedPrice: 50, quotedService: "Deep Home Cleaning",
      status: "COMPLETED",
    },
  ];

  let bookingCount = 0;
  for (const b of bookingsData) {
    await prisma.booking.create({ data: b });
    bookingCount++;
  }
  console.log(`✓ Bookings seeded: ${bookingCount} bookings`);

  console.log("\n═══════════════════════════════════════════════");
  console.log(" Seed complete. Demo credentials:");
  console.log("  Admin   → admin@serviceflow.com  / Admin@123");
  console.log("  Customer → kiran@example.com      / Kiran@123");
  console.log("  Customer → rahul@example.com      / Rahul@123");
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
