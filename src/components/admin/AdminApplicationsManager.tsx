import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Eye, Check, X, Clock, Filter, Search, Download } from "lucide-react";
import { format } from "date-fns";

interface Application {
  id: string;
  reference_code: string;
  applicant_name: string;
  email: string;
  phone: string;
  company_name: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'waitlisted';
  submitted_at: string;
  form_data: any;
  decision_reason?: string;
  decided_at?: string;
  decided_by?: string;
}

export default function AdminApplicationsManager() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [decisionReason, setDecisionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications' as any)
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications((data as unknown as Application[]) || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string, 
    newStatus: 'approved' | 'rejected' | 'waitlisted' | 'under_review',
    reason?: string
  ) => {
    setIsProcessing(true);
    try {
      const updateData: any = {
        status: newStatus,
        decided_at: new Date().toISOString(),
        decided_by: (await supabase.auth.getUser()).data.user?.id
      };

      // Only add decision_reason if provided and not empty
      if (reason && reason.trim()) {
        updateData.decision_reason = reason.trim();
      }

      const { error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${getStatusLabel(newStatus)} successfully`,
      });

      // Close dialog and refresh data
      setSelectedApp(null);
      setDecisionReason('');
      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-500';
      case 'under_review': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'waitlisted': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      (app.applicant_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.reference_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const exportApplications = () => {
    const csvContent = [
      ['Reference Code', 'Applicant Name', 'Company', 'Email', 'Phone', 'Status', 'Submitted At', 'Decision Reason'].join(','),
      ...filteredApplications.map(app => [
        app.reference_code,
        app.applicant_name,
        app.company_name || '',
        app.email,
        app.phone,
        getStatusLabel(app.status),
        format(new Date(app.submitted_at), 'yyyy-MM-dd HH:mm'),
        app.decision_reason || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `applications-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading applications...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Management
          </CardTitle>
          <CardDescription>
            Review and manage incubation applications from potential tenants
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="waitlisted">Waitlisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 flex-1">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search by name, company, email, or reference code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            <Button onClick={exportApplications} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Applications Grid */}
          <div className="grid gap-4">
            {filteredApplications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{application.applicant_name}</h3>
                        <Badge className={getStatusColor(application.status)}>
                          {getStatusLabel(application.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Company:</strong> {application.company_name}</p>
                        <p><strong>Email:</strong> {application.email}</p>
                        <p><strong>Reference:</strong> {application.reference_code}</p>
                        <p><strong>Submitted:</strong> {format(new Date(application.submitted_at), 'PPpp')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedApp(application)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Application Review - {application.applicant_name}
                            </DialogTitle>
                            <DialogDescription>
                              Reference Code: {application.reference_code}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedApp && (
                            <div className="space-y-6">
                              {/* Application Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="font-semibold">Basic Information</Label>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p><strong>Type:</strong> {selectedApp.form_data?.applicationType}</p>
                                    <p><strong>Company:</strong> {selectedApp.company_name}</p>
                                    <p><strong>Contact:</strong> {selectedApp.applicant_name}</p>
                                    <p><strong>Email:</strong> {selectedApp.email}</p>
                                    <p><strong>Phone:</strong> {selectedApp.phone}</p>
                                    <p><strong>Website:</strong> {selectedApp.form_data?.website || 'N/A'}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="font-semibold">Business Details</Label>
                                  <div className="mt-2 space-y-1 text-sm">
                                    <p><strong>Industry:</strong> {selectedApp.form_data?.industry}</p>
                                    <p><strong>Stage:</strong> {selectedApp.form_data?.businessStage}</p>
                                    <p><strong>Employees:</strong> {selectedApp.form_data?.employeeCount}</p>
                                    <p><strong>Founded:</strong> {selectedApp.form_data?.yearFounded}</p>
                                    <p><strong>Revenue:</strong> {selectedApp.form_data?.currentRevenue}</p>
                                    <p><strong>Funding:</strong> {selectedApp.form_data?.fundingStatus}</p>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label className="font-semibold">Space Requirements</Label>
                                <div className="mt-2 space-y-1 text-sm">
                                  <p><strong>Type:</strong> {selectedApp.form_data?.spaceRequirement}</p>
                                  <p><strong>Size:</strong> {selectedApp.form_data?.spaceSize}</p>
                                  <p><strong>Duration:</strong> {selectedApp.form_data?.duration}</p>
                                  <p><strong>Move-in Date:</strong> {selectedApp.form_data?.moveInDate}</p>
                                </div>
                              </div>

                              <div>
                                <Label className="font-semibold">Business Description</Label>
                                <p className="mt-2 text-sm">{selectedApp.form_data?.businessDescription}</p>
                              </div>

                              <div>
                                <Label className="font-semibold">Innovation Focus</Label>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {selectedApp.form_data?.innovationFocus?.map((focus: string) => (
                                    <Badge key={focus} variant="secondary">{focus}</Badge>
                                  ))}
                                </div>
                              </div>

                              {/* Decision Section */}
                              <div className="border-t pt-4">
                                <Label className="font-semibold">Decision & Reason</Label>
                                <div className="mt-2 space-y-3">
                                  <Textarea
                                    placeholder="Enter decision reason (required for reject/waitlist)..."
                                    value={decisionReason}
                                    onChange={(e) => setDecisionReason(e.target.value)}
                                    rows={3}
                                  />
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => updateApplicationStatus(selectedApp.id, 'under_review')}
                                      disabled={isProcessing}
                                      variant="outline"
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Under Review
                                    </Button>
                                    <Button
                                      onClick={() => updateApplicationStatus(selectedApp.id, 'approved', decisionReason)}
                                      disabled={isProcessing}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      onClick={() => updateApplicationStatus(selectedApp.id, 'waitlisted', decisionReason)}
                                      disabled={isProcessing || !decisionReason.trim()}
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      <Clock className="h-4 w-4 mr-2" />
                                      Waitlist
                                    </Button>
                                    <Button
                                      onClick={() => updateApplicationStatus(selectedApp.id, 'rejected', decisionReason)}
                                      disabled={isProcessing || !decisionReason.trim()}
                                      variant="destructive"
                                    >
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredApplications.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No applications found matching your criteria.
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}