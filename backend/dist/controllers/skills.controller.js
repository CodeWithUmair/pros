"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySkills = exports.addSkillToMe = exports.getSkills = exports.createSkill = void 0;
const db_1 = __importDefault(require("../config/db"));
// Create skill
const createSkill = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.body;
        const skill = yield db_1.default.skill.create({ data: { name } });
        res.status(201).json(skill);
    }
    catch (err) {
        next(err);
    }
});
exports.createSkill = createSkill;
// List all skills
const getSkills = (_req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const skills = yield db_1.default.skill.findMany();
        res.json(skills);
    }
    catch (err) {
        next(err);
    }
});
exports.getSkills = getSkills;
// Assign skill to logged-in user
const addSkillToMe = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { skillId } = req.body;
        const userId = req.user.id;
        const existing = yield db_1.default.userSkill.findFirst({
            where: { userId, skillId },
        });
        if (existing) {
            res.status(400).json({ message: "Skill already added" });
            return;
        }
        const userSkill = yield db_1.default.userSkill.create({
            data: { userId, skillId },
            include: { skill: true },
        });
        res.status(201).json(userSkill);
    }
    catch (err) {
        next(err);
    }
});
exports.addSkillToMe = addSkillToMe;
// Get my skills
const getMySkills = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const skills = yield db_1.default.userSkill.findMany({
            where: { userId },
            include: { skill: true },
        });
        res.json(skills.map((us) => us.skill));
    }
    catch (err) {
        next(err);
    }
});
exports.getMySkills = getMySkills;
