// Analytics events as specified in PRD
interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  
  track(event: string, properties: Record<string, any> = {}) {
    this.events.push({ event, properties });
    console.log('Analytics Event:', event, properties);
    // In production, this would send to your analytics service
  }
  
  searchPerformed(term: string, resultsCount: number) {
    this.track('search_performed', { term, results_count: resultsCount });
  }
  
  filterChanged(categories: string[], availability?: string) {
    this.track('filter_changed', { category: categories, availability });
  }
  
  serviceCardViewed(serviceName: string, position: number) {
    this.track('service_card_viewed', { service_name: serviceName, position });
  }
  
  ctaClicked(type: 'booking' | 'email' | 'phone', serviceName: string) {
    this.track('cta_clicked', { type, service_name: serviceName });
  }
}

export const analytics = new Analytics();