
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Download, 
  Eye, 
  EyeOff,
  FileSpreadsheet
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  tenant_price: number;
  au_affiliate_price: number;
  external_price: number;
  lead_time: string;
  available: boolean;
}

const AdminServicesManager = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tenant_price: '',
    au_affiliate_price: '',
    external_price: '',
    lead_time: '',
    available: true
  });

  const categories = [
    'Scientific Research',
    'Business Development',
    'Legal & Compliance',
    'Startup Support',
    'Creative Services',
    'Education & Training'
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load services"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      tenant_price: '',
      au_affiliate_price: '',
      external_price: '',
      lead_time: '',
      available: true
    });
    setSelectedService(null);
    setIsEditing(false);
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      category: service.category,
      tenant_price: service.tenant_price?.toString() || '',
      au_affiliate_price: service.au_affiliate_price?.toString() || '',
      external_price: service.external_price?.toString() || '',
      lead_time: service.lead_time || '',
      available: service.available
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const serviceData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tenant_price: parseFloat(formData.tenant_price) || 0,
        au_affiliate_price: parseFloat(formData.au_affiliate_price) || 0,
        external_price: parseFloat(formData.external_price) || 0,
        lead_time: formData.lead_time,
        available: formData.available
      };

      let error;
      if (isEditing && selectedService) {
        ({ error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', selectedService.id));
      } else {
        ({ error } = await supabase
          .from('services')
          .insert([serviceData]));
      }

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Service ${isEditing ? 'updated' : 'created'} successfully`
      });

      resetForm();
      fetchServices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'create'} service`
      });
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

      toast({
        title: "Service Deleted",
        description: "Service has been removed successfully"
      });

      fetchServices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete service"
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

      toast({
        title: "Updated",
        description: `Service ${!service.available ? 'enabled' : 'disabled'}`
      });

      fetchServices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update service availability"
      });
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;

    setUploadLoading(true);
    try {
      const text = await csvFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const csvServices = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const service: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            switch (header.toLowerCase()) {
              case 'name':
                service.name = value;
                break;
              case 'description':
                service.description = value;
                break;
              case 'category':
                service.category = value;
                break;
              case 'tenant_price':
                service.tenant_price = parseFloat(value) || 0;
                break;
              case 'au_affiliate_price':
                service.au_affiliate_price = parseFloat(value) || 0;
                break;
              case 'external_price':
                service.external_price = parseFloat(value) || 0;
                break;
              case 'lead_time':
                service.lead_time = value;
                break;
              case 'available':
                service.available = value.toLowerCase() === 'true';
                break;
            }
          });
          
          return service;
        })
        .filter(service => service.name);

      const { error } = await supabase
        .from('services')
        .insert(csvServices);

      if (error) throw error;

      toast({
        title: "CSV Import Successful",
        description: `Imported ${csvServices.length} services`
      });

      setCsvFile(null);
      fetchServices();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Import Failed",
        description: error.message || "Failed to import CSV"
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const downloadCsvTemplate = () => {
    const headers = 'name,description,category,tenant_price,au_affiliate_price,external_price,lead_time,available\n';
    const example = 'Market Research Analysis,Comprehensive market analysis service,Business Development,5000,4500,6000,2-3 weeks,true\n';
    
    const csvContent = headers + example;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'services_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Services Manager</h2>
        <p className="text-muted-foreground">
          Manage the Alexandria University Technology Park service catalog and pricing structure.
        </p>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage Services</TabsTrigger>
          <TabsTrigger value="add">Add Service</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {services.map((service) => (
              <Card key={service.id} className={`${!service.available ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {service.name}
                        {service.available ? (
                          <Badge className="bg-success text-success-foreground">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Disabled</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{service.category}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
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
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tenant:</span> ${service.tenant_price?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">AU Affiliate:</span> ${service.au_affiliate_price?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">External:</span> ${service.external_price?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Lead Time:</span> {service.lead_time}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</CardTitle>
              <CardDescription>
                {isEditing ? 'Update service information' : 'Enter the service details below'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Service Name*</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category*</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                      required
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="tenant_price">Tenant Price (LE)*</Label>
                    <Input
                      id="tenant_price"
                      type="number"
                      value={formData.tenant_price}
                      onChange={(e) => setFormData({ ...formData, tenant_price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="au_affiliate_price">AU Affiliate Price (LE)*</Label>
                    <Input
                      id="au_affiliate_price"
                      type="number"
                      value={formData.au_affiliate_price}
                      onChange={(e) => setFormData({ ...formData, au_affiliate_price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="external_price">External Price (LE)*</Label>
                    <Input
                      id="external_price"
                      type="number"
                      value={formData.external_price}
                      onChange={(e) => setFormData({ ...formData, external_price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="lead_time">Lead Time</Label>
                  <Input
                    id="lead_time"
                    placeholder="e.g., 2-3 weeks"
                    value={formData.lead_time}
                    onChange={(e) => setFormData({ ...formData, lead_time: e.target.value })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                  />
                  <Label htmlFor="available">Available for booking</Label>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit" className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90">
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
              <CardDescription>
                Upload a CSV file to import multiple services at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={downloadCsvTemplate}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template</span>
                </Button>
              </div>

              <div>
                <Label htmlFor="csv-file">CSV File</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />
              </div>

              {csvFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Selected file:</p>
                      <p className="text-sm text-muted-foreground">{csvFile.name}</p>
                    </div>
                    <Button
                      onClick={handleCsvUpload}
                      disabled={uploadLoading}
                      className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
                    >
                      {uploadLoading ? 'Uploading...' : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Import Services
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-2">CSV Format Requirements:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Headers: name, description, category, tenant_price, au_affiliate_price, external_price, lead_time, available</li>
                  <li>Prices should be numeric values (no currency symbols)</li>
                  <li>Available field should be 'true' or 'false'</li>
                  <li>Name and category are required fields</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminServicesManager;
