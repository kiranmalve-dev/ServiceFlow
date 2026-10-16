import { Router } from "express";
import { requireCustomerAuth } from "../middleware/auth.js";
import {
  createBookingHandler,
  getMyBookingsHandler,
  cancelBookingHandler,
} from "../controllers/bookingController.js";
import { validateCreateBooking } from "../validators/bookingValidator.js";

const router = Router();

// requireCustomerAuth reads cus_token specifically.
// An admin (who only has adm_token) receives 401 — the cookie isn't there at all.
router.use(requireCustomerAuth);

// POST /api/bookings            — create a booking
router.post("/", validateCreateBooking, createBookingHandler);

// GET  /api/bookings/mine       — get own bookings
// NOTE: /mine must be registered BEFORE /:id to avoid Express matching "mine" as an id
router.get("/mine", getMyBookingsHandler);

// PATCH /api/bookings/:id/cancel — cancel own booking
router.patch("/:id/cancel", cancelBookingHandler);

export { router as bookingRouter };
