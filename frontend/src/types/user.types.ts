// --- Types ---

export type AppViewType = "LOADING" | "VALIDATE" | "AUTH_VIEW";

// types/user.ts
export interface User {
  connectionStatus: string;
  id: string
  email: string
  name: string
  bio: string | null
  city: string | null
  madhab: string | null
  halalCareerPreference: boolean
  avatar: string | null
  skills: { skill: { id: string; name: string } }[]
  pendingConnectionId: string
}
