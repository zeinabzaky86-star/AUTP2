import { useState, useMemo } from "react";
import { Search, FileText, Users, Phone, Building, Newspaper, User, Globe, Eye, CheckCircle, Target, TrendingUp, Lightbulb, Briefcase, Scale, Rocket, Palette, GraduationCap, Microscope, Star, Award, BarChart3, Mail, Zap } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  // Comprehensive search index with all website content
  const searchIndex = useMemo(() => [
    // Hero Section Content
    {
      title: "Alexandria University Technology Park",
      content: "ALEXANDRIA UNIVERSITY TECHNOLOGY PARK Igniting Ideas Engineering Futures ancient wisdom cutting-edge innovation gateway scientific services startup acceleration entrepreneurial excellence 6+ Services World-Class Labs Historic Alexandria Join Us",
      section: "hero",
      icon: Building,
      action: () => {
        onOpenChange(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      title: "Igniting Ideas Engineering Futures",
      content: "slogan tagline motto igniting ideas engineering futures innovation technology startup ancient wisdom modern technology",
      section: "hero",
      icon: Lightbulb,
      action: () => {
        onOpenChange(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    {
      title: "6+ Services World-Class Labs",
      content: "6 services world class labs facilities research development scientific services",
      section: "hero",
      icon: Microscope,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },

    // About Section Content
    {
      title: "Our Objective",
      content: "objective transforms Alexandria University research excellence real-world impact connect researchers students industry co-create solutions accelerate technology transfer scale products specialized labs pilot facilities expert services",
      section: "about",
      icon: Target,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Vision",
      content: "vision world-class technology park bridges academia industry drive sustainable growth Egypt MENA region",
      section: "about",
      icon: Eye,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Mission",
      content: "mission enable innovation deep university-industry collaboration commercialize research incubation acceleration IP licensing specialized infrastructure product development scale up",
      section: "about",
      icon: CheckCircle,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Core Infrastructure",
      content: "core infrastructure labs pilot lines co-working three years facilities equipment",
      section: "about",
      icon: Building,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Startup Growth",
      content: "startup growth incubate 2-20 startups annually strong survival growth entrepreneurship business development",
      section: "about",
      icon: TrendingUp,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Strategic Partnerships",
      content: "strategic partnerships forge partnerships local industry global players collaboration international",
      section: "about",
      icon: Users,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Financial Sustainability",
      content: "financial sustainability achieve via leases services PPPs public private partnerships revenue",
      section: "about",
      icon: BarChart3,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Global Connectivity",
      content: "global connectivity large globally connected research base medicine engineering agri biotech materials environment ICT",
      section: "about",
      icon: Globe,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Quality Excellence",
      content: "quality excellence high international collaboration quality ideal conditions co-development industry",
      section: "about",
      icon: Star,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Strategic Alignment",
      content: "strategic alignment natural fit Alexandria industrial landscape demand applied research pilots skilled graduates",
      section: "about",
      icon: Award,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },

    // Services Content
    {
      title: "Scientific Excellence",
      content: "scientific excellence genomics lab analytical chemistry materials testing environmental analysis state-of-the-art laboratories cutting-edge technology research analysis",
      section: "services",
      icon: Microscope,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Business Support",
      content: "business support market research financial advisory strategic planning business development comprehensive services accelerate entrepreneurial journey",
      section: "services",
      icon: Briefcase,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Legal IP Services",
      content: "legal IP services patent filing IP protection legal consultation regulatory compliance protect innovations expert legal guidance intellectual property",
      section: "services",
      icon: Scale,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Startup Acceleration",
      content: "startup acceleration incubation programs mentorship funding support pitch preparation launch comprehensive acceleration programs expert mentorship",
      section: "services",
      icon: Rocket,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Creative Design",
      content: "creative design fab lab 3D printing design studio prototyping bring ideas life advanced fabrication design capabilities",
      section: "services",
      icon: Palette,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Education Training",
      content: "education training workshops certification programs skills development research training continuous learning opportunities enhance knowledge capabilities",
      section: "services",
      icon: GraduationCap,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },

    // Contact & Footer Content
    {
      title: "Contact Information",
      content: "contact information Alexandria University Technology Park Alexandria Egypt phone email info@atp.alexu.edu.eg visit campus location address",
      section: "contact",
      icon: Phone,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('contact') || document.querySelector('footer');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Social Media",
      content: "social media facebook twitter linkedin instagram connect follow us social networks",
      section: "contact",
      icon: Users,
      action: () => {
        onOpenChange(false);
        const element = document.querySelector('footer');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },

    // Navigation Items
    {
      title: "News Updates",
      content: "news updates announcements latest news recent updates current events",
      section: "navigation",
      icon: Newspaper,
      action: () => {
        onOpenChange(false);
        navigate('/news');
      }
    },
    {
      title: "Tenant Portal",
      content: "tenant portal dashboard services booking management account login access",
      section: "navigation",
      icon: User,
      action: () => {
        onOpenChange(false);
        navigate('/tenant');
      }
    },
    {
      title: "Application Form",
      content: "application form apply join register signup membership application process",
      section: "navigation",
      icon: FileText,
      action: () => {
        onOpenChange(false);
        navigate('/apply');
      }
    },

    // Additional searchable terms
    {
      title: "Innovation Ecosystem",
      content: "innovation ecosystem comprehensive suite services designed support every stage innovation journey initial research market-ready solutions",
      section: "services",
      icon: Zap,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('services');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Research Development",
      content: "research development R&D facilities collaboration opportunities university research academic research scientific research",
      section: "about",
      icon: Microscope,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: "Technology Transfer",
      content: "technology transfer commercialize research intellectual property IP licensing patents innovation commercialization",
      section: "about",
      icon: Zap,
      action: () => {
        onOpenChange(false);
        const element = document.getElementById('about');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ], [navigate, onOpenChange]);

  // Filter search results based on user input
  const filteredResults = useMemo(() => {
    if (!searchValue.trim()) return [];
    
    const searchTerms = searchValue.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return searchIndex.filter(item => {
      const searchableText = `${item.title} ${item.content}`.toLowerCase();
      return searchTerms.every(term => searchableText.includes(term));
    }).slice(0, 8); // Limit to 8 results for better UX
  }, [searchValue, searchIndex]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="bg-popover border border-border shadow-xl">
        <CommandInput 
          placeholder="Search anything on the website..." 
          value={searchValue}
          onValueChange={setSearchValue}
          className="h-12 text-base md:text-sm bg-background border-b border-border"
        />
        <CommandList className="max-h-80 overflow-y-auto bg-popover">
          {filteredResults.length === 0 && searchValue.trim() !== "" && (
            <CommandEmpty className="py-8 text-center text-base md:text-sm">No results found for "{searchValue}"</CommandEmpty>
          )}
          {filteredResults.length === 0 && searchValue.trim() === "" && (
            <CommandEmpty className="py-8 text-center text-base md:text-sm">Start typing to search...</CommandEmpty>
          )}
          {filteredResults.length > 0 && (
            <CommandGroup heading={`Results for "${searchValue}"`} className="bg-popover">
              {filteredResults.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <CommandItem
                    key={`${item.title}-${index}`}
                    value={item.title}
                    onSelect={item.action}
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-accent/50 min-h-[60px] touch-manipulation bg-popover"
                  >
                    <IconComponent className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-medium truncate text-base md:text-sm">{item.title}</span>
                      <span className="text-sm text-muted-foreground capitalize">{item.section} section</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  );
};

export default SearchDialog;