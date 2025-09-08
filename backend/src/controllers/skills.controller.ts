import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../types/express";

// Create skill
export const createSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        const skill = await prisma.skill.create({ data: { name } });
        res.status(201).json(skill);
    } catch (err) {
        next(err);
    }
};

// List all skills
export const getSkills = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const skills = await prisma.skill.findMany();
        res.json(skills);
    } catch (err) {
        next(err);
    }
};

// Assign skill to logged-in user
export const addSkillToMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { skillId } = req.body;
        const userId = req.user!.id;

        const existing = await prisma.userSkill.findFirst({
            where: { userId, skillId },
        });
        if (existing) {
            res.status(400).json({ message: "Skill already added" });
            return;
        }

        const userSkill = await prisma.userSkill.create({
            data: { userId, skillId },
            include: { skill: true },
        });

        res.status(201).json(userSkill);
    } catch (err) {
        next(err);
    }
};

// Get my skills
export const getMySkills = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;
        const skills = await prisma.userSkill.findMany({
            where: { userId },
            include: { skill: true },
        });
        res.json(skills.map((us) => us.skill));
    } catch (err) {
        next(err);
    }
};
