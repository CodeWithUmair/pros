import React from "react";
import Section from "../layout/section-box";
import Container from "../layout/container";
import { Heading } from "../layout/heading";
import Image from "next/image";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import FadeContent from "@/animations/fade-content";
import AnimatedContent from "@/animations/animated-content";

/** Reusable bits */
const Img = ({
    src,
    className,
    alt = "card",
}: {
    src: string;
    className: string;
    alt?: string;
}) => (
    <Image
        src={src}
        alt={alt}
        width={500}
        height={500}
        priority
        quality={100}
        className={className}
    />
);

const TitleBlock = ({
    title,
    subtitle,
    subtitleClass = "font-light text-xl",
}: {
    title: string;
    subtitle: string;
    subtitleClass?: string;
}) => (
    <>
        <Heading title={title} variant="h4" className=" font-medium" />
        <Heading title={subtitle} variant="h5" className={subtitleClass} />
    </>
);

/** Row card: text left, image right */
const RowFeature = ({
    wrapperClass,
    title,
    subtitle,
    imgSrc,
    imgClass = "w-full md:h-48 object-contain",
    textRightPadding = "md:mr-20",
}: {
    wrapperClass: string;
    title: string;
    subtitle: string;
    imgSrc: string;
    imgClass?: string;
    textRightPadding?: string;
}) => (
    <div
        className={`py-4 px-6 border bg-bg2 rounded-xl w-full flex flex-col-reverse md:flex-row items-center justify-between ${wrapperClass}`}
    >
        <div className="md:w-1/2 text-center md:text-start">
            <Heading title={title} variant="h4" className=" font-medium" />
            <Heading
                title={subtitle}
                variant="h5"
                className={`font-light text-xl ${textRightPadding}`}
            />
        </div>
        <div className="md:w-1/2 flex items-center justify-center">
            <Img src={imgSrc} className={imgClass} />
        </div>
    </div>
);

/** Column card: image top, text bottom */
const ColFeature = ({
    wrapperClass,
    imgSrc,
    imgClass,
    title,
    subtitle,
    innerPad = "",
}: {
    wrapperClass: string;
    imgSrc: string;
    imgClass: string;
    title: string;
    subtitle: string;
    innerPad?: string;
}) => (
    <div
        className={`py-4 px-6 border bg-bg2 rounded-xl w-full flex flex-col gap-4 xl:gap-0 items-center justify-between ${wrapperClass}`}
    >
        <div className="w-full flex items-center justify-center">
            <Img src={imgSrc} className={` ${imgClass}`} />
        </div>
        <div className={`w-full text-center xl:text-start ${innerPad}`}>
            <TitleBlock title={title} subtitle={subtitle} />
        </div>
    </div>
);

