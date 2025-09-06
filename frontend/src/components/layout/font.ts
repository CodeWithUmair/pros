// app/fonts.ts
import { Geist, Onest } from 'next/font/google';

export const onest = Onest({ variable: "--font-onest", subsets: ["latin"] });
export const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });