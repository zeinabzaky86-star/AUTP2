import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Service } from '@/types/service';
import { ServiceCard } from '@/components/services/ServiceCard';
import { SearchAndFilters } from '@/components/services/SearchAndFilters';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import Header from '@/components/Header';

export default function Services() {
  const { t } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState('recent');
  const [allCategories, setAllCategories] = useState<string[]>([]);

  // Fetch services from public view (no auth required)
  useEffect(() => {
    async function fetchServices() {
      try {
        setError(null);
        const { data, error: supabaseError } = await supabase
          .from('public_services')
          .select('*')
          .eq('status', 'ACTIVE')
          .order('updated_at', { ascending: false });

        if (supabaseError) {
          setError(supabaseError.message);
          throw supabaseError;
        }

        const typedServices: Service[] = (data || []).map(service => ({
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
        }));

        setServices(typedServices);

        // Extract unique categories
        const categories = new Set<string>();
        typedServices.forEach(service => {
          service.category?.forEach(cat => categories.add(cat));
        });
        setAllCategories(Array.from(categories).sort());

      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Failed to load services');
      } finally {
        setLoading(false);
      }
    }

    fetchServices();
  }, []);

  // Filter and sort services
  useEffect(() => {
    let filtered = [...services];

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.service_name.toLowerCase().includes(term) ||
        service.one_liner?.toLowerCase().includes(term) ||
        service.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(service =>
        selectedCategories.some(cat => service.category?.includes(cat))
      );
    }

    // Apply availability filter
    if (availability) {
      filtered = filtered.filter(service => service.availability_status === availability);
    }

    // Apply sorting
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.service_name.localeCompare(b.service_name));
    } else {
      filtered.sort((a, b) => 
        new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime()
      );
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, selectedCategories, availability, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2 rtl:rotate-180" />
              {t('servicesPage.backToHome')}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">{t('servicesPage.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('servicesPage.description')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading services...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Search and Filters */}
            <SearchAndFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              categories={allCategories}
              selectedCategories={selectedCategories}
              onCategoryChange={setSelectedCategories}
              availability={availability}
              onAvailabilityChange={setAvailability}
              sortBy={sortBy}
              onSortChange={setSortBy}
              resultsCount={filteredServices.length}
            />

            {/* Results */}
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
            </div>

            {/* Service Cards */}
            {filteredServices.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredServices.map((service, index) => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    position={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {t('servicesPage.noServicesMatch')}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategories([]);
                    setAvailability(undefined);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}