import React from 'react'
import Section from '../layout/section-box'
import Container from '../layout/container'
import Image from 'next/image'
import AnimatedContent from '@/animations/animated-content'

function FullSection() {

    return (
        <Section className='py-12 sm:py-16 xl:py-20 bg-background'>
            <Container className="flex flex-col items-center justify-center gap-10 w-full 3xl:gap-20">
                <AnimatedContent
                    distance={200}
                    direction="vertical"
                    reverse={false}
                    duration={1.2}
                    initialOpacity={0.2}
                    animateOpacity
                    scale={1.1}
                    threshold={0.2}
                    delay={0.2}
                >
                    <Image src={'/images/full-section.svg'} alt={'Full'} width={2000} height={2000} className='object-contain' />
                </AnimatedContent>
            </Container>
        </Section>
    )
}

export default FullSection