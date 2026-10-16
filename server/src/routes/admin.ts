import { Router } from "express";
import { requireAdminAuth } from "../middleware/auth.js";
import {
  listAllBookingsHandler,
  updateBookingStatusHandler,
  adminSummaryHandler,
  listAllUsersHandler,
} from "../controllers/bookingController.js";
import { validateUpdateStatus } from "../validators/bookingValidator.js";

const router = Router();

// requireAdminAuth reads adm_token specifically.
// A customer (who only has cus_token) receives 401 — the cookie isn't there at all.
router.use(requireAdminAuth);

// GET   /api/admin/bookings              — list all bookings (filters + pagination)
router.get("/bookings", listAllBookingsHandler);

// GET All  User
router.get("/users", listAllUsersHandler);

// PATCH /api/admin/bookings/:id/status   — update booking status
router.patch("/bookings/:id/status", validateUpdateStatus, updateBookingStatusHandler);

// GET   /api/admin/summary               — dashboard stats
router.get("/summary", adminSummaryHandler);

export { router as adminRouter };
