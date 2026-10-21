// Service types based on PRD specification
export interface ServiceContact {
  booking_url?: string;
  email?: string;
  phone?: string;
}

export interface PriceHint {
  mode: 'exact' | 'from' | 'quote';
  amount?: number;
  unit?: string;
  currency?: string;
}

export interface ServiceLinks {
  docs?: Array<{ label: string; url: string }>;
  images?: string[];
}

export interface Service {
  id: string;
  service_name: string;
  one_liner?: string;
  category?: string[];
  provider?: string;
  contact?: ServiceContact;
  availability_status?: string; // Made more flexible to handle any string
  lead_time?: string;
  price_hint?: PriceHint;
  location?: string;
  requirements?: string;
  tags?: string[];
  links?: ServiceLinks;
  status: string;
  description?: string;
  updated_at?: string;
}