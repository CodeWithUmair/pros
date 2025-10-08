import { User } from "@prisma/client";

// src/services/User/DTO.ts
export interface UpdateUserDTO {
  bio?: string;
  city?: string;
  madhab?: string;
  halalCareerPreference?: boolean;
}

export interface AddSkillDTO {
  userId: string;
  skillName: string;
}

export interface RemoveSkillDTO {
  userId: string;
  skillId: string;
}

export interface UpdateAvatarDTO {
  userId: string;
  avatarUrl: string;
}

export type UserResponse = {
  id: string;
  name: string;
  email: string;
  bio?: string;
  city?: string;
  madhab?: string;
  halalCareerPreference?: boolean;
  avatar?: string;
  skills: { id: string; skill: { id: string; name: string } }[];
  connectionStatus?: "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" | "REJECTED";
  pendingConnectionId: string
};
