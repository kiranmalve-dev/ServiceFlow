import { Router } from "express";
import { login, logout } from "../controllers/authController.js";
import { validateLoginBody } from "../validators/authValidator.js";

const router = Router();

router.post("/login", validateLoginBody, login);
router.post("/logout", logout);

export { router as authRouter };
