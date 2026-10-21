import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, Building, Users, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";

const applicationSchema = z.object({
  // Personal/Company Information
  applicationType: z.enum(["startup", "company", "research", "individual"]),
  companyName: z.string()
    .min(2, "Company name must be at least 2 characters")
    .max(200, "Company name must be less than 200 characters")
    .trim(),
  contactPerson: z.string()
    .min(2, "Contact person name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: z.string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .trim(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[\d\s\+\-\(\)]+$/, "Phone number contains invalid characters"),
  website: z.string()
    .url("Invalid website URL")
    .max(500, "URL must be less than 500 characters")
    .optional()
    .or(z.literal("")),
  
  // Business Details
  industry: z.string()
    .min(1, "Industry selection is required")
    .max(100, "Industry must be less than 100 characters")
    .trim(),
  businessStage: z.enum(["idea", "prototype", "mvp", "early-revenue", "growth", "established"]),
  employeeCount: z.string()
    .min(1, "Employee count is required")
    .max(50, "Employee count must be less than 50 characters"),
  yearFounded: z.string()
    .min(4, "Year founded is required")
    .max(4, "Year must be 4 digits")
    .regex(/^\d{4}$/, "Year must be a valid 4-digit year"),
  
  // Technology Park Needs
  spaceRequirement: z.enum(["office", "lab", "workshop", "coworking", "virtual"]),
  spaceSize: z.string().min(1, "Space size requirement is required"),
  duration: z.enum(["3-months", "6-months", "1-year", "2-years", "3-years", "long-term"]),
  moveInDate: z.string().min(1, "Preferred move-in date is required"),
  
  // Business Information
  businessDescription: z.string()
    .min(50, "Business description must be at least 50 characters")
    .max(2000, "Business description must be less than 2000 characters")
    .trim(),
  productsServices: z.string()
    .min(30, "Products/services description is required")
    .max(1500, "Products/services description must be less than 1500 characters")
    .trim(),
  targetMarket: z.string()
    .min(20, "Target market description is required")
    .max(1000, "Target market description must be less than 1000 characters")
    .trim(),
  competitiveAdvantage: z.string()
    .min(30, "Competitive advantage description is required")
    .max(1500, "Competitive advantage must be less than 1500 characters")
    .trim(),
  
  // Financial Information
  currentRevenue: z.enum(["pre-revenue", "0-50k", "50k-250k", "250k-1m", "1m-5m", "5m+"]),
  fundingStatus: z.enum(["bootstrapped", "seeking-funding", "angel-funded", "vc-funded", "grant-funded"]),
  investmentNeeds: z.string().optional(),
  
  // Innovation & Research
  innovationFocus: z.array(z.string()).min(1, "Select at least one innovation focus area"),
  researchCollaboration: z.boolean(),
  intellectualProperty: z.string().optional(),
  
  // Requirements & Preferences
  servicesNeeded: z.array(z.string()).min(1, "Select at least one service needed"),
  networking: z.boolean(),
  mentorship: z.boolean(),
  
  // Additional Information
  previousIncubator: z.string().optional(),
  references: z.string().optional(),
  additionalInfo: z.string().optional(),
  
  // Agreements
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms and conditions"),
  marketingConsent: z.boolean(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const ApplicationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicationType: "startup",
      businessStage: "idea",
      spaceRequirement: "office",
      duration: "1-year",
      currentRevenue: "pre-revenue",
      fundingStatus: "bootstrapped",
      innovationFocus: [],
      servicesNeeded: [],
      researchCollaboration: false,
      networking: false,
      mentorship: false,
      termsAccepted: false,
      marketingConsent: false,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    try {
      const { data: applicationData, error } = await supabase
        .from('applications')
        .insert({
          applicant_name: data.contactPerson,
          email: data.email,
          phone: data.phone || null,
          company_name: data.companyName || null,
          form_data: data,
          status: 'submitted'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      const referenceCode = applicationData?.reference_code;
      toast({
        title: "Application Submitted Successfully!",
        description: referenceCode 
          ? `Your reference code is: ${referenceCode}. Please save this for your records. We will review your application and contact you within 5-7 business days.`
          : "Your application has been submitted successfully. We will review it and contact you within 5-7 business days.",
      });
      
      // Redirect to home page after successful submission
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error('Application submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const innovationAreas = [
    "Artificial Intelligence", "Biotechnology", "Clean Energy", "Digital Health",
    "EdTech", "FinTech", "IoT", "Robotics", "Cybersecurity", "Nanotechnology"
  ];

  const servicesOptions = [
    "Incubation Program", "Acceleration Program", "Mentorship", "Funding Support",
    "Legal Services", "Marketing Support", "Technical Consultation", "Lab Access",
    "Networking Events", "Business Development"
  ];

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('apply.backToHome')}
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary mb-2">
              {t('apply.title')}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('apply.subtitle')}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Application Type & Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Tell us about your organization and primary contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="applicationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select application type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="startup">Startup Company</SelectItem>
                          <SelectItem value="company">Established Company</SelectItem>
                          <SelectItem value="research">Research Institution</SelectItem>
                          <SelectItem value="individual">Individual Entrepreneur</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization/Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="contact@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+20 xxx xxx xxxx" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Business Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Business Details
                </CardTitle>
                <CardDescription>
                  Help us understand your business and its current stage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Technology, Healthcare" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Stage</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="idea">Idea Stage</SelectItem>
                            <SelectItem value="prototype">Prototype</SelectItem>
                            <SelectItem value="mvp">MVP</SelectItem>
                            <SelectItem value="early-revenue">Early Revenue</SelectItem>
                            <SelectItem value="growth">Growth Stage</SelectItem>
                            <SelectItem value="established">Established</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Employees</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1-5, 10-50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearFounded"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year Founded</FormLabel>
                        <FormControl>
                          <Input placeholder="YYYY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Space Requirements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Space & Duration Requirements
                </CardTitle>
                <CardDescription>
                  Specify your space needs and timeline preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="spaceRequirement"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Space Type Needed</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="office">Private Office</SelectItem>
                            <SelectItem value="lab">Laboratory Space</SelectItem>
                            <SelectItem value="workshop">Workshop/Manufacturing</SelectItem>
                            <SelectItem value="coworking">Co-working Space</SelectItem>
                            <SelectItem value="virtual">Virtual Membership</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="spaceSize"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Space Size Required</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 50 sqm, 2-person office" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Duration</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3-months">3 Months</SelectItem>
                            <SelectItem value="6-months">6 Months</SelectItem>
                            <SelectItem value="1-year">1 Year</SelectItem>
                            <SelectItem value="2-years">2 Years</SelectItem>
                            <SelectItem value="3-years">3 Years</SelectItem>
                            <SelectItem value="long-term">Long-term (3+ years)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="moveInDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Move-in Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Business Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Business Information
                </CardTitle>
                <CardDescription>
                  Provide detailed information about your business and value proposition
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="businessDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your business, mission, and core activities..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum 50 characters. Tell us what your business does.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="productsServices"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Products/Services</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your main products or services..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetMarket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Market</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Who are your target customers and what market do you serve?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="competitiveAdvantage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Competitive Advantage</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What makes your business unique and competitive?"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
                <CardDescription>
                  Help us understand your financial status and funding needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currentRevenue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Annual Revenue</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pre-revenue">Pre-Revenue</SelectItem>
                            <SelectItem value="0-50k">$0 - $50K</SelectItem>
                            <SelectItem value="50k-250k">$50K - $250K</SelectItem>
                            <SelectItem value="250k-1m">$250K - $1M</SelectItem>
                            <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                            <SelectItem value="5m+">$5M+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fundingStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Funding Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bootstrapped">Bootstrapped</SelectItem>
                            <SelectItem value="seeking-funding">Seeking Funding</SelectItem>
                            <SelectItem value="angel-funded">Angel Funded</SelectItem>
                            <SelectItem value="vc-funded">VC Funded</SelectItem>
                            <SelectItem value="grant-funded">Grant Funded</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="investmentNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Needs (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your funding requirements and how you plan to use the investment..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        If you're seeking funding, describe your needs and plans.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Innovation Focus */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Innovation & Collaboration
                </CardTitle>
                <CardDescription>
                  Tell us about your innovation focus and collaboration interests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="innovationFocus"
                  render={() => (
                    <FormItem>
                      <FormLabel>Innovation Focus Areas</FormLabel>
                      <FormDescription>
                        Select all areas that apply to your business
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {innovationAreas.map((area) => (
                          <FormField
                            key={area}
                            control={form.control}
                            name="innovationFocus"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(area)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, area])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== area)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {area}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="servicesNeeded"
                  render={() => (
                    <FormItem>
                      <FormLabel>Services Needed</FormLabel>
                      <FormDescription>
                        What services from the Technology Park would benefit your business?
                      </FormDescription>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {servicesOptions.map((service) => (
                          <FormField
                            key={service}
                            control={form.control}
                            name="servicesNeeded"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, service])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== service)
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {service}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="researchCollaboration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Interested in research collaboration with Alexandria University
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="networking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Interested in networking events and community activities
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mentorship"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Interested in mentorship programs
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="intellectualProperty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intellectual Property (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe any patents, trademarks, or IP assets your business owns..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Provide any additional details that would help us evaluate your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="previousIncubator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Incubator/Accelerator Experience (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Have you been part of any other incubators or accelerators? Describe your experience..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="references"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>References (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide contact information for professional references (mentors, advisors, partners, etc.)..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additionalInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any other information you'd like to share about your business or application..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>Terms and Conditions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept the terms and conditions of Alexandria University Technology Park *
                        </FormLabel>
                        <FormDescription>
                          By checking this box, you agree to our application terms and privacy policy.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="marketingConsent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I consent to receive marketing communications about Alexandria University Technology Park programs and events
                        </FormLabel>
                        <FormDescription>
                          Optional: Stay updated on our latest programs, events, and opportunities.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full md:w-auto px-12 py-6 text-lg"
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ApplicationForm;