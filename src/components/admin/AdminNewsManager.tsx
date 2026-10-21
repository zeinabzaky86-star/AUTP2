import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Save, 
  X, 
  Calendar, 
  Image as ImageIcon,
  Upload,
  Star,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface NewsUpdate {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  image_url?: string;
  author_id: string;
  published_date?: Date | null;
  created_at?: string;
  updated_at?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  tags: string[];
}

const AdminNewsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newsUpdates, setNewsUpdates] = useState<NewsUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNews, setEditingNews] = useState<NewsUpdate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newTag, setNewTag] = useState('');

  const emptyNews: NewsUpdate = {
    title: '',
    content: '',
    excerpt: '',
    author_id: user?.id || '',
    status: 'draft',
    featured: false,
    tags: []
  };

  const fetchNewsUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('news_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch news updates"
        });
        return;
      }

      setNewsUpdates((data || []).map(item => ({
        ...item,
        published_date: item.published_date ? new Date(item.published_date) : null,
        status: item.status as 'draft' | 'published' | 'archived',
        featured: item.featured || false,
        tags: item.tags || [],
        excerpt: item.excerpt || ''
      })));
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsUpdates();
  }, []);

  const handleSave = async () => {
    if (!editingNews || !user) return;

    try {
      const newsData = {
        ...editingNews,
        author_id: user.id,
        published_date: editingNews.status === 'published' && !editingNews.published_date 
          ? new Date().toISOString() 
          : editingNews.published_date?.toISOString()
      };

      if (editingNews.id) {
        const { error } = await supabase
          .from('news_updates')
          .update(newsData)
          .eq('id', editingNews.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "News update saved successfully"
        });
      } else {
        const { error } = await supabase
          .from('news_updates')
          .insert([newsData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "News update created successfully"
        });
      }

      setIsDialogOpen(false);
      setEditingNews(null);
      fetchNewsUpdates();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save news update"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('news_updates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "News update deleted successfully"
      });

      fetchNewsUpdates();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete news update"
      });
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!editingNews) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `news/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Store only the path, not the full URL
      setEditingNews({
        ...editingNews,
        image_url: filePath
      });

      toast({
        title: "Success",
        description: "Image uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload image"
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const addTag = () => {
    if (!editingNews || !newTag.trim()) return;
    
    if (!editingNews.tags.includes(newTag.trim())) {
      setEditingNews({
        ...editingNews,
        tags: [...editingNews.tags, newTag.trim()]
      });
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    if (!editingNews) return;
    
    setEditingNews({
      ...editingNews,
      tags: editingNews.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">News & Updates Management</h2>
          <p className="text-muted-foreground">Manage news articles and updates for Alexandria University Technology Park</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingNews(emptyNews);
                setIsDialogOpen(true);
              }}
              className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add News
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingNews?.id ? 'Edit News Update' : 'Create News Update'}
              </DialogTitle>
              <DialogDescription>
                Create engaging news updates to keep the Alexandria University Technology Park community informed
              </DialogDescription>
            </DialogHeader>

            {editingNews && (
              <div className="space-y-6 py-4">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={editingNews.title}
                    onChange={(e) => setEditingNews({
                      ...editingNews,
                      title: e.target.value
                    })}
                    placeholder="Enter news title..."
                  />
                </div>

                {/* Excerpt */}
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={editingNews.excerpt}
                    onChange={(e) => setEditingNews({
                      ...editingNews,
                      excerpt: e.target.value
                    })}
                    placeholder="Brief summary for preview..."
                    rows={2}
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={editingNews.content}
                    onChange={(e) => setEditingNews({
                      ...editingNews,
                      content: e.target.value
                    })}
                    placeholder="Full article content..."
                    rows={8}
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Featured Image</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    {editingNews.image_url ? (
                      <div className="space-y-4">
                        <img 
                          src={editingNews.image_url} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <Button
                          variant="outline"
                          onClick={() => setEditingNews({
                            ...editingNews,
                            image_url: undefined
                          })}
                        >
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Upload a featured image</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                          className="hidden"
                          id="image-upload"
                          disabled={uploadingImage}
                        />
                        <label htmlFor="image-upload">
                          <Button variant="outline" disabled={uploadingImage} asChild>
                            <span>
                              {uploadingImage ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Choose Image
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingNews.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button onClick={addTag} size="sm">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Status and Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={editingNews.status} 
                      onValueChange={(value) => setEditingNews({
                        ...editingNews,
                        status: value as 'draft' | 'published' | 'archived'
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featured">Featured</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={editingNews.featured}
                        onCheckedChange={(checked) => setEditingNews({
                          ...editingNews,
                          featured: checked
                        })}
                      />
                      <Label htmlFor="featured" className="text-sm">
                        Feature this article
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Publish Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {editingNews.published_date 
                            ? format(editingNews.published_date, 'PPP')
                            : 'Select date'
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={editingNews.published_date || undefined}
                          onSelect={(date) => setEditingNews({
                            ...editingNews,
                            published_date: date || null
                          })}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDialogOpen(false);
                      setEditingNews(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save News
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* News List */}
      <div className="grid grid-cols-1 gap-4">
        {newsUpdates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground text-lg">No news updates yet</p>
              <p className="text-muted-foreground">Create your first news article to get started</p>
            </CardContent>
          </Card>
        ) : (
          newsUpdates.map((news) => (
            <Card key={news.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CardTitle className="text-lg">{news.title}</CardTitle>
                      {news.featured && (
                        <Badge variant="secondary" className="bg-innovation text-innovation-foreground">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          news.status === 'published' ? 'default' : 
                          news.status === 'draft' ? 'secondary' : 'outline'
                        }
                      >
                        {news.status}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {news.excerpt || news.content.substring(0, 120) + '...'}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingNews({
                          ...news,
                          published_date: news.published_date ? new Date(news.published_date) : null
                        });
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete News Update</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{news.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => news.id && handleDelete(news.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    {news.created_at && (
                      <span>
                        Created: {format(new Date(news.created_at), 'MMM dd, yyyy')}
                      </span>
                    )}
                    {news.published_date && (
                      <span>
                        Published: {format(news.published_date, 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                  
                  {news.tags && news.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {news.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminNewsManager;