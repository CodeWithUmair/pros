// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Onest } from "next/font/google";
import NextTopLoader from 'nextjs-toploader';
import { ClientProviders } from "@/providers/client-providers";
import { Toaster } from 'react-hot-toast';
import ErrorBoundaryWrapper from "@/components/layout/ErrorBoundaryWrapper";
import { geist } from "@/components/layout/font";
import { UserProvider } from "@/context/user-context";

const onest = Onest({ variable: "--font-onest", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Stable Pal",
  description: "Stable Pal: Effortless, gasless payments on Solana—Seamlessly bridging Web2 simplicity with Web3 power, offering recurring transactions and on/off ramp features for modern businesses.",
};

export default async function RootLayout({ children }: { children: React.ReactElement }) {
  // grab theme cookie (if any)
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value;

  return (
    // optional: suppress warnings on root to silence any tiny mismatch
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${onest.variable} ${geist.variable} ${onest.className} antialiased`}
        suppressHydrationWarning
      >
        <NextTopLoader
          height={5}
          color="#055BF0"
          showSpinner={false} />
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
        <ClientProviders forcedTheme={theme}>
          <UserProvider>
            <ErrorBoundaryWrapper>
              <main className="min-h-screen w-full h-full bg-bg font-geist">
                {children}
              </main>
            </ErrorBoundaryWrapper>
          </UserProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
