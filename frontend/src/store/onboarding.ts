// stores/onboarding.ts
import { create } from "zustand"

interface OnboardingState {
    step: number
    form: {
        name: string
        city: string
        bio: string
        skills: string[]
        halalCareerPreference: boolean
        madhab: string
    }
    setStep: (step: number) => void
    updateForm: (updates: Partial<OnboardingState["form"]>) => void
    resetForm: () => void
}

export const useOnboarding = create<OnboardingState>((set) => ({
    step: 0,
    form: {
        name: "",
        city: "",
        bio: "",
        skills: [],
        halalCareerPreference: false,
        madhab: "",
    },
    setStep: (step) => set({ step }),
    updateForm: (updates) =>
        set((state) => ({ form: { ...state.form, ...updates } })),
    resetForm: () =>
        set({
            step: 0,
            form: {
                name: "",
                city: "",
                bio: "",
                skills: [],
                halalCareerPreference: false,
                madhab: "",
            },
        }),
}))
