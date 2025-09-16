"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useUser } from "@/providers/user-provider";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/store/onboarding";

const steps = ["Basic Info", "Skills", "Preferences", "Finish"];

export default function OnboardingPage() {
    const { step, setStep, form, updateForm, resetForm } = useOnboarding();
    const { user } = useUser();

    // local input for skills (so we can type properly)
    const [skillInput, setSkillInput] = useState("");

    const handleNext = () => setStep(Math.min(step + 1, steps.length - 1));
    const handleBack = () => setStep(Math.max(step - 1, 0));

    const handleSubmit = async () => {
        try {
            await api.patch("/user/me", {
                name: form.name,
                city: form.city,
                bio: form.bio,
                halalCareerPreference: form.halalCareerPreference,
                madhab: form.madhab,
            });

            for (const skill of form.skills) {
                await api.post("/user/me/skills", { skill });
            }

            resetForm();
            window.location.href = "/";
        } catch (err) {
            console.error("Error saving onboarding:", err);
        }
    };

    // Prefill form with current user
    useEffect(() => {
        if (user) {
            updateForm({
                name: user.name ?? "",
                city: user.city ?? "",
                bio: user.bio ?? "",
                skills: user.skills?.map((s: any) => s.skill.name) ?? [],
                halalCareerPreference: !!user.halalCareerPreference,
                madhab: user.madhab ?? "",
            });
        }
    }, [user, updateForm]);

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle>{steps[step]}</CardTitle>
            </CardHeader>
            <CardContent>
                {step === 0 && (
                    <div className="space-y-4">
                        <Input
                            placeholder="Your Name"
                            value={form.name}
                            onChange={(e) => updateForm({ name: e.target.value })}
                        />
                        <Input
                            placeholder="City"
                            value={form.city}
                            onChange={(e) => updateForm({ city: e.target.value })}
                        />
                        <Textarea
                            placeholder="Short bio"
                            value={form.bio}
                            onChange={(e) => updateForm({ bio: e.target.value })}
                        />
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <p className="mb-2 text-sm text-muted-foreground">Add your skills</p>
                        <Input
                            placeholder="Type a skill and press Enter"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    const value = skillInput.trim();
                                    if (value && !form.skills.includes(value)) {
                                        updateForm({ skills: [...form.skills, value] });
                                        setSkillInput("");
                                    }
                                }
                            }}
                        />

                        <div className="mt-4 flex flex-wrap gap-2">
                            {form.skills.map((s) => (
                                <Badge key={s} >
                                    {s}
                                    <button
                                        className="ml-1 text-xs"
                                        onClick={() =>
                                            updateForm({
                                                skills: form.skills.filter((x) => x !== s),
                                            })
                                        }
                                    >
                                        ✕
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.halalCareerPreference}
                                onChange={(e) =>
                                    updateForm({ halalCareerPreference: e.target.checked })
                                }
                            />
                            Prefer halal career opportunities
                        </label>
                        <Input
                            placeholder="Your Madhab (e.g. Hanafi)"
                            value={form.madhab}
                            onChange={(e) => updateForm({ madhab: e.target.value })}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="flex items-center flex-col space-y-4">
                        <p>All set 🎉</p>
                        <Button onClick={handleSubmit}>Finish & Go to Feed</Button>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end gap-4">
                {step > 0 && step < steps.length - 1 && (
                    <Button variant="outline" onClick={handleBack}>
                        Back
                    </Button>
                )}
                {step < steps.length - 1 && <Button onClick={handleNext}>Next</Button>}
            </CardFooter>
        </Card>
    );
}
