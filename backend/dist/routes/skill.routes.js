"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const skills_controller_1 = require("../controllers/skills.controller");
const auth_middleware_1 = require("../middlewares/auth-middleware");
const router = express_1.default.Router();
router.post("/", auth_middleware_1.protect, skills_controller_1.createSkill); // admin maybe later
router.get("/", skills_controller_1.getSkills);
router.post("/me", auth_middleware_1.protect, skills_controller_1.addSkillToMe);
router.get("/me", auth_middleware_1.protect, skills_controller_1.getMySkills);
exports.default = router;
