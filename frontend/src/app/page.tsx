import BentoGrid from "@/components/landing-page/BentoGrid";
import FAQ from "@/components/landing-page/Faq";
import Footer from "@/components/landing-page/footer";
import FullSection from "@/components/landing-page/FullSection";
import MakingCrypto from "@/components/landing-page/MakingCrypto";
import PaymentHero from "@/components/landing-page/payment-hero";
import StablePalWithLogo from "@/components/landing-page/stablepal-with-logo";
import WalletGrid from "@/components/landing-page/WalletGrid";
import Header from "@/components/layout/header";

export default function Page() {

  return (
    <>
      <Header headerLift />
      <PaymentHero />
      <MakingCrypto />
      <BentoGrid />
      <WalletGrid />
      <FullSection />
      <FAQ />
      <StablePalWithLogo />
      <Footer />
    </>
  );
}
