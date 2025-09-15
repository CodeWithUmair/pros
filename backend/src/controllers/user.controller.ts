import { Response, NextFunction } from "express";
import * as userService from "../services/User/user.services";
import { AuthenticatedRequest } from "../types/express";
import { UpdateUserDTO, AddSkillDTO, RemoveSkillDTO, UpdateAvatarDTO } from "../services/User/DTO";

// GET /users/me
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.user!.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me
export const updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto: UpdateUserDTO = req.body;
    const user = await userService.updateUser(req.user!.id, dto);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// POST /users/me/skills
export const addSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto: AddSkillDTO = { userId: req.user!.id, skillName: req.body.skill };
    const skill = await userService.addSkill(dto);
    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
};

// DELETE /users/me/skills/:skillId
export const removeSkill = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto: RemoveSkillDTO = { userId: req.user!.id, skillId: req.params.skillId };
    await userService.removeSkill(dto);
    res.json({ message: "Skill removed" });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me/avatar
export const updateAvatar = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const dto: UpdateAvatarDTO = { userId: req.user!.id, avatarUrl: req.body.avatarUrl };
    const user = await userService.updateAvatar(dto);
    res.json(user);
  } catch (err) {
    next(err);
  }
};
