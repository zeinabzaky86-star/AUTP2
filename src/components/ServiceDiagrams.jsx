import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowDown, Zap, Target, Lightbulb, Rocket, Users, Clock, Star, CheckCircle2 } from "lucide-react";

const ServiceDiagrams = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-12">
        <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Innovation Ecosystem Overview
        </h3>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Experience our streamlined, non-bureaucratic approach to innovation services designed to accelerate your journey from concept to market
        </p>
      </div>

      {/* Modern Service Flow */}
      <div className="mb-16">
        <Card className="p-8 bg-gradient-to-br from-primary/5 via-accent/5 to-success/5 border-0 shadow-xl">
          <h4 className="text-2xl font-bold mb-8 text-center">Streamlined Service Flow</h4>
          
          <div className="relative">
            {/* Curved connection line */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1000 400">
                <path 
                  d="M 50 50 Q 250 100 450 50 T 850 50 Q 900 100 950 200" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="3" 
                  fill="none" 
                  strokeDasharray="10,5"
                  className="opacity-30"
                />
              </svg>
            </div>
            
            {/* Flow Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
              {/* Step 1: Quick Submit */}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300 mb-4">
                  <Zap className="w-8 h-8 mx-auto mb-3" />
                  <h5 className="font-bold text-lg">Quick Submit</h5>
                  <p className="text-sm opacity-90">One-click request submission</p>
                </div>
                <Badge variant="secondary" className="text-xs">30 seconds</Badge>
              </div>

              {/* Step 2: Smart Routing */}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300 mb-4">
                  <Target className="w-8 h-8 mx-auto mb-3" />
                  <h5 className="font-bold text-lg">Smart Routing</h5>
                  <p className="text-sm opacity-90">AI-powered expert matching</p>
                </div>
                <Badge variant="secondary" className="text-xs">Instant</Badge>
              </div>

              {/* Step 3: Rapid Delivery */}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300 mb-4">
                  <Rocket className="w-8 h-8 mx-auto mb-3" />
                  <h5 className="font-bold text-lg">Rapid Delivery</h5>
                  <p className="text-sm opacity-90">Fast-track execution</p>
                </div>
                <Badge variant="secondary" className="text-xs">Same day possible</Badge>
              </div>

              {/* Step 4: Results */}
              <div className="text-center group">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg transform group-hover:scale-105 transition-all duration-300 mb-4">
                  <Star className="w-8 h-8 mx-auto mb-3" />
                  <h5 className="font-bold text-lg">Excellence</h5>
                  <p className="text-sm opacity-90">Premium quality outcomes</p>
                </div>
                <Badge variant="secondary" className="text-xs">Guaranteed</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Service Categories Ecosystem */}
      <div className="mb-16">
        <Card className="p-8 bg-gradient-to-r from-innovation/10 via-lighthouse/10 to-success/10 border-0 shadow-xl">
          <h4 className="text-2xl font-bold mb-8 text-center">Innovation Service Categories</h4>
          
          <div className="relative">
            {/* Central Hub */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <div className="bg-gradient-to-br from-primary to-accent text-white p-6 rounded-full shadow-2xl">
                <Lightbulb className="w-12 h-12" />
              </div>
              <p className="text-center mt-2 font-bold text-primary">Your Innovation</p>
            </div>

            {/* Service Categories in Circle */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 relative">
              {/* Scientific Excellence */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="bg-blue-500 text-white p-3 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                    🔬
                  </div>
                  <h5 className="font-bold text-blue-700 mb-2">Scientific Excellence</h5>
                  <div className="space-y-1 text-sm text-blue-600">
                    <div>• Genomics Lab</div>
                    <div>• Analytical Chemistry</div>
                    <div>• Materials Testing</div>
                  </div>
                  <Badge className="mt-3 bg-blue-500">2-5 Days</Badge>
                </div>
              </div>

              {/* Business Support */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="bg-purple-500 text-white p-3 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                    💼
                  </div>
                  <h5 className="font-bold text-purple-700 mb-2">Business Support</h5>
                  <div className="space-y-1 text-sm text-purple-600">
                    <div>• Market Research</div>
                    <div>• Strategic Planning</div>
                    <div>• Financial Advisory</div>
                  </div>
                  <Badge className="mt-3 bg-purple-500">1-3 Days</Badge>
                </div>
              </div>

              {/* Legal & IP */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border-2 border-red-200 hover:border-red-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="bg-red-500 text-white p-3 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                    ⚖️
                  </div>
                  <h5 className="font-bold text-red-700 mb-2">Legal & IP Services</h5>
                  <div className="space-y-1 text-sm text-red-600">
                    <div>• Patent Filing</div>
                    <div>• IP Protection</div>
                    <div>• Compliance</div>
                  </div>
                  <Badge className="mt-3 bg-red-500">5-10 Days</Badge>
                </div>
              </div>

              {/* Creative & Design */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 hover:border-green-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="bg-green-500 text-white p-3 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                    🎨
                  </div>
                  <h5 className="font-bold text-green-700 mb-2">Creative & Design</h5>
                  <div className="space-y-1 text-sm text-green-600">
                    <div>• Fab Lab Access</div>
                    <div>• 3D Printing</div>
                    <div>• Prototyping</div>
                  </div>
                  <Badge className="mt-3 bg-green-500">Same Day</Badge>
                </div>
              </div>

              {/* Startup Acceleration */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="bg-orange-500 text-white p-3 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                    🚀
                  </div>
                  <h5 className="font-bold text-orange-700 mb-2">Startup Acceleration</h5>
                  <div className="space-y-1 text-sm text-orange-600">
                    <div>• Incubation Programs</div>
                    <div>• Mentorship</div>
                    <div>• Funding Support</div>
                  </div>
                  <Badge className="mt-3 bg-orange-500">Ongoing</Badge>
                </div>
              </div>

              {/* Education & Training */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 group">
                <div className="text-center">
                  <div className="bg-indigo-500 text-white p-3 rounded-full w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                    🎓
                  </div>
                  <h5 className="font-bold text-indigo-700 mb-2">Education & Training</h5>
                  <div className="space-y-1 text-sm text-indigo-600">
                    <div>• Workshops</div>
                    <div>• Certification</div>
                    <div>• Skills Development</div>
                  </div>
                  <Badge className="mt-3 bg-indigo-500">1 Week</Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tenant Experience Journey */}
      <div className="mb-16">
        <Card className="p-8 bg-gradient-to-br from-accent/5 to-success/5 border-0 shadow-xl">
          <h4 className="text-2xl font-bold mb-8 text-center">Your Journey with Alexandria University Technology Park</h4>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-success rounded-full"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              {/* Discovery */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-full shadow-lg w-16 h-16 flex items-center justify-center mx-auto mb-4 border-4 border-primary">
                  <span className="text-2xl">🔍</span>
                </div>
                <h5 className="font-bold mb-3 text-primary">Discovery</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Browse Services
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Compare Options
                  </div>
                  <div className="flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                    Read Reviews
                  </div>
                </div>
              </div>

              {/* Booking */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-full shadow-lg w-16 h-16 flex items-center justify-center mx-auto mb-4 border-4 border-accent">
                  <span className="text-2xl">📝</span>
                </div>
                <h5 className="font-bold mb-3 text-accent">Booking</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    Select Service
                  </div>
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    Instant Quote
                  </div>
                  <div className="flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-500 mr-2" />
                    Schedule Session
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-full shadow-lg w-16 h-16 flex items-center justify-center mx-auto mb-4 border-4 border-success">
                  <span className="text-2xl">⚡</span>
                </div>
                <h5 className="font-bold mb-3 text-success">Delivery</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-500 mr-2" />
                    Expert Service
                  </div>
                  <div className="flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-500 mr-2" />
                    Real-time Updates
                  </div>
                  <div className="flex items-center justify-center">
                    <Users className="w-4 h-4 text-orange-500 mr-2" />
                    Quality Assurance
                  </div>
                </div>
              </div>

              {/* Follow-up */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-full shadow-lg w-16 h-16 flex items-center justify-center mx-auto mb-4 border-4 border-orange-500">
                  <span className="text-2xl">🌟</span>
                </div>
                <h5 className="font-bold mb-3 text-orange-600">Excellence</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    Results Delivered
                  </div>
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    Feedback & Rating
                  </div>
                  <div className="flex items-center justify-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-2" />
                    Continuous Support
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Why Choose Alexandria University Technology Park */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center bg-gradient-to-b from-primary/5 to-primary/10 border-primary/20 hover:shadow-xl transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8" />
          </div>
          <h5 className="font-bold mb-3">Lightning Fast</h5>
          <p className="text-sm text-muted-foreground">Skip the red tape. Get instant quotes and same-day service availability for urgent projects.</p>
        </Card>
        
        <Card className="p-6 text-center bg-gradient-to-b from-accent/5 to-accent/10 border-accent/20 hover:shadow-xl transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8" />
          </div>
          <h5 className="font-bold mb-3">Precision Matching</h5>
          <p className="text-sm text-muted-foreground">AI-powered expert matching ensures you get the right specialist for your specific needs every time.</p>
        </Card>
        
        <Card className="p-6 text-center bg-gradient-to-b from-success/5 to-success/10 border-success/20 hover:shadow-xl transition-all duration-300">
          <div className="w-16 h-16 bg-gradient-to-br from-success to-success/80 text-success-foreground rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8" />
          </div>
          <h5 className="font-bold mb-3">Excellence Guaranteed</h5>
          <p className="text-sm text-muted-foreground">World-class standards with quality assurance and continuous support throughout your innovation journey.</p>
        </Card>
      </div>
    </div>
  );
};

export default ServiceDiagrams;