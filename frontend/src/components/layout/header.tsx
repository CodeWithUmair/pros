"use client";

import React, { useEffect, useState } from "react";
import { ModeToggle } from "./theme-toggle";
import { Card } from "../ui/card";
import { MobileMenu } from "./mobile-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Image from "next/image";
import { CircleUserRound, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { userNavItems } from "@/assets/nav-data";

export default function Header({ headerLift }: { headerLift?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessExpiry");
    localStorage.removeItem("refreshExpiry");

    window.location.reload();
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 40) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <Card className={`z-20 max-w-full bg-transparent sticky top-0 transition-transform duration-500 ease-in-out ${showHeader ? 'translate-y-0' : '-translate-y-[120%]'} ${headerLift && '-mb-[141px] 2xl:-mb-[157px] px-5 lg:px-10 xl:px-6'}`}>
        <header
          className={`rounded-full z-[100] shadow-md mx-auto min-w-60 backdrop-blur-md bg-white border border-white/30 flex w-full items-center justify-between py-4 max-w-full 3xl:max-w-screen-3xl transition-all duration-300 px-5 lg:px-10 xl:px-10 2xl:px-6`}
        >
          <Link href="/" className="w-2/8">
            <Image
              src="/images/logo.svg"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden xl:flex items-center justify-center space-x-8 w-4/8">
            {userNavItems.map((item) => (
              <Link key={item.name} href={item.href} passHref>
                <p
                  className={`text-grey6 text-base 3xl:text-lg um-transition font-medium hover:text-primary ${pathname === item.href ? "text-primaryOnly" : "hover:text-primaryOnly"
                    }`}
                >
                  {item.name}
                </p>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 w-2/8 justify-end">
            <ModeToggle className="block xl:hidden" />

            {/* Theme toggle */}
            <ModeToggle className="hidden xl:block" />

            <Button
              variant="primaryOutline"
              // size="icon"
              className="xl:hidden"
              onClick={toggleMobileMenu}
            >
              <Menu />
            </Button>

            {false ? (
              <></>
            ) : true ? (
              <>
                <DropdownMenu  >
                  <DropdownMenuTrigger asChild>
                    <Button variant="primaryOutline">
                      <CircleUserRound />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="space-y-2" >
                    <DropdownMenuItem
                      onClick={() => setIsProfileModalOpen(true)}
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                    >
                      <Button
                        variant="destructive"
                        onClick={handleLogout}
                        className="w-full justify-start"
                      >
                        Logout
                      </Button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href={"/auth/login"} passHref>
                  <Button variant="primaryOutline">Sign In</Button>
                </Link>
                <Link href={"/auth/signup"} passHref className="hidden sm:block">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </header>
      </Card>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={toggleMobileMenu} />
    </>
  );
}
