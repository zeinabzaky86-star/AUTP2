import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, User, ArrowLeft, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import TenantHeader from '@/components/tenant/TenantHeader';
import { NewsImage } from '@/components/NewsImage';
import { useLanguage } from '@/hooks/useLanguage';

interface NewsUpdate {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  image_url?: string;
  published_date: string;
  created_at: string;
  featured: boolean;
  tags: string[];
}

const NewsUpdates = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  
  const fetchNewsUpdates = async () => {
    try {
      let query = supabase
        .from('news_updates')
        .select('*')
        .eq('status', 'published')
        .order('published_date', { ascending: false });

      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        query = query.gte('published_date', `${dateStr}T00:00:00`)
                   .lt('published_date', `${dateStr}T23:59:59`);
      }

      if (featuredOnly) {
        query = query.eq('featured', true);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch news updates"
        });
        return;
      }

      setNewsUpdates(data || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsUpdates();
  }, [selectedDate, featuredOnly]);

  const filteredNews = newsUpdates.filter(news => {
    const matchesSearch = searchTerm === '' || 
      news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = selectedTag === 'all' || 
      (news.tags && news.tags.includes(selectedTag));
    
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(
    new Set(newsUpdates.flatMap(news => news.tags || []))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TenantHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TenantHeader />
      
      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              <span>{t('news.backToHome')}</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t('news.title')}</h1>
              <p className="text-muted-foreground">{t('news.description')}</p>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse">
              <Filter className="h-5 w-5" />
              <span>{t('news.filters')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
                  <Input
                    placeholder={t('news.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rtl:pl-4 rtl:pr-10"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Calendar className="h-4 w-4" />
                    <span>{selectedDate ? format(selectedDate, 'PPP') : t('news.selectDate')}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="pointer-events-auto"
                  />
                  {selectedDate && (
                    <div className="p-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSelectedDate(undefined)}
                        className="w-full"
                      >
                        {t('news.clearDate')}
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              {/* Tag Filter */}
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('news.filterByTag')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('news.allTags')}</SelectItem>
                  {allTags.map(tag => (
                    <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Featured Filter */}
              <Button
                variant={featuredOnly ? "default" : "outline"}
                onClick={() => setFeaturedOnly(!featuredOnly)}
              >
                {t('news.featuredOnly')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">{t('news.noResults')}</p>
              <p className="text-muted-foreground">{t('news.adjustFilters')}</p>
            </div>
          ) : (
            filteredNews.map((news) => (
              <Card 
                key={news.id} 
                className={`group hover:shadow-lg transition-all duration-300 ${
                  news.featured ? 'ring-2 ring-primary/20 bg-gradient-to-br from-primary/5 to-accent/5' : ''
                }`}
              >
                {news.image_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <NewsImage 
                      imagePath={news.image_url} 
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {news.title}
                    </CardTitle>
                    {news.featured && (
                      <Badge variant="secondary" className="bg-innovation text-innovation-foreground">
                        {t('news.featured')}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="line-clamp-2">
                    {news.excerpt || news.content.substring(0, 120) + '...'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(news.published_date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                  
                  {news.tags && news.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {news.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {news.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{news.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      // Open full article in modal or navigate to detail page
                      toast({
                        title: t('news.openingArticle'),
                        description: news.title
                      });
                    }}
                  >
                    {t('news.readMore')}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default NewsUpdates;