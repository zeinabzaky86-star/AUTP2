import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { analytics } from '@/utils/analytics';
import { useEffect } from 'react';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  availability?: string;
  onAvailabilityChange: (availability?: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  resultsCount: number;
}

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategories,
  onCategoryChange,
  availability,
  onAvailabilityChange,
  sortBy,
  onSortChange,
  resultsCount
}: SearchAndFiltersProps) {
  
  // Track analytics when filters change
  useEffect(() => {
    if (selectedCategories.length > 0 || availability) {
      analytics.filterChanged(selectedCategories, availability);
    }
  }, [selectedCategories, availability]);

  const handleSearch = (term: string) => {
    onSearchChange(term);
    if (term.trim()) {
      analytics.searchPerformed(term, resultsCount);
    }
  };

  const toggleCategory = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    onCategoryChange(newCategories);
  };

  const clearFilters = () => {
    onCategoryChange([]);
    onAvailabilityChange(undefined);
    onSearchChange('');
  };

  const hasActiveFilters = selectedCategories.length > 0 || availability || searchTerm;

  return (
    <div className="space-y-4 mb-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategories.includes(category) ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Availability filter */}
        <Select value={availability || ''} onValueChange={(value) => onAvailabilityChange(value || undefined)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All availability</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="By appointment">By appointment</SelectItem>
            <SelectItem value="Temporarily unavailable">Temporarily unavailable</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most recent</SelectItem>
            <SelectItem value="name">A–Z</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground">
          <span>Active filters:</span>
          {selectedCategories.map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
              <button
                onClick={() => toggleCategory(category)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-3 h-3 flex items-center justify-center"
              >
                <X className="w-2 h-2" />
              </button>
            </Badge>
          ))}
          {availability && (
            <Badge variant="secondary" className="text-xs">
              {availability}
              <button
                onClick={() => onAvailabilityChange(undefined)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full w-3 h-3 flex items-center justify-center"
              >
                <X className="w-2 h-2" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}