function BentoGrid() {
    return (
        <Section className="py-16 xl:py-28 3xl:py-36 bg-background">
            <Container className="flex flex-col items-center justify-center gap-10 w-full 3xl:gap-20">
                {/* Hero copy */}
                <div className="flex flex-col items-center justify-center gap-2 sm:gap-4">
                    <FadeContent blur={true} delay={100} easing="ease-out" >
                        <Heading title="Forget reminders." className="font-light" />
                    </FadeContent>
                    <FadeContent blur={true} delay={400} easing="ease-out" >
                        <Heading title="Ditch spreadsheets." className="font-light" />
                    </FadeContent>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <FadeContent blur={true} delay={800} easing="ease-out" >
                            <Heading title="With Stable Pal," className="font-light" />
                        </FadeContent>
                        <FadeContent blur={true} delay={1200} easing="ease-out" >
                            <Heading title=" payments just happen." />
                        </FadeContent>
                    </div>
                    <Heading
                        title="Stable Pal automates everything — no follow-ups, no forgotten payments."
                        variant="h4"
                        className="text-grey6 font-light mt-5 text-center"
                    />
                </div>

                <div className="space-y-6">
                    {/* Grid 1 */}
                    <div className="grid xl:grid-cols-10 xl:grid-rows-4 gap-4 3xl:gap-6 w-full">

                        <AnimatedContent
                            distance={150}
                            direction="vertical"
                            reverse={false}
                            duration={1.2}
                            initialOpacity={0.2}
                            animateOpacity
                            scale={1.1}
                            threshold={0.2}
                            delay={0.3}
                            className='xl:col-span-6 xl:row-span-2'
                        >
                            <RowFeature
                                wrapperClass="xl:col-span-6 xl:row-span-2"
                                title="Automated Recurring Payments"
                                subtitle="Set your payment schedule once—Stable Pal handles the rest."
                                imgSrc="/images/card-1.svg"
                            />
                        </AnimatedContent>
                        <AnimatedContent
                            distance={150}
                            direction="vertical"
                            reverse={false}
                            duration={1.2}
                            initialOpacity={0.2}
                            animateOpacity
                            scale={1.1}
                            threshold={0.2}
                            delay={0.3}
                            className='xl:col-span-6 xl:row-span-2 xl:col-start-1 xl:row-start-3'
                        >
                            <RowFeature
                                wrapperClass="xl:col-span-6 xl:row-span-2 xl:col-start-1 xl:row-start-3"
                                title="No Gas Fees for Users"
                                subtitle="Gasless experience powered by relayers—no wallet friction."
                                imgSrc="/images/card-2.svg"
                            />
                        </AnimatedContent>

                        <FadeContent blur={true} once delay={1000} easing="ease-out"
                            className="xl:col-span-4 xl:row-span-4 xl:col-start-7 xl:row-start-1 h-full"
                        >
                            <ColFeature
                                wrapperClass="h-full"
                                imgSrc="/images/card-3.svg"
                                imgClass="w-full md:h-72 xl:h-80 object-contain"
                                title="Smart Invoicing"
                                subtitle="Send professional invoices with tracking, CC/BCC, and reminders."
                                innerPad="3xl:px-8"
                            />
                        </FadeContent>


                    </div>

                    {/* Grid 2 */}
                    <div className="grid grid-cols-1 xl:grid-cols-6 xl:grid-rows-4 gap-4 3xl:gap-6 w-full">

                        <FadeContent blur={true} delay={1200} easing="ease-out" once
                            className="xl:col-span-2 xl:row-span-4"
                        >
                            <ColFeature
                                wrapperClass="h-full"
                                imgSrc="/images/card-4.svg"
                                imgClass="w-full md:h-72 object-contain"
                                title="Global Payouts in Stablecoins"
                                subtitle="Send and receive stablecoins anywhere in seconds."
                                innerPad="3xl:px-8"
                            />
                        </FadeContent>

                        <FadeContent blur={true} delay={1500} easing="ease-out" once
                            className="xl:col-span-2 xl:row-span-4 xl:col-start-3"
                        >
                            <ColFeature
                                wrapperClass="h-full"
                                imgSrc="/images/card-5.svg"
                                imgClass="w-full md:h-64 object-contain"
                                title="Fast, Secure, and Built on Solana"
                                subtitle="Enjoy blazing-fast transactions with enterprise-grade security."
                                innerPad="3xl:px-8"
                            />
                        </FadeContent>

                        <div className="xl:col-span-2 xl:row-span-4 xl:col-start-5 flex flex-col items-center justify-between gap-6">


                            <FadeContent blur={true} delay={1000} easing="ease-out" once
                            >
                                <div className="flex flex-col items-center justify-between gap-4 w-full py-4 px-6 border bg-bg2 rounded-xl">
                                    <div className="w-full flex items-center justify-center">
                                        <Img
                                            src="/images/card-6.svg"
                                            className="w-full md:h-28 object-contain"
                                        />
                                    </div>
                                    <div className="w-full text-center xl:text-start">
                                        <TitleBlock
                                            title="Smart Invoicing"
                                            subtitle="Send professional invoices with tracking, CC/BCC, and reminders."
                                        />
                                    </div>
                                </div>
                            </FadeContent>

                            <Link
                                href="/auth/login"
                                className="text-white group bg-primaryOnly w-full flex items-end p-4 gap-4 h-40 xl:h-full rounded-xl text-xl 3xl:text-2xl"
                            >
                                <span>Create an account today</span>
                                <MoveRight className="w-8 h-8 group-hover:translate-x-1.5 transition-all ease-in-out" />
                            </Link>
                        </div>
                    </div>
                </div>
            </Container>
        </Section>
    );
}

export default BentoGrid;
