import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, FileText, Calendar, User, Mail, Phone, Building } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface ApplicationData {
  id: string;
  reference_code: string;
  applicant_name: string;
  email: string;
  phone: string;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
  submitted_at: string;
  decided_at: string | null;
  decision_reason: string | null;
}

const ApplicationStatus = () => {
  const [referenceCode, setReferenceCode] = useState('');
  const [email, setEmail] = useState('');
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'waitlisted':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'Submitted';
      case 'under_review':
        return 'Under Review';
      case 'accepted':
        return 'Accepted';
      case 'waitlisted':
        return 'Waitlisted';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const handleSearch = async () => {
    if (!referenceCode.trim() || !email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both reference code and email address.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    setApplication(null);

    try {
      // Use the secure function that requires both reference code and email
      const { data, error } = await supabase.rpc('get_application_by_reference_and_email', {
        _reference_code: referenceCode.trim(),
        _email: email.trim()
      });

      if (error) {
        console.error('Error fetching application:', error);
        toast({
          title: "Error",
          description: "Failed to fetch application. Please try again.",
          variant: "destructive"
        });
        return;
      }

      if (data && data.length > 0) {
        setApplication(data[0]);
      } else {
        toast({
          title: "Application Not Found",
          description: "No application found with the provided reference code and email address. Please check your information and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Application Status</h1>
            <p className="text-muted-foreground">
              Check the status of your application to Alexandria University Technology Park
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Find Your Application
              </CardTitle>
              <CardDescription>
                Enter your reference code and email address to view your application status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referenceCode">Reference Code</Label>
                <Input
                  id="referenceCode"
                  placeholder="Enter your reference code (e.g., ABC123XYZ456)"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              <Button 
                onClick={handleSearch} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Searching...' : 'Check Application Status'}
              </Button>
            </CardContent>
          </Card>

          {searched && application && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Application Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge className={getStatusColor(application.status)}>
                    {getStatusLabel(application.status)}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Applicant:</strong> {application.applicant_name}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Email:</strong> {application.email}
                    </span>
                  </div>
                  
                  {application.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Phone:</strong> {application.phone}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      <strong>Submitted:</strong> {format(new Date(application.submitted_at), 'PPP')}
                    </span>
                  </div>
                </div>
                
                {application.decided_at && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Decision Date:</strong> {format(new Date(application.decided_at), 'PPP')}
                      </span>
                    </div>
                    
                    {application.decision_reason && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm">
                          <strong>Decision Notes:</strong> {application.decision_reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Next Steps:</strong> {
                      application.status === 'submitted' ? 'Your application is being processed. We will contact you within 5-7 business days.' :
                      application.status === 'under_review' ? 'Your application is currently under review. We will notify you of our decision soon.' :
                      application.status === 'accepted' ? 'Congratulations! Your application has been accepted. We will contact you with next steps.' :
                      application.status === 'waitlisted' ? 'Your application has been placed on our waitlist. We will contact you if a space becomes available.' :
                      application.status === 'rejected' ? 'We appreciate your interest. Please feel free to reapply in the future.' :
                      'Please contact us if you have any questions about your application status.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {searched && !application && !loading && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Application Found</h3>
                <p className="text-muted-foreground">
                  Please double-check your reference code and email address, then try again.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ApplicationStatus;