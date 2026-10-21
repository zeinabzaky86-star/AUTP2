import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Zap, 
  Database, 
  Globe, 
  Monitor, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Shield,
  Smartphone
} from 'lucide-react';
import { PerformanceTestRunner } from '@/components/PerformanceTestRunner';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

const PerformanceTesting = () => {
  const { startMonitoring } = usePerformanceMonitoring();

  useEffect(() => {
    // Auto-start monitoring when page loads
    startMonitoring();
  }, [startMonitoring]);

  const testCategories = [
    {
      title: 'Authentication Performance',
      description: 'Tests login, signup, and session management performance',
      icon: <Shield className="h-5 w-5" />,
      metrics: ['Session validation', 'Auth flow timing', 'Token processing'],
      status: 'ready'
    },
    {
      title: 'Database Operations',
      description: 'Evaluates Supabase query performance and data processing',
      icon: <Database className="h-5 w-5" />,
      metrics: ['Query execution', 'Data fetching', 'Real-time subscriptions'],
      status: 'ready'
    },
    {
      title: 'UI Component Rendering',
      description: 'Measures React component performance and rendering efficiency',
      icon: <Monitor className="h-5 w-5" />,
      metrics: ['Component mount time', 'Re-render frequency', 'Virtual DOM updates'],
      status: 'ready'
    },
    {
      title: 'Network & API Performance',
      description: 'Tests API response times and network resource loading',
      icon: <Globe className="h-5 w-5" />,
      metrics: ['API response time', 'Asset loading', 'CDN performance'],
      status: 'ready'
    },
    {
      title: 'Resource Usage',
      description: 'Monitors memory consumption and system resource utilization',
      icon: <Activity className="h-5 w-5" />,
      metrics: ['Memory usage', 'CPU utilization', 'Garbage collection'],
      status: 'ready'
    },
    {
      title: 'User Experience Metrics',
      description: 'Tracks Core Web Vitals and user interaction performance',
      icon: <Users className="h-5 w-5" />,
      metrics: ['LCP', 'FID/INP', 'CLS', 'TTFB', 'FCP'],
      status: 'ready'
    }
  ];

  const performanceRecommendations = [
    {
      category: 'Frontend Optimization',
      recommendations: [
        'Implement code splitting for large components',
        'Use React.memo for expensive components',
        'Optimize image loading with lazy loading',
        'Minimize bundle size with tree shaking'
      ]
    },
    {
      category: 'Backend Performance',
      recommendations: [
        'Optimize database queries with proper indexing',
        'Implement caching strategies',
        'Use connection pooling for database',
        'Monitor and optimize RPC function calls'
      ]
    },
    {
      category: 'User Experience',
      recommendations: [
        'Implement skeleton loading states',
        'Add progressive enhancement',
        'Optimize critical rendering path',
        'Use service workers for caching'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              Professional Performance Testing
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive performance analysis of all Alexandria University Technology Park 
              platform functions, components, and user workflows.
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="default" className="bg-gradient-lighthouse text-primary-foreground">
                <Activity className="h-3 w-3 mr-1" />
                Real-time Monitoring
              </Badge>
              <Badge variant="outline">
                <TrendingUp className="h-3 w-3 mr-1" />
                Web Vitals Tracking
              </Badge>
              <Badge variant="outline">
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile Optimized
              </Badge>
            </div>
          </div>

          {/* Test Categories Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Testing Categories
              </CardTitle>
              <CardDescription>
                Comprehensive performance evaluation across all system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testCategories.map((category, index) => (
                  <Card key={index} className="border-l-4 border-l-accent">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <CardTitle className="text-base">{category.title}</CardTitle>
                        </div>
                        <Badge variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-foreground">Key Metrics:</p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {category.metrics.map((metric, metricIndex) => (
                            <li key={metricIndex} className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-accent rounded-full"></div>
                              {metric}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Test Runner */}
          <PerformanceTestRunner />

          {/* Performance Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Performance Optimization Recommendations
              </CardTitle>
              <CardDescription>
                Best practices to improve application performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {performanceRecommendations.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-semibold text-foreground">{section.category}</h3>
                    <ul className="space-y-2">
                      {section.recommendations.map((recommendation, recIndex) => (
                        <li key={recIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <AlertTriangle className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Testing Methodology */}
          <Card>
            <CardHeader>
              <CardTitle>Testing Methodology</CardTitle>
              <CardDescription>
                Our comprehensive approach to performance evaluation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Automated Testing</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Core Web Vitals monitoring (LCP, FID/INP, CLS)</li>
                      <li>• Database query performance benchmarking</li>
                      <li>• Component render time measurement</li>
                      <li>• Network request timing analysis</li>
                      <li>• Memory usage and leak detection</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Real-time Monitoring</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Live performance metrics tracking</li>
                      <li>• User interaction timing</li>
                      <li>• Resource loading performance</li>
                      <li>• JavaScript execution profiling</li>
                      <li>• Mobile performance optimization</li>
                    </ul>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Performance Scoring</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 border border-border rounded-lg">
                      <div className="text-green-600 font-semibold">90-100%</div>
                      <div className="text-muted-foreground">Excellent</div>
                    </div>
                    <div className="text-center p-3 border border-border rounded-lg">
                      <div className="text-blue-600 font-semibold">75-89%</div>
                      <div className="text-muted-foreground">Good</div>
                    </div>
                    <div className="text-center p-3 border border-border rounded-lg">
                      <div className="text-yellow-600 font-semibold">60-74%</div>
                      <div className="text-muted-foreground">Fair</div>
                    </div>
                    <div className="text-center p-3 border border-border rounded-lg">
                      <div className="text-red-600 font-semibold">0-59%</div>
                      <div className="text-muted-foreground">Poor</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTesting;