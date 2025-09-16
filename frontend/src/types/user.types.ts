// --- Types ---

export type AppViewType = "LOADING" | "VALIDATE" | "AUTH_VIEW";

// types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  city: string | null;
  madhab: string | null;
  halalCareerPreference: string | null;
  avatar: string | null;
  skills: string[];
}
