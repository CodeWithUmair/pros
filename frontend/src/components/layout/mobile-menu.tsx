import React from 'react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { userNavItems } from '@/assets/nav-data'

export const MobileMenu = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {

    const pathname = usePathname();

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetTrigger />
            <SheetContent side="left" className='px-4'>
                <SheetHeader>
                    <SheetTitle className="flex justify-between">
                        <Link href="/" passHref>
                            <Image src='/images/logo.svg' alt='Logo' width={50} height={50} className='object-contain' />
                        </Link>
                    </SheetTitle>
                </SheetHeader>

                {/* Mode toggle */}
                {/* <ModeToggle /> */}

                <div className="flex flex-col gap-1 space-y-2 mt-4">
                    {userNavItems.map((item) => (
                        <Link key={item.name} href={item.href} passHref>
                            <p
                                className={cn(
                                    "cursor-pointer p-2 um-transition rounded-md hover:bg-accent-foreground/50 hover:text-accent-foreground",
                                    pathname === item.href ? "bg-primaryOnly text-background " : "text-muted-foreground"
                                )}
                                onClick={onClose}
                            >
                                {item.name}
                            </p>
                        </Link>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    )
}
