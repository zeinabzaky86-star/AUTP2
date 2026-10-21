import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Service } from '@/types/service';
import { renderPrice } from '@/utils/priceDisplay';
import { analytics } from '@/utils/analytics';
import { ExternalLink, Mail, Phone } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ServiceCardProps {
  service: Service;
  position: number;
}

export function ServiceCard({ service, position }: ServiceCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hasTracked = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTracked.current) {
          analytics.serviceCardViewed(service.service_name, position);
          hasTracked.current = true;
        }
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [service.service_name, position]);

  const handleCTAClick = (type: 'booking' | 'email' | 'phone', url: string) => {
    analytics.ctaClicked(type, service.service_name);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderCTA = () => {
    if (!service.contact) return null;

    // Priority: booking_url > email > phone
    if (service.contact.booking_url) {
      return (
        <Button 
          onClick={() => handleCTAClick('booking', service.contact!.booking_url!)}
          className="w-full"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Book now
        </Button>
      );
    }

    if (service.contact.email) {
      const emailUrl = `mailto:${service.contact.email}?subject=Service inquiry: ${service.service_name}`;
      return (
        <Button 
          variant="outline" 
          onClick={() => handleCTAClick('email', emailUrl)}
          className="w-full"
        >
          <Mail className="w-4 h-4 mr-2" />
          Email provider
        </Button>
      );
    }

    if (service.contact.phone) {
      const phoneUrl = `tel:${service.contact.phone}`;
      return (
        <Button 
          variant="outline"
          onClick={() => handleCTAClick('phone', phoneUrl)}
          className="w-full"
        >
          <Phone className="w-4 h-4 mr-2" />
          Call provider
        </Button>
      );
    }

    return null;
  };

  return (
    <Card ref={cardRef} className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight">{service.service_name}</CardTitle>
        {service.one_liner && (
          <p className="text-sm text-muted-foreground mt-1">{service.one_liner}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex-1 space-y-3">
        {/* Category chips and provider */}
        <div className="flex flex-wrap gap-2 items-center">
          {service.category?.slice(0, 2).map((cat) => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
          {service.provider && (
            <span className="text-xs text-muted-foreground ml-auto">
              by {service.provider}
            </span>
          )}
        </div>

        {/* Availability and turnaround badges */}
        <div className="flex flex-wrap gap-2">
        {service.availability_status && (
          <Badge 
            variant={service.availability_status === 'Available' ? 'default' : 'outline'}
            className="text-xs"
          >
            {service.availability_status}
          </Badge>
        )}
          {service.lead_time && (
            <Badge variant="outline" className="text-xs">
              {service.lead_time}
            </Badge>
          )}
        </div>

        {/* Price pill */}
        {service.price_hint && (
          <div className="bg-muted rounded-md px-3 py-1 text-sm font-medium">
            {renderPrice(service.price_hint)}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {renderCTA()}
      </CardFooter>
    </Card>
  );
}