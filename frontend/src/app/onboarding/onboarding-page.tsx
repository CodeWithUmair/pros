"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import CustomSelect from "@/components/ui/custom-select";
import { api } from "@/lib/api";
import { useUser } from "@/providers/user-provider";

const steps = ["Basic Info", "Skills", "Preferences", "Finish"];

export default function OnboardingPage() {
    const [step, setStep] = useState(0);
    const { user } = useUser();

    const [form, setForm] = useState({
        name: "",
        city: "",
        bio: "",
        skills: [] as string[],
        halalCareerPreference: false,
        madhab: "",
    });

    const handleNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
    const handleBack = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        try {
            await api.patch("/user/me", {
                name: form.name,
                city: form.city,
                bio: form.bio,
                halalCareerPreference: form.halalCareerPreference,
                madhab: form.madhab,
            });
            await api.post("/user/me/skills", { skills: form.skills });
            window.location.href = "/"; // redirect to feed
        } catch (err) {
            console.error("Error saving onboarding:", err);
        }
    };

    // update form once user is available
    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                name: user.name ?? "",
                city: user.city ?? "",
                bio: user.bio ?? "",
                skills: user.skills ?? [],
                halalCareerPreference: !!user.halalCareerPreference,
                madhab: user.madhab ?? "",
            }));
        }
    }, [user]);


    return (
        < >
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
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                            <Input
                                placeholder="City"
                                value={form.city}
                                onChange={(e) => setForm({ ...form, city: e.target.value })}
                            />
                            <Textarea
                                placeholder="Short bio"
                                value={form.bio}
                                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            />
                        </div>
                    )}

                    {step === 1 && (
                        <div>
                            <p className="mb-2 text-sm text-muted-foreground">Choose your skills</p>
                            <CustomSelect
                                data={[
                                    { id: "react", symbol: "React", image: "/icons/react.svg" },
                                    { id: "node", symbol: "Node.js", image: "/icons/node.svg" },
                                ]}
                                value=""
                                onChange={(val) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        skills: prev.skills.includes(val)
                                            ? prev.skills
                                            : [...prev.skills, val],
                                    }))
                                }
                            />
                            <div className="mt-4 flex flex-wrap gap-2">
                                {form.skills.map((s) => (
                                    <span
                                        key={s}
                                        className="bg-primaryOnly/10 text-primaryOnly px-3 py-1 rounded-full text-sm"
                                    >
                                        {s}
                                    </span>
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
                                        setForm({ ...form, halalCareerPreference: e.target.checked })
                                    }
                                />
                                Prefer halal career opportunities
                            </label>
                            <Input
                                placeholder="Your Madhab (e.g. Hanafi)"
                                value={form.madhab}
                                onChange={(e) => setForm({ ...form, madhab: e.target.value })}
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-4">
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
                    {step < steps.length - 1 && (
                        <Button onClick={handleNext}>Next</Button>
                    )}
                </CardFooter>
            </Card>
        </>
    );
}
