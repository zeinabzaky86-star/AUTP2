import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { AuTPHomepage } from '@/components/AuTPHomepage';
import About from "@/components/About";
import ServicesOverview from "@/components/ServicesOverview";
import Footer from "@/components/Footer";
import FloatingLogo from "@/components/FloatingLogo";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <FloatingLogo />
      <Hero />
      <AuTPHomepage />
      <About />
      <ServicesOverview />
      <Footer />
    </div>
  );
};

export default Index;
