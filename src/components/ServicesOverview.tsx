import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import ServiceDiagrams from "@/components/ServiceDiagrams";
import { 
  Microscope, 
  Briefcase, 
  Scale, 
  Rocket, 
  Palette, 
  GraduationCap,
  ArrowRight,
  Clock,
  Users
} from "lucide-react";

const ServicesOverview = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const services = [
    {
      categoryKey: "services.category1",
      descKey: "services.category1Desc",
      icon: Microscope,
      color: "bg-gradient-lighthouse",
      services: ["Genomics Lab", "Analytical Chemistry", "Materials Testing", "Environmental Analysis"],
      tierKey: "services.allTiers",
      leadTime: "2-5",
      leadTimeUnit: "services.days"
    },
    {
      categoryKey: "services.category2",
      descKey: "services.category2Desc",
      icon: Briefcase,
      color: "bg-gradient-innovation",
      services: ["Market Research", "Financial Advisory", "Strategic Planning", "Business Development"],
      tierKey: "services.external",
      leadTime: "1-3",
      leadTimeUnit: "services.days"
    },
    {
      categoryKey: "services.category3",
      descKey: "services.category3Desc",
      icon: Scale,
      color: "bg-accent",
      services: ["Patent Filing", "IP Protection", "Legal Consultation", "Regulatory Compliance"],
      tierKey: "services.tenantPriority",
      leadTime: "5-10",
      leadTimeUnit: "services.days"
    },
    {
      categoryKey: "services.category4",
      descKey: "services.category4Desc",
      icon: Rocket,
      color: "bg-gradient-sea",
      services: ["Incubation Programs", "Mentorship", "Funding Support", "Pitch Preparation"],
      tierKey: "services.auAffiliates",
      leadTime: "",
      leadTimeUnit: "services.ongoing"
    },
    {
      categoryKey: "services.category5",
      descKey: "services.category5Desc",
      icon: Palette,
      color: "bg-innovation",
      services: ["Fab Lab", "3D Printing", "Design Studio", "Prototyping"],
      tierKey: "services.allTiers",
      leadTime: "",
      leadTimeUnit: "services.sameDay"
    },
    {
      categoryKey: "services.category6",
      descKey: "services.category6Desc",
      icon: GraduationCap,
      color: "bg-success",
      services: ["Workshops", "Certification Programs", "Skills Development", "Research Training"],
      tierKey: "services.auPriority",
      leadTime: "1",
      leadTimeUnit: "services.week"
    }
  ];

  const handleViewCatalog = () => {
    if (user) {
      navigate('/tenant');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {t('services.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => (
            <Card 
              key={t(service.categoryKey)} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-card/80 backdrop-blur-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-3 rounded-lg ${service.color} text-white`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t(service.tierKey)}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {t(service.categoryKey)}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t(service.descKey)}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    {service.services.map((item) => (
                      <div key={item} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mr-2 rtl:mr-0 rtl:ml-2" />
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                      {service.leadTime ? `${service.leadTime} ${t(service.leadTimeUnit)}` : t(service.leadTimeUnit)}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Users className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                      {t('services.tier')}
                    </div>
                  </div>

                  <Button 
                    onClick={handleViewCatalog}
                    className="w-full mt-4 bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
                    size="sm"
                  >
                    {t('services.bookService')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Service Ecosystem Diagrams */}
        <ServiceDiagrams />

        {/* Call to Action */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={handleViewCatalog}
            className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90 text-lg px-8 py-6"
          >
            {t('services.viewCatalog')}
            <ArrowRight className="ml-2 h-5 w-5 rtl:rotate-180" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
