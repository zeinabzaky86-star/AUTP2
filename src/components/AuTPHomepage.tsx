import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/service';
import { ServiceCard } from '@/components/services/ServiceCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/hooks/useLanguage';

export function AuTPHomepage() {
  const { t } = useLanguage();
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [categories] = useState<string[]>([
    'Scientific', 'Facilities', 'Innovation Support', 'Business Development'
  ]);

  useEffect(() => {
    async function fetchFeaturedServices() {
      try {
        const { data, error } = await supabase
          .from('public_services')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('updated_at', { ascending: false })
          .limit(6);

        if (error) throw error;

        const typedServices: Service[] = data?.map(service => ({
          id: service.id || '',
          service_name: service.service_name || 'Untitled Service',
          one_liner: service.one_liner || (service.description ? service.description.substring(0, 100) + '...' : undefined),
          provider: service.provider || 'AuTP',
          status: service.status || 'ACTIVE',
          description: service.description,
          lead_time: service.lead_time,
          requirements: service.requirements,
          availability_status: service.availability_status,
          updated_at: service.updated_at,
          category: service.category 
            ? (Array.isArray(service.category) ? service.category : [service.category])
            : [],
          tags: Array.isArray(service.tags) ? service.tags : []
        })) || [];

        setFeaturedServices(typedServices);
      } catch (error) {
        console.error('Error fetching featured services:', error);
      }
    }

    fetchFeaturedServices();
  }, []);

  return (
    <>

      {/* About Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">{t('homepage.aboutTitle')}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {t('homepage.aboutDescription')}
          </p>
        </div>
      </section>

      {/* Category Chips */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">{t('homepage.serviceCategories')}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Link key={category} to={`/services?category=${encodeURIComponent(category)}`}>
                <Badge variant="outline" className="text-base py-2 px-4 hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors">
                  {category}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('homepage.featuredServices')}</h2>
              <p className="text-muted-foreground text-lg">
                {t('homepage.featuredDescription')}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {featuredServices.map((service, index) => (
                <ServiceCard key={service.id} service={service} position={index} />
              ))}
            </div>
            <div className="text-center">
              <Link to="/services">
                <Button size="lg">
                  {t('homepage.viewAllServices')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}