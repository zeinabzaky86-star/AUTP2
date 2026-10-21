import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Clock, 
  Zap, 
  Monitor, 
  Download,
  Play,
  Square,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { usePerformanceMonitoring, PerformanceMetric, ComponentPerformance } from '@/hooks/usePerformanceMonitoring';

interface PerformanceMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceMonitor = ({ isOpen, onClose }: PerformanceMonitorProps) => {
  const { 
    performanceData, 
    isMonitoring, 
    startMonitoring, 
    stopMonitoring, 
    getPerformanceReport,
    clearMetrics 
  } = usePerformanceMonitoring();

  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen && isMonitoring) {
      const interval = setInterval(() => {
        // Force re-render to update real-time data
        setRefreshInterval(Date.now() as any);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen, isMonitoring]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600';
      case 'needs-improvement':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Monitor className="h-4 w-4 text-gray-600" />;
    }
  };

  const downloadReport = () => {
    const report = getPerformanceReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getMemoryUsage = () => {
    if ((performance as any).memory) {
      const memory = (performance as any).memory;
      const used = Math.round(memory.usedJSHeapSize / 1024 / 1024);
      const total = Math.round(memory.totalJSHeapSize / 1024 / 1024);
      const limit = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
      return { used, total, limit, percentage: (used / limit) * 100 };
    }
    return null;
  };

  const memoryUsage = getMemoryUsage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Monitor
                <Badge variant={isMonitoring ? "default" : "secondary"}>
                  {isMonitoring ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
              <CardDescription>
                Real-time performance metrics and Web Vitals monitoring
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isMonitoring ? 'Stop' : 'Start'}
              </Button>
              <Button variant="outline" size="sm" onClick={clearMetrics}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button variant="outline" size="sm" onClick={downloadReport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="vitals" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="vitals" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {performanceData.webVitals.map((metric, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                        {getRatingIcon(metric.rating)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${getRatingColor(metric.rating)}`}>
                        {metric.value.toFixed(2)}
                        {metric.name === 'CLS' ? '' : 'ms'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </p>
                      <Badge 
                        variant={metric.rating === 'good' ? 'default' : 'destructive'} 
                        className="mt-2 text-xs"
                      >
                        {metric.rating.replace('-', ' ')}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {performanceData.webVitals.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No Web Vitals data collected yet. Start monitoring to see metrics.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="components" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {performanceData.componentMetrics
                  .sort((a, b) => b.renderTime - a.renderTime)
                  .map((component, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{component.componentName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Render Time:</span>
                          <p className="font-semibold">{component.renderTime.toFixed(2)}ms</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mount Time:</span>
                          <p className="font-semibold">{component.mountTime.toFixed(2)}ms</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Updates:</span>
                          <p className="font-semibold">{component.updateCount}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Update:</span>
                          <p className="font-semibold text-xs">
                            {new Date(component.lastUpdate).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {performanceData.componentMetrics.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No component metrics collected yet.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <div className="space-y-4">
                {performance.getEntriesByType('resource').slice(-10).map((resource: any, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate flex-1">
                          {resource.name.split('/').pop()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {resource.initiatorType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-semibold">{resource.duration.toFixed(2)}ms</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <p className="font-semibold">
                            {resource.transferSize ? `${(resource.transferSize / 1024).toFixed(1)}KB` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-semibold">{resource.initiatorType}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Memory Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {memoryUsage ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Used: {memoryUsage.used}MB</span>
                          <span>Limit: {memoryUsage.limit}MB</span>
                        </div>
                        <Progress 
                          value={memoryUsage.percentage} 
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          {memoryUsage.percentage.toFixed(1)}% of available memory
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Memory usage not available in this browser
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Connection Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-semibold">{performanceData.connectionType}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">User Agent:</span>
                        <p className="font-semibold text-xs break-all">
                          {performanceData.userAgent.substring(0, 50)}...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {performanceData.navigationTiming && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Navigation Timing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">DNS Lookup:</span>
                        <p className="font-semibold">
                          {(performanceData.navigationTiming.domainLookupEnd - 
                            performanceData.navigationTiming.domainLookupStart).toFixed(2)}ms
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Connection:</span>
                        <p className="font-semibold">
                          {(performanceData.navigationTiming.connectEnd - 
                            performanceData.navigationTiming.connectStart).toFixed(2)}ms
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response:</span>
                        <p className="font-semibold">
                          {(performanceData.navigationTiming.responseEnd - 
                            performanceData.navigationTiming.responseStart).toFixed(2)}ms
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">DOM Complete:</span>
                        <p className="font-semibold">
                          {performanceData.navigationTiming.domComplete.toFixed(2)}ms
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};