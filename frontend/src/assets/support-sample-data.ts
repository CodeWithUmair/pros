// utils/support-sample.ts
import type { SupportTableType } from "@/types/user.types"; // adjust path if needed

/** helpers */
const firstNames = ["Ava", "Noah", "Mia", "Liam", "Olivia", "Ethan", "Zoe", "James", "Sophia", "Lucas"];
const lastNames = ["Khan", "Ali", "Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Taylor"];

const ticketStatuses = ["Pending", "Solved", "In Progress"] as const;
const priorities = ["High", "Medium", "Low"] as const;

const assignees = ["Alex Kim", "Priya Singh", "Marco Rossi", "Sara Ahmed", "Yuki Tanaka", "Chen Wei", "Maria Garcia"];

const descriptions = [
    "Unable to log in with 2FA enabled",
    "Payment failed but funds deducted",
    "KYC verification pending for over 48h",
    "App crashes on launch (iOS 17)",
    "Feature request: export transactions",
    "Cannot reset password via email link",
    "Withdrawal delayed beyond SLA",
    "Incorrect balance shown after trade",
];

const rnd = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const pick = <T,>(arr: readonly T[]) => arr[rnd(0, arr.length - 1)];

const randomDate = (start: Date, end: Date) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

/** main generator */
export const generateSupportData = (count: number): SupportTableType[] =>
    Array.from({ length: count }, (_, i) => {
        const f = pick(firstNames);
        const l = pick(lastNames);
        const d = randomDate(new Date(2024, 0, 1), new Date());

        // username: readable full name; change to handles if you prefer
        const username = `${f} ${l}`;
        const email = `${f}.${l}${i}@example.com`.toLowerCase();

        // type it from SupportTableType so it matches your LineItem2 shape
        const last_activity: SupportTableType["last_activity"] = {
            label: d.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }),
            value: d.toISOString(),
        };

        return {
            username,
            email,
            status: pick(ticketStatuses),
            priority: pick(priorities),
            last_activity,
            description: pick(descriptions),
            Assignee: pick(assignees),
        } satisfies SupportTableType;
    });
