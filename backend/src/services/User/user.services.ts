import prisma from "../../config/db";
import { UpdateUserDTO, AddSkillDTO, RemoveSkillDTO, UpdateAvatarDTO } from "./DTO";

export const getUserById = async (id: string) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            bio: true,
            city: true,
            madhab: true,
            halalCareerPreference: true,
            avatar: true,
            skills: {
                include: { skill: true },
            },
        },
    });
};

export const updateUser = async (id: string, data: UpdateUserDTO) => {
    return prisma.user.update({
        where: { id },
        data, // already typed correctly
        select: { id: true, bio: true, city: true, madhab: true, halalCareerPreference: true },
    });
};

export const addSkill = async ({ userId, skillName }: AddSkillDTO) => {
    let skill = await prisma.skill.findUnique({ where: { name: skillName } });
    if (!skill) {
        skill = await prisma.skill.create({ data: { name: skillName } });
    }

    return prisma.userSkill.create({
        data: { userId, skillId: skill.id },
        include: { skill: true },
    });
};

export const removeSkill = async ({ userId, skillId }: RemoveSkillDTO) => {
    return prisma.userSkill.deleteMany({
        where: { userId, skillId },
    });
};

export const updateAvatar = async ({ userId, avatarUrl }: UpdateAvatarDTO) => {
    return prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarUrl },
        select: { id: true, avatar: true },
    });
};
