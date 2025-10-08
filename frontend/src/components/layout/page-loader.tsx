import Image from "next/image"

const PageLoader = () => {
    return (
        <div className="z-[1000] flex min-h-screen w-full items-center justify-center bg-background">
            <Image
                src={'/images/logo.svg'}
                alt="Logo"
                width={150}
                height={150}
                quality={100}
                className="animate-pulse"
            />
        </div>
    )
}

export default PageLoader