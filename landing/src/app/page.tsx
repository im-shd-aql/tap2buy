import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import KillerStats from "@/components/KillerStats";
import StorePreview from "@/components/StorePreview";
import Problem from "@/components/Problem";
import HowItWorks from "@/components/HowItWorks";
import PricingCalculator from "@/components/PricingCalculator";
import Features from "@/components/Features";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <KillerStats />
        <StorePreview />
        <Problem />
        <HowItWorks />
        <PricingCalculator />
        <Features />
        <Pricing />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
