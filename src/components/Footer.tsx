import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  ExternalLink
} from "lucide-react";

const Footer = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSocialClick = (platform: string) => {
    const socialLinks: Record<string, string> = {
      Facebook: 'https://facebook.com/autp',
      Twitter: 'https://twitter.com/autp',
      LinkedIn: 'https://linkedin.com/company/autp',
      Instagram: 'https://instagram.com/autp'
    };
    window.open(socialLinks[platform], '_blank', 'noopener,noreferrer');
  };

  const handleVisitCampus = () => {
    window.open('https://maps.google.com/search/Alexandria+University+Technology+Park', '_blank', 'noopener,noreferrer');
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <img 
              src="/lovable-uploads/5966bba4-e469-42d5-b9d6-0ded9bbef795.png" 
              alt="Alexandria University Technology Park" 
              className="h-20 w-auto opacity-90"
              loading="lazy"
            />
            <p className="text-sm opacity-90 leading-relaxed">
              {t('footer.tagline')}
            </p>
            
            <div className="flex space-x-3 rtl:space-x-reverse">
              {[
                { name: 'Facebook', icon: Facebook },
                { name: 'Twitter', icon: Twitter },
                { name: 'LinkedIn', icon: Linkedin },
                { name: 'Instagram', icon: Instagram }
              ].map(({ name, icon: Icon }) => (
                <Button 
                  key={name}
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleSocialClick(name)}
                  className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                  aria-label={name}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t('footer.services')}</h4>
            <nav className="space-y-2" aria-label={t('footer.services')}>
              {['footer.service1', 'footer.service2', 'footer.service3', 'footer.service4', 'footer.service5'].map((key) => (
                <button 
                  key={key}
                  onClick={() => navigate('/services')}
                  className="block text-sm opacity-80 hover:opacity-100 transition-opacity text-left rtl:text-right"
                >
                  {t(key)}
                </button>
              ))}
            </nav>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t('footer.quickLinks')}</h4>
            <nav className="space-y-2" aria-label={t('footer.quickLinks')}>
              <button onClick={() => navigate('/')} className="block text-sm opacity-80 hover:opacity-100 transition-opacity text-left rtl:text-right">
                {t('footer.aboutUs')}
              </button>
              <button onClick={() => navigate('/tenant')} className="block text-sm opacity-80 hover:opacity-100 transition-opacity text-left rtl:text-right">
                {t('footer.tenantPortal')}
              </button>
              <button onClick={() => navigate('/news')} className="block text-sm opacity-80 hover:opacity-100 transition-opacity text-left rtl:text-right">
                {t('footer.eventsPrograms')}
              </button>
              <button onClick={() => navigate('/apply')} className="block text-sm opacity-80 hover:opacity-100 transition-opacity text-left rtl:text-right">
                {t('nav.apply')}
              </button>
              <button onClick={() => navigate('/application-status')} className="block text-sm opacity-80 hover:opacity-100 transition-opacity text-left rtl:text-right">
                {t('nav.checkStatus')}
              </button>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">{t('footer.contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <MapPin className="h-4 w-4 mt-0.5 opacity-80 flex-shrink-0" />
                <span className="text-sm opacity-90">{t('footer.address')}</span>
              </div>
              
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Phone className="h-4 w-4 opacity-80 flex-shrink-0" />
                <span className="text-sm opacity-90" dir="ltr">+20 3 XXX XXXX</span>
              </div>
              
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Mail className="h-4 w-4 opacity-80 flex-shrink-0" />
                <a href="mailto:info@autp.alexu.edu.eg" className="text-sm opacity-90 hover:opacity-100 transition-opacity" dir="ltr">
                  info@autp.alexu.edu.eg
                </a>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={handleVisitCampus}
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground hover:text-primary mt-4"
            >
              {t('footer.visitCampus')}
              <ExternalLink className="ml-2 h-4 w-4 rtl:ml-0 rtl:mr-2" />
            </Button>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm opacity-80">
            © {currentYear} Alexandria University Technology Park. All rights reserved.
          </div>
          <div className="flex space-x-6 rtl:space-x-reverse text-sm opacity-80">
            <span className="hover:opacity-100 transition-opacity cursor-pointer">{t('footer.privacy')}</span>
            <span className="hover:opacity-100 transition-opacity cursor-pointer">{t('footer.terms')}</span>
            <span className="hover:opacity-100 transition-opacity cursor-pointer">{t('footer.cookies')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
