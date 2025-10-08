"use client";

import React from "react";
import Image from "next/image";
import { LogOut, Settings } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/user/useUser";
import { ModeToggle } from "./theme-toggle";
import { useLogout } from "@/hooks/useAuth";
import { Button } from "../ui/button";
import Link from "next/link";

export function AppHeader() {
    const { data: user } = useCurrentUser();
    const { mutate: logout, isPending: isLoggingOut } = useLogout();

    if (!user) return null;

    const truncatedName = user.name.length > 20 ? user.name.slice(0, 17) + "..." : user.name;

    return (
        <header className="fixed z-50 top-0 left-0 right-0 w-full flex items-center justify-between px-4 py-2 border-b border-muted-foreground bg-background">
            {/* Logo */}
            <Link href={'/d/feed'} className="flex items-center gap-2">
                <Image src="/images/logo.svg" alt="Logo" width={40} height={40} />
            </Link>

            {/* User info */}
            <Link href={'/d/profile'} className="hidden sm:flex items-center gap-2">
                <Avatar className="w-8 h-8">
                    {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                    )}
                </Avatar>
                <span className="font-medium truncate max-w-[120px]">{truncatedName}</span>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                {/* Desktop dropdown */}
                <div className="hidden sm:block">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Settings className="w-6 h-6 cursor-pointer" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <ModeToggle />
                            <DropdownMenuItem asChild disabled={isLoggingOut} variant="ghost">
                                <Button onClick={() => logout()} variant="ghost" className="w-full rounded-md justify-start">
                                    <LogOut className="w-4 h-4" /> Logout
                                </Button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile sheet */}
                <div className="sm:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Settings className="w-6 h-6 cursor-pointer" />
                        </SheetTrigger>
                        <SheetContent side="right" className="p-4">
                            <SheetHeader>
                                <h3 className="text-lg font-semibold">Settings</h3>
                            </SheetHeader>
                            <div className="flex flex-col gap-2 mt-4">
                                <ModeToggle />
                                <button
                                    onClick={() => console.log("Logout")}
                                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
                                >
                                    <LogOut className="w-4 h-4" /> Logout
                                </button>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
