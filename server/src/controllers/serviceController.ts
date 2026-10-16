import type { Request, Response } from "express";
import type { ApiResponse } from "../types/index.js";
import type { CreateServiceInput, UpdateServiceInput, ServiceFilters } from "../services/serviceService.js";
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../services/serviceService.js";

// ── Public ────────────────────────────────────────────────────────────────────

/**
 * GET /api/services
 * Query params: category, search, page, pageSize
 */
export async function listServices(req: Request, res: Response): Promise<void> {
  try {
    const filters: ServiceFilters = {
      isActive: true, // public endpoint — only active services
    };

    if (req.query["category"]) {
      filters.category = req.query["category"] as string;
    }
    if (req.query["search"]) {
      filters.search = req.query["search"] as string;
    }
    if (req.query["page"]) {
      filters.page = Number(req.query["page"]);
    }
    if (req.query["pageSize"]) {
      filters.pageSize = Number(req.query["pageSize"]);
    }

    const result = await getAllServices(filters);

    const body: ApiResponse<typeof result> = {
      success: true,
      message: "Services fetched successfully.",
      data: result,
    };

    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    res.status(500).json({ success: false, message } satisfies ApiResponse);
  }
}

/**
 * GET /api/services/:id
 */
export async function getService(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params["id"] ?? "");
    const service = await getServiceById(id);

    const body: ApiResponse<typeof service> = {
      success: true,
      message: "Service fetched successfully.",
      data: service,
    };

    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    const status  = message === "Service not found." ? 404 : 500;
    res.status(status).json({ success: false, message } satisfies ApiResponse);
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/services
 */
export async function createServiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body as CreateServiceInput;
    const service = await createService(input);

    const body: ApiResponse<typeof service> = {
      success: true,
      message: "Service created successfully.",
      data: service,
    };

    res.status(201).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    res.status(500).json({ success: false, message } satisfies ApiResponse);
  }
}

/**
 * PATCH /api/admin/services/:id
 */
export async function updateServiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body as UpdateServiceInput;
    const id = String(req.params["id"] ?? "");
    const service = await updateService(id, input);

    const body: ApiResponse<typeof service> = {
      success: true,
      message: "Service updated successfully.",
      data: service,
    };

    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";
    const status  = message === "Service not found." ? 404 : 500;
    res.status(status).json({ success: false, message } satisfies ApiResponse);
  }
}

/**
 * DELETE /api/admin/services/:id
 */
export async function deleteServiceHandler(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params["id"] ?? "");
    await deleteService(id);

    const body: ApiResponse = {
      success: true,
      message: "Service deleted successfully.",
    };

    res.status(200).json(body);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error.";

    let status = 500;
    if (message === "Service not found.") status = 404;
    if (message.startsWith("Cannot delete")) status = 409; // Conflict

    res.status(status).json({ success: false, message } satisfies ApiResponse);
  }
}
