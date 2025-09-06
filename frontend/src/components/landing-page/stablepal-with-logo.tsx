import Image from "next/image"
import Container from "../layout/container"
import Section from "../layout/section-box"

export default function StablePalWithLogo() {
    return (
        <Section className="py-10 sm:py-14 3xl:py-16 bg-primary dark:bg-primary/10 text-background">
            <Container>
                <div className="flex items-center justify-center gap-4 md:gap-10">
                    <Image src={'/images/logo-gradient.png'} alt="Logo Gradient" width={500} height={500} className="object-contain w-20 h-20 sm:w-48 sm:h-48 3xl:w-80 3xl:h-80" />
                    <p className="text-[10vw] 3xl:text-[13vw] text-nowrap bg-gradient-to-t from-white/80 to-white/50 inline-block text-transparent bg-clip-text">Stable Pal</p>
                </div>
            </Container>
        </Section>
    )
}
