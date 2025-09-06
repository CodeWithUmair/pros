// utils/users-sample.ts
import type { UsersTableType } from "@/types/user.types";

/** helpers */
const firstNames = ["Ava", "Noah", "Mia", "Liam", "Olivia", "Ethan", "Zoe", "James", "Sophia", "Lucas"];
const lastNames = ["Khan", "Ali", "Smith", "Johnson", "Williams", "Brown", "Davis", "Miller", "Wilson", "Taylor"];
const statuses = ["Active", "Inactive", "Pending"] as const;

const rnd = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const randomDate = (start: Date, end: Date) =>
    new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const money = (min: number, max: number) =>
    // Example returns "$1,234.56". Change to "250 USDC" if you prefer that style.
    `$${(Math.random() * (max - min) + min)
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const compact = (n: number) => {
    const abs = Math.abs(n);
    const s =
        abs >= 1e12 ? (abs / 1e12).toFixed(1) + "T" :
            abs >= 1e9 ? (abs / 1e9).toFixed(1) + "B" :
                abs >= 1e6 ? (abs / 1e6).toFixed(1) + "M" :
                    abs >= 1e3 ? (abs / 1e3).toFixed(1) + "K" :
                        String(abs);
    return s.replace(/\.0(?=[KMBT]$)/, "");
};

/** main generator */
export const generateUsersData = (count: number): UsersTableType[] =>
    Array.from({ length: count }, (_, i) => {
        const f = firstNames[rnd(0, firstNames.length - 1)];
        const l = lastNames[rnd(0, lastNames.length - 1)];
        const d = randomDate(new Date(2024, 0, 1), new Date());
        const email = `${f}.${l}${i}@example.com`.toLowerCase();

        // Type this using the property type from UsersTableType
        const signup_date: UsersTableType["signup_date"] = {
            // tweak locale/format to your needs
            label: d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            value: d.toISOString(),
        };

        return {
            name: `${f} ${l}`,
            email,
            status: statuses[rnd(0, statuses.length - 1)] as UsersTableType["status"],
            signup_date,
            total_balance: money(200, 5000),                 // e.g. "$3,421.56"
            total_transaction: compact(rnd(50, 120000)),     // e.g. "2.6K" | "89.3K"
        } satisfies UsersTableType;
    });
