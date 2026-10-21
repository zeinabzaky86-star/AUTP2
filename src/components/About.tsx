import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { 
  Target, 
  Eye, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Building, 
  Lightbulb, 
  Globe,
  BarChart3,
  Star,
  Zap,
  Award
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const goals = [
    { icon: Building, titleKey: 'about.goal1Title', descKey: 'about.goal1Desc', color: "primary" },
    { icon: TrendingUp, titleKey: 'about.goal2Title', descKey: 'about.goal2Desc', color: "accent" },
    { icon: Users, titleKey: 'about.goal3Title', descKey: 'about.goal3Desc', color: "innovation" },
    { icon: BarChart3, titleKey: 'about.goal4Title', descKey: 'about.goal4Desc', color: "success" },
    { icon: Award, titleKey: 'about.goal5Title', descKey: 'about.goal5Desc', color: "primary" }
  ];

  const strengths = [
    { icon: Globe, titleKey: 'about.strength1Title', descKey: 'about.strength1Desc', color: "primary" },
    { icon: Star, titleKey: 'about.strength2Title', descKey: 'about.strength2Desc', color: "accent" },
    { icon: Lightbulb, titleKey: 'about.strength3Title', descKey: 'about.strength3Desc', color: "innovation" }
  ];

  const frameworkItems = [
    { key: 'about.frameworkItem1', color: "primary" },
    { key: 'about.frameworkItem2', color: "accent" },
    { key: 'about.frameworkItem3', color: "innovation" },
    { key: 'about.frameworkItem4', color: "success" },
    { key: 'about.frameworkItem5', color: "primary" }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('about.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Objective */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-card to-muted/20 border-primary/10 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-primary">{t('about.objective')}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('about.objectiveText')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vision & Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="bg-accent/20 p-3 rounded-full">
                  <Eye className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-accent">{t('about.vision')}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('about.visionText')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-innovation/5 to-innovation/10 border-innovation/20 shadow-soft hover:shadow-medium transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="bg-innovation/20 p-3 rounded-full">
                  <CheckCircle className="h-8 w-8 text-innovation" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-innovation">{t('about.mission')}</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start space-x-2 rtl:space-x-reverse">
                      <Zap className="h-4 w-4 text-innovation mt-1 flex-shrink-0" />
                      <span>{t('about.missionItem1')}</span>
                    </li>
                    <li className="flex items-start space-x-2 rtl:space-x-reverse">
                      <TrendingUp className="h-4 w-4 text-innovation mt-1 flex-shrink-0" />
                      <span>{t('about.missionItem2')}</span>
                    </li>
                    <li className="flex items-start space-x-2 rtl:space-x-reverse">
                      <Building className="h-4 w-4 text-innovation mt-1 flex-shrink-0" />
                      <span>{t('about.missionItem3')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Goals */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-primary">{t('about.mainGoals')}</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal, index) => (
              <Card key={index} className="bg-card/50 border-primary/10 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`bg-${goal.color}/10 p-4 rounded-full`}>
                      <goal.icon className={`h-8 w-8 text-${goal.color}`} />
                    </div>
                    <h4 className="text-lg font-semibold text-primary">{t(goal.titleKey)}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t(goal.descKey)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Strengths */}
        <div className="mb-16">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-medium">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {t('about.strengthsTitle')}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {t('about.strengthsSubtitle')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {strengths.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className={`bg-${s.color}/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                      <s.icon className={`h-8 w-8 text-${s.color}`} />
                    </div>
                    <h4 className={`text-xl font-semibold mb-3 text-${s.color}`}>{t(s.titleKey)}</h4>
                    <p className="text-muted-foreground leading-relaxed">{t(s.descKey)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Framework */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-8 text-primary">{t('about.strategicFramework')}</h3>
          <Card className="bg-gradient-to-r from-card to-muted/10 border-primary/10 shadow-medium">
            <CardContent className="p-8">
              <div className="flex flex-wrap justify-center items-center gap-4">
                {frameworkItems.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Badge 
                      variant="outline" 
                      className={`px-4 py-2 text-${item.color} border-${item.color}/30 bg-${item.color}/10`}
                    >
                      {t(item.key)}
                    </Badge>
                    {index < frameworkItems.length - 1 && (
                      <div className="hidden md:block ml-4 text-2xl text-muted-foreground">→</div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Card className="bg-gradient-lighthouse text-white border-none shadow-glow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">{t('about.ctaTitle')}</h3>
              <p className="text-lg mb-6 text-white/90">
                {t('about.ctaSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="bg-white/20 text-white border border-white/30 hover:bg-white/30 px-6 py-3 rounded-lg transition-all duration-300"
                  onClick={() => {
                    const servicesSection = document.getElementById('services');
                    if (servicesSection) {
                      servicesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  {t('about.exploreServices')}
                </button>
                <button 
                  className="bg-white text-primary hover:bg-white/90 px-6 py-3 rounded-lg transition-all duration-300"
                  onClick={() => navigate('/auth')}
                >
                  {t('about.getStarted')}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default About;
