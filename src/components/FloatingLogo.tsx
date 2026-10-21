const FloatingLogo = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="fixed -top-7 left-4 z-50 cursor-pointer hover:scale-105 transition-transform duration-200"
      onClick={() => scrollToSection('hero')}
    >
      <img 
        src="/lovable-uploads/df8fcd92-457a-4357-806a-c934b6b3cec1.png" 
        alt="Alexandria University Technology Park" 
        className="h-[3.66rem] sm:h-[5.23rem] md:h-[6.27rem] lg:h-[10.14rem] w-auto drop-shadow-lg"
      />
    </div>
  );
};

export default FloatingLogo;