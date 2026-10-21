import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Edit2, Trash2, Download, Upload, Plus, Activity, BarChart3, Calendar, User, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Service {
  id: string;
  name?: string;
  service_name?: string;
  category: string;
  description?: string;
  duration?: string;
  lead_time?: string;
  base_price?: number;
  tenant_price?: number;
  au_affiliate_price?: number;
  external_price?: number;
  available: boolean;
  tags?: string[];
  availability_status?: string;
  assigned_to?: string;
  contact_email?: string;
  media_urls?: string[];
  notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

interface ActivityLog {
  id: string;
  action: string;
  created_at: string;
  admin_user_id: string;
  service_id?: string;
  old_data?: any;
  new_data?: any;
}

interface DashboardStats {
  total_services: number;
  active_services: number;
  categories: number;
  recent_additions: number;
}

export const EnhancedAdminServicesManager = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total_services: 0,
    active_services: 0,
    categories: 0,
    recent_additions: 0
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    service_name: '',
    name: '',
    category: '',
    description: '',
    duration: '',
    lead_time: '',
    base_price: '',
    tenant_price: '',
    au_affiliate_price: '',
    external_price: '',
    available: true,
    tags: '',
    availability_status: 'available',
    assigned_to: '',
    contact_email: '',
    media_urls: '',
    notes: '',
    status: 'active',
  });

  const categories = [
    'IT Support',
    'Property Management',
    'Security Services',
    'Maintenance',
    'Academic Support',
    'Business Services',
    'Legal & Compliance',
    'Creative Services',
    'Health & Wellness'
  ];

  const availabilityStatuses = ['available', 'unavailable', 'scheduled', 'on-demand'];
  const serviceStatuses = ['active', 'inactive', 'draft'];

  useEffect(() => {
    fetchServices();
    fetchActivityLog();
    fetchStats();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to fetch services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const { data, error } = await supabase
        .from('service_activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setActivityLog(data || []);
    } catch (error) {
      console.error('Error fetching activity log:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, category, status, created_at');

      if (error) throw error;
      
      const total = data?.length || 0;
      const active = data?.filter(s => s.status === 'active').length || 0;
      const categories = new Set(data?.map(s => s.category)).size;
      const recent = data?.filter(s => {
        const createdAt = new Date(s.created_at);
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return createdAt > monthAgo;
      }).length || 0;

      setStats({
        total_services: total,
        active_services: active,
        categories,
        recent_additions: recent
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      service_name: '',
      name: '',
      category: '',
      description: '',
      duration: '',
      lead_time: '',
      base_price: '',
      tenant_price: '',
      au_affiliate_price: '',
      external_price: '',
      available: true,
      tags: '',
      availability_status: 'available',
      assigned_to: '',
      contact_email: '',
      media_urls: '',
      notes: '',
      status: 'active',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (service: Service) => {
    setFormData({
      service_name: service.service_name || service.name || '',
      name: service.name || service.service_name || '',
      category: service.category || '',
      description: service.description || '',
      duration: service.duration || '',
      lead_time: service.lead_time || '',
      base_price: service.base_price?.toString() || '',
      tenant_price: service.tenant_price?.toString() || '',
      au_affiliate_price: service.au_affiliate_price?.toString() || '',
      external_price: service.external_price?.toString() || '',
      available: service.available,
      tags: service.tags?.join(', ') || '',
      availability_status: service.availability_status || 'available',
      assigned_to: service.assigned_to || '',
      contact_email: service.contact_email || '',
      media_urls: service.media_urls?.join(', ') || '',
      notes: service.notes || '',
      status: service.status || 'active',
    });
    setIsEditing(true);
    setEditingId(service.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        service_name: formData.service_name,
        name: formData.name || formData.service_name, // fallback for compatibility
        category: formData.category,
        description: formData.description || null,
        duration: formData.duration || null,
        lead_time: formData.lead_time || null,
        base_price: formData.base_price ? parseFloat(formData.base_price) : null,
        tenant_price: formData.tenant_price ? parseFloat(formData.tenant_price) : null,
        au_affiliate_price: formData.au_affiliate_price ? parseFloat(formData.au_affiliate_price) : null,
        external_price: formData.external_price ? parseFloat(formData.external_price) : null,
        available: formData.available,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
        availability_status: formData.availability_status,
        assigned_to: formData.assigned_to || null,
        contact_email: formData.contact_email || null,
        media_urls: formData.media_urls ? formData.media_urls.split(',').map(url => url.trim()) : null,
        notes: formData.notes || null,
        status: formData.status,
      };

      let result;
      if (isEditing && editingId) {
        result = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingId);
      } else {
        result = await supabase
          .from('services')
          .insert([serviceData]);
      }

      if (result.error) throw result.error;

      // Log the activity
      await logActivity(isEditing ? 'updated' : 'created', editingId || result.data?.[0]?.id);

      toast({
        title: "Success",
        description: `Service ${isEditing ? 'updated' : 'created'} successfully`,
      });

      resetForm();
      fetchServices();
      fetchActivityLog();
      fetchStats();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} service`,
        variant: "destructive",
      });
    }
  };

  const logActivity = async (action: string, serviceId?: string, additionalData?: any) => {
    try {
      // Get user ID, handling bypass user (using valid UUID)
      let userId;
      if (user?.id === '00000000-0000-0000-0000-000000000001') {
        userId = '00000000-0000-0000-0000-000000000001';
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        userId = authUser?.id;
      }

      await supabase
        .from('service_activity_log')
        .insert([{
          action,
          service_id: serviceId,
          admin_user_id: userId,
          new_data: additionalData
        }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;

      await logActivity('deleted', serviceId);

      toast({
        title: "Service Deleted",
        description: "Service has been removed successfully",
      });

      fetchServices();
      fetchActivityLog();
      fetchStats();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const toggleAvailability = async (service: Service) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ available: !service.available })
        .eq('id', service.id);

      if (error) throw error;

      await logActivity('availability_toggle', service.id);

      toast({
        title: "Updated",
        description: `Service ${!service.available ? 'enabled' : 'disabled'}`,
      });

      fetchServices();
      fetchActivityLog();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update service availability",
        variant: "destructive",
      });
    }
  };

  const downloadExcelTemplate = () => {
    const headers = [
      'service_name', 'category', 'description', 'duration', 'base_price',
      'tenant_price', 'au_affiliate_price', 'external_price', 'available',
      'lead_time', 'tags', 'availability_status', 'assigned_to', 
      'contact_email', 'media_urls', 'notes', 'status'
    ];
    
    const sampleData = [
      'Campus Wi-Fi Setup', 'IT Support', 'Complete wireless network setup and configuration for student accommodations',
      '2-3 hours', '200', '150', '120', '180', 'TRUE', '24 hours',
      'wifi,internet,setup,network', 'available', 'John Smith', 'it@autp.com',
      'https://example.com/wifi-setup.jpg', 'High demand service', 'active'
    ];

    const csvContent = headers.join(',') + '\n' + sampleData.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'AuTP_Services_Template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast({
        title: "Error",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await csvFile.text();
      const rows = parseCSV(text);
      
      if (rows.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const headers = rows[0].map(h => h.toLowerCase().trim());
      const dataRows = rows.slice(1);

      // Validate required fields
      const requiredFields = ['service_name', 'category'];
      for (const field of requiredFields) {
        if (!headers.includes(field)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      const servicesToInsert = [];
      const errors = [];

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        const rowNum = i + 2; // +2 because we start from row 1 and skip header

        try {
          if (row.length === 0 || !row.some(cell => cell.trim())) {
            continue; // Skip empty rows
          }

          const service: any = {};
          
          // Map CSV columns to service object
          headers.forEach((header, index) => {
            const value = row[index]?.trim() || '';
            
            switch (header) {
              case 'service_name':
              case 'category':
              case 'description':
              case 'duration':
              case 'lead_time':
              case 'availability_status':
              case 'assigned_to':
              case 'contact_email':
              case 'notes':
              case 'status':
                service[header] = value || null;
                break;
              case 'base_price':
              case 'tenant_price':
              case 'au_affiliate_price':
              case 'external_price':
                service[header] = value ? parseFloat(value) : null;
                break;
              case 'available':
                service[header] = value.toLowerCase() === 'true' || value === '1';
                break;
              case 'tags':
                service[header] = value ? value.split(',').map(tag => tag.trim()) : null;
                break;
              case 'media_urls':
                service[header] = value ? value.split(',').map(url => url.trim()) : null;
                break;
            }
          });

          // Set name field for compatibility
          service.name = service.service_name;

          // Validate required fields
          if (!service.service_name || !service.category) {
            errors.push(`Row ${rowNum}: Missing required fields (service_name, category)`);
            continue;
          }

          // Set defaults
          service.available = service.available !== undefined ? service.available : true;
          service.status = service.status || 'active';
          service.availability_status = service.availability_status || 'available';

          servicesToInsert.push(service);
        } catch (error) {
          errors.push(`Row ${rowNum}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        console.warn('CSV Import Errors:', errors);
        toast({
          title: "Import completed with warnings",
          description: `${servicesToInsert.length} services imported, ${errors.length} errors occurred. Check console for details.`,
          variant: "destructive",
        });
      }

      if (servicesToInsert.length === 0) {
        throw new Error('No valid services found in CSV file');
      }

      // Insert services in batch
      const { error } = await supabase
        .from('services')
        .insert(servicesToInsert);

      if (error) throw error;

      // Log bulk import activity
      await logActivity('bulk_imported', undefined, { count: servicesToInsert.length });

      toast({
        title: "Success",
        description: `Successfully imported ${servicesToInsert.length} services`,
      });

      // Reset file input and refresh data
      setCsvFile(null);
      if (document.getElementById('csv-upload')) {
        (document.getElementById('csv-upload') as HTMLInputElement).value = '';
      }
      
      fetchServices();
      fetchActivityLog();
      fetchStats();

    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import CSV file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatActivityAction = (action: string) => {
    switch (action) {
      case 'created': return 'Created service';
      case 'updated': return 'Updated service';
      case 'deleted': return 'Deleted service';
      case 'bulk_imported': return 'Bulk imported services';
      case 'availability_toggle': return 'Toggled availability';
      default: return action;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Overview */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Alexandria University Technology Park Services - Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive service management system with analytics and activity tracking.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_services}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active_services}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.categories}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recent_additions}</div>
            <p className="text-xs text-muted-foreground">Added</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manage">Manage Services</TabsTrigger>
          <TabsTrigger value="add">Add/Edit Service</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Services */}
            <Card>
              <CardHeader>
                <CardTitle>Recently Added Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {services.slice(0, 5).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="font-medium">{service.service_name || service.name}</p>
                        <p className="text-sm text-muted-foreground">{service.category}</p>
                      </div>
                      <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => (document.querySelector('[data-value="add"]') as HTMLElement)?.click()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Service
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={downloadExcelTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Excel Template
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => (document.querySelector('[data-value="bulk"]') as HTMLElement)?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import Services
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.service_name || service.name}</p>
                      {service.assigned_to && (
                        <p className="text-sm text-muted-foreground">Assigned: {service.assigned_to}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell>
                    LE {service.tenant_price || 0} - LE {service.external_price || 0}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={service.available ? 'default' : 'secondary'}>
                        {service.available ? 'Available' : 'Unavailable'}
                      </Badge>
                      <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                        {service.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAvailability(service)}
                      >
                        {service.available ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="service_name">Service Name*</Label>
                    <Input
                      id="service_name"
                      value={formData.service_name}
                      onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category*</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 2-3 hours"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lead_time">Lead Time</Label>
                    <Input
                      id="lead_time"
                      placeholder="e.g., 24 hours"
                      value={formData.lead_time}
                      onChange={(e) => setFormData({ ...formData, lead_time: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="base_price">Base Price (LE)</Label>
                    <Input
                      id="base_price"
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tenant_price">Tenant Price (LE)</Label>
                    <Input
                      id="tenant_price"
                      type="number"
                      value={formData.tenant_price}
                      onChange={(e) => setFormData({ ...formData, tenant_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="au_affiliate_price">AU Affiliate Price (LE)</Label>
                    <Input
                      id="au_affiliate_price"
                      type="number"
                      value={formData.au_affiliate_price}
                      onChange={(e) => setFormData({ ...formData, au_affiliate_price: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="external_price">External Price (LE)</Label>
                    <Input
                      id="external_price"
                      type="number"
                      value={formData.external_price}
                      onChange={(e) => setFormData({ ...formData, external_price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., wifi, internet, setup"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="assigned_to">Assigned To</Label>
                    <Input
                      id="assigned_to"
                      placeholder="e.g., John Smith"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="e.g., service@autp.com"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="media_urls">Media URLs (comma-separated)</Label>
                    <Input
                      id="media_urls"
                      placeholder="https://example.com/image.jpg"
                      value={formData.media_urls}
                      onChange={(e) => setFormData({ ...formData, media_urls: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="availability_status">Availability Status</Label>
                    <Select
                      value={formData.availability_status}
                      onValueChange={(value) => setFormData({ ...formData, availability_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availabilityStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Service Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceStatuses.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Admin Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Internal notes for admin use"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                  />
                  <Label htmlFor="available">Available for booking</Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">
                    {isEditing ? 'Update Service' : 'Create Service'}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Import Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={downloadExcelTemplate} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Excel Template
                </Button>
                <Button 
                  onClick={handleCsvUpload} 
                  disabled={!csvFile || isUploading}
                  className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Services
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <Label htmlFor="csv-upload">Upload CSV File</Label>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="mt-1"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
                {csvFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Import Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Download the CSV template using the button above</li>
                  <li>Fill in your service data following the sample format</li>
                  <li>Save as CSV format (not Excel)</li>
                  <li>Upload the file and click "Import Services"</li>
                </ol>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">CSV Template Fields:</p>
                <div className="grid grid-cols-2 gap-2">
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>service_name</strong> (required)</li>
                    <li><strong>category</strong> (required)</li>
                    <li>description</li>
                    <li>duration</li>
                    <li>base_price (number)</li>
                    <li>tenant_price (number)</li>
                    <li>au_affiliate_price (number)</li>
                    <li>external_price (number)</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-1">
                    <li>available (true/false)</li>
                    <li>lead_time</li>
                    <li>tags (comma-separated)</li>
                    <li>availability_status</li>
                    <li>assigned_to</li>
                    <li>contact_email</li>
                    <li>media_urls (comma-separated)</li>
                    <li>notes</li>
                    <li>status (active/inactive/draft)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLog.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded border">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{formatActivityAction(activity.action)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {activityLog.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No activity logged yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAdminServicesManager;