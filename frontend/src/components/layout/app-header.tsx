"use client";

import React from "react";
import Image from "next/image";
import { Cog, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetClose } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";
import { ModeToggle } from "./theme-toggle";

export function AppHeader() {
    const { data: user } = useCurrentUser();

    if (!user) return null;

    const truncatedName = user.name.length > 20 ? user.name.slice(0, 17) + "..." : user.name;

    return (
        <header className="w-full flex items-center justify-between px-4 py-2 border-b border-muted-foreground bg-background">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Logo" width={40} height={40} />
            </div>

            {/* User info */}
            <div className="hidden sm:flex items-center gap-2">
                <Avatar className="w-8 h-8">
                    {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                    )}
                </Avatar>
                <span className="font-medium truncate max-w-[120px]">{truncatedName}</span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
                {/* Desktop dropdown */}
                <div className="hidden sm:block">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Cog className="w-6 h-6 cursor-pointer" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <ModeToggle />
                            <DropdownMenuItem onClick={() => console.log("Logout")}>
                                <LogOut className="w-4 h-4 mr-2" /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Mobile sheet */}
                <div className="sm:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Cog className="w-6 h-6 cursor-pointer" />
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
