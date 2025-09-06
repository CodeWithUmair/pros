"use client"

import { userNavItems } from "@/assets/nav-data";
import Container from "../layout/container";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
    const pathname = usePathname();
    const year = new Date().getFullYear();

    return (
        <footer className="py-12 xl:py-16 3xl:py-20 bg-black text-white">
            <Container>
                <div className="space-y-10">
                    <div className="flex items-center gap-4 justify-center">
                        {userNavItems.map((item) => (
                            <Link key={item.name} href={item.href} passHref>
                                <p
                                    className={`text-white text-base 3xl:text-lg um-transition hover:text-primary ${pathname === item.href ? "text-primaryOnly" : ""
                                        }`}
                                >
                                    {item.name}
                                </p>
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p>© {year} Stable Pal. All rights reserved.</p>
                        <Link href={'https://www.decryptedlabs.io/'} target="_blank">
                            Built with ❤️ by Decrypted Labs
                        </Link>
                    </div>
                </div>
            </Container >
        </footer>
    )
}
