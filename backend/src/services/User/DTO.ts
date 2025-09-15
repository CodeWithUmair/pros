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
