import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket, Microscope, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import heroImage from "@/assets/hero-autp-pharos-modern.jpg";

const Hero = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Brand-Aligned Overlays - Performance optimized with explicit dimensions */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          aspectRatio: '16/9'
        }}
      >
        <img
          src={heroImage}
          alt=""
          className="w-full h-full object-cover opacity-0"
          width="1920"
          height="1080"
          loading="eager"
          fetchPriority="high"
          aria-hidden="true"
        />
      </div>
      {/* Smooth diagonal gradient from light top-left to dark bottom-right - subtle for clarity */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-sky-50/25 via-30% via-transparent via-60% to-black/35" />

      {/* Removed lighthouse beam animation to fix bottom left artifact */}

      {/* Hero Content */}
      <div className="container mx-auto px-4 sm:px-6 text-center text-white relative z-10">
        <div className="max-w-4xl mx-auto animate-fade-in -translate-y-6 md:-translate-y-10">
          {/* Main Headline */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 -mt-3 md:-mt-4 leading-tight text-white drop-shadow-lg [text-shadow:_2px_2px_8px_rgb(0_0_0_/_70%),_0_0_20px_rgb(0_0_0_/_40%)]">
            {t('hero.title')}
          </h1>
          
          {/* Subheadline */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white max-w-3xl mx-auto leading-relaxed drop-shadow-md [text-shadow:_1px_1px_6px_rgb(0_0_0_/_60%),_0_0_15px_rgb(0_0_0_/_35%)]">
            {t('hero.subtitle')}
          </p>

          {/* Feature Chips */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-8 md:mb-12 text-white" role="list" aria-label="Technology Park Services">
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/30 shadow-lg" role="listitem">
              <Rocket className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300" aria-hidden="true" />
              <span className="text-sm sm:text-base font-medium">{t('hero.incubation')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/30 shadow-lg" role="listitem">
              <Microscope className="h-4 w-4 sm:h-5 sm:w-5 text-teal-300" aria-hidden="true" />
              <span className="text-sm sm:text-base font-medium">{t('hero.prototyping')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/30 shadow-lg" role="listitem">
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-300" aria-hidden="true" />
              <span className="text-sm sm:text-base font-medium">{t('hero.techTransfer')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/30 shadow-lg" role="listitem">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" aria-hidden="true" />
              <span className="text-sm sm:text-base font-medium">{t('hero.partnerships')}</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
            <Button 
              size="lg" 
              className="bg-[#C9A227] text-black hover:bg-[#C9A227]/90 text-lg px-8 py-6 font-semibold"
              onClick={() => navigate('/apply')}
              aria-label={t('hero.cta')}
            >
              {t('hero.cta')}
              <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;