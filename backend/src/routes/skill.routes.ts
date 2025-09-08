import express from "express";
import { createSkill, getSkills, addSkillToMe, getMySkills } from "../../controllers/Skills/skillsController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/", protect, createSkill);   // admin maybe later
router.get("/", getSkills);
router.post("/me", protect, addSkillToMe);
router.get("/me", protect, getMySkills);

export default router;
