import { Router } from "express";
import {
  listServices,
  getService,
  createServiceHandler,
  updateServiceHandler,
  deleteServiceHandler,
} from "../controllers/serviceController.js";
import {
  validateCreateService,
  validateUpdateService,
} from "../validators/serviceValidator.js";

// ── Public routes ─────────────────────────────────────────────────────────────
const publicRouter = Router();

// GET  /api/services            — list active services (supports ?category= & ?search=)
publicRouter.get("/", listServices);

// GET  /api/services/:id        — get one service by ID
publicRouter.get("/:id", getService);

// ── Admin routes ──────────────────────────────────────────────────────────────
const adminRouter = Router();

// POST   /api/admin/services        — create a new service
adminRouter.post("/", validateCreateService, createServiceHandler);

// PATCH  /api/admin/services/:id    — update a service (partial)
adminRouter.patch("/:id", validateUpdateService, updateServiceHandler);

// DELETE /api/admin/services/:id    — hard delete (only if no bookings)
adminRouter.delete("/:id", deleteServiceHandler);

export { publicRouter as servicePublicRouter, adminRouter as serviceAdminRouter };
