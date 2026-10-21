import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, Menu, Bell, User, Newspaper, Wrench } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import SearchDialog from "./SearchDialog";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show header when mouse is within 100px of the top
      if (e.clientY <= 100) {
        setIsHeaderVisible(true);
      } else if (e.clientY > 150) {
        setIsHeaderVisible(false);
      }
    };

    // Add event listener for mouse movement
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  const scrollToSection = (sectionId: string) => {
    // If not on home page, navigate to home first
    if (window.location.pathname !== '/') {
      navigate('/', { replace: true });
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleTenantPortal = () => {
    // Navigate to tenant portal
    navigate('/tenant');
  };

  const handleBookServices = () => {
    // Navigate to tenant portal's services tab
    if (user) {
      navigate('/tenant');
    } else {
      navigate('/auth');
    }
  };

  const handleSearch = () => {
    setSearchOpen(true);
  };

  const handleNotifications = () => {
    navigate('/tenant');
  };

  const handleNewsUpdates = () => {
    navigate('/news');
  };

  const handleLanguage = () => {
    // Language selector functionality
    console.log('Language selector clicked');
  };

  const handleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleUserProfile = () => {
    navigate('/auth');
  };

  return (
    <header 
      className={`w-full bg-background/95 backdrop-blur-sm border-b border-border fixed top-0 z-50 transition-transform duration-300 ease-in-out ${
        isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
        <nav className="flex items-center justify-between">
          {/* Left Section - Empty to avoid logo interference */}
          <div className="flex-1"></div>

          {/* Right Section - Navigation Links & Interactive Icons */}
          <div className="flex items-center space-x-3 md:space-x-6">
            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer py-2 px-3 rounded-md hover:bg-accent/50"
              >
                {t('nav.about')}
              </button>
              <button 
                onClick={() => scrollToSection('services')} 
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer py-2 px-3 rounded-md hover:bg-accent/50"
              >
                {t('nav.services')}
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-muted-foreground hover:text-primary transition-colors cursor-pointer py-2 px-3 rounded-md hover:bg-accent/50"
              >
                {t('footer.contact')}
              </button>
            </div>

            {/* Interactive Icons & Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search Icon */}
            <Button 
              variant="ghost" 
              size="mobile-icon"
              onClick={handleSearch}
              className="sm:size-tablet-icon hover:bg-accent/50"
              title={t('common.search')}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* News/Updates Icon */}
            <Button 
              variant="ghost" 
              size="mobile-icon"
              onClick={handleNewsUpdates}
              className="flex sm:size-tablet-icon hover:bg-accent/50"
              title={t('nav.news')}
            >
              <Newspaper className="h-5 w-5" />
            </Button>

            {/* Notifications Icon */}
            <Button 
              variant="ghost" 
              size="mobile-icon"
              onClick={handleNotifications}
              className="hidden sm:flex sm:size-tablet-icon hover:bg-accent/50"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
            </Button>

            {/* User Profile Icon */}
            <Button 
              variant="ghost" 
              size="mobile-icon"
              onClick={handleUserProfile}
              className="hidden sm:flex sm:size-tablet-icon hover:bg-accent/50"
              title="User Profile"
            >
              <User className="h-5 w-5" />
            </Button>

            
            {/* Sign In Link */}
            <Button variant="outline" size="mobile" asChild className="hidden md:flex sm:size-tablet">
              <Link to="/auth">{t('nav.signIn')}</Link>
            </Button>

            {/* Mobile Menu Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="mobile-icon"
                  onClick={handleMobileMenu}
                  className="lg:hidden sm:size-tablet-icon hover:bg-accent/50"
                  title="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90vw] max-w-80 bg-background border-l border-border">
                <SheetHeader>
                  <SheetTitle className="text-left text-lg">{t('nav.navigationMenu')}</SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-6">
                  {/* Navigation Links */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('nav.pages')}</h3>
                    <div className="space-y-1">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          scrollToSection('about');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium"
                      >
                        {t('nav.about')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          scrollToSection('services');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium"
                      >
                        {t('nav.services')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          scrollToSection('contact');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium"
                      >
                        {t('footer.contact')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          handleNewsUpdates();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium"
                      >
                        <Newspaper className="mr-3 h-6 w-6" />
                        {t('nav.news')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigate('/application-status');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium"
                      >
                        <Search className="mr-3 h-6 w-6 rtl:ml-3 rtl:mr-0" />
                        {t('nav.checkStatus')}
                      </Button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{t('nav.quickActions')}</h3>
                    <div className="space-y-1">
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          handleSearch();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium"
                      >
                        <Search className="mr-3 h-6 w-6" />
                        {t('common.search')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          handleUserProfile();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium sm:hidden"
                      >
                        <User className="mr-3 h-6 w-6" />
                        {t('nav.signIn')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          handleNotifications();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium sm:hidden"
                      >
                        <Bell className="mr-3 h-6 w-6 rtl:ml-3 rtl:mr-0" />
                        {t('common.notifications')}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => {
                          navigate('/testing');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start h-14 text-lg font-medium"
                      >
                        <Wrench className="mr-3 h-6 w-6 rtl:ml-3 rtl:mr-0" />
                        {t('nav.testingDashboard')}
                      </Button>
                    </div>
                  </div>

                  {/* Primary Action */}
                  <div className="pt-6 border-t border-border">
                    <Button 
                      variant="default" 
                      size="lg"
                      asChild 
                      className="w-full h-14 text-lg bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/auth">{t('nav.getStarted')}</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </nav>
      </div>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
};

export default Header;