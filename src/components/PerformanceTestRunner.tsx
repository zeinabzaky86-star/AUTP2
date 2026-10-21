import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Square, 
  Download, 
  RefreshCw, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Zap,
  Database,
  Globe,
  Monitor
} from 'lucide-react';
import { runPerformanceTests, performanceTestSuites, TestResult } from '@/utils/performanceTestSuites';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { PerformanceMonitor } from './PerformanceMonitor';

interface TestSuiteResult {
  suiteName: string;
  description: string;
  tests: TestResult[];
  startTime: number;
  endTime: number;
  totalDuration: number;
  successCount: number;
  failureCount: number;
}

export const PerformanceTestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestSuiteResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [showMonitor, setShowMonitor] = useState(false);
  
  const { startMonitoring, stopMonitoring, isMonitoring, getPerformanceReport } = usePerformanceMonitoring();

  const runTests = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Initializing tests...');
    
    try {
      const testResults = await runPerformanceTests(performanceTestSuites);
      setResults(testResults);
      setProgress(100);
      setCurrentTest('Tests completed!');
    } catch (error) {
      console.error('Error running tests:', error);
      setCurrentTest('Tests failed!');
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickTest = async () => {
    setIsRunning(true);
    setProgress(0);
    setCurrentTest('Running quick performance check...');
    
    try {
      // Run only essential tests for quick feedback
      const quickSuites = performanceTestSuites.slice(0, 2); // Auth and DB tests
      const testResults = await runPerformanceTests(quickSuites);
      setResults(testResults);
      setProgress(100);
      setCurrentTest('Quick test completed!');
    } catch (error) {
      console.error('Error running quick test:', error);
      setCurrentTest('Quick test failed!');
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    const exportData = {
      timestamp: Date.now(),
      testResults: results,
      performanceReport: getPerformanceReport()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getTestIcon = (suiteName: string) => {
    if (suiteName.includes('Authentication')) return <Zap className="h-4 w-4" />;
    if (suiteName.includes('Database')) return <Database className="h-4 w-4" />;
    if (suiteName.includes('Network')) return <Globe className="h-4 w-4" />;
    if (suiteName.includes('UI')) return <Monitor className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getOverallScore = () => {
    if (results.length === 0) return null;
    
    const totalTests = results.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = results.reduce((sum, suite) => sum + suite.successCount, 0);
    const score = Math.round((totalPassed / totalTests) * 100);
    
    return {
      score,
      status: score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'poor',
      totalTests,
      totalPassed,
      totalFailed: totalTests - totalPassed
    };
  };

  const overallScore = getOverallScore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Test Suite
              </CardTitle>
              <CardDescription>
                Comprehensive testing of all application functions and performance metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMonitor(!showMonitor)}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Monitor
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="bg-gradient-lighthouse text-primary-foreground hover:opacity-90"
            >
              {isRunning ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? 'Running Tests...' : 'Run Full Test Suite'}
            </Button>
            
            <Button
              variant="outline"
              onClick={runQuickTest}
              disabled={isRunning}
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Test
            </Button>

            {results.length > 0 && (
              <Button
                variant="outline"
                onClick={exportResults}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setResults([])}
              disabled={isRunning}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">{currentTest}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {overallScore && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Overall Performance Score</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on {overallScore.totalTests} performance tests
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      overallScore.status === 'excellent' ? 'text-green-600' :
                      overallScore.status === 'good' ? 'text-blue-600' :
                      overallScore.status === 'fair' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {overallScore.score}%
                    </div>
                    <Badge variant={overallScore.status === 'excellent' || overallScore.status === 'good' ? 'default' : 'destructive'}>
                      {overallScore.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                  <div className="text-center">
                    <div className="text-green-600 font-semibold">{overallScore.totalPassed}</div>
                    <div className="text-muted-foreground">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-red-600 font-semibold">{overallScore.totalFailed}</div>
                    <div className="text-muted-foreground">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-foreground font-semibold">{overallScore.totalTests}</div>
                    <div className="text-muted-foreground">Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Tabs defaultValue="summary" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((suite, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTestIcon(suite.suiteName)}
                        <CardTitle className="text-base">{suite.suiteName}</CardTitle>
                      </div>
                      <Badge variant={suite.failureCount === 0 ? 'default' : 'destructive'}>
                        {suite.successCount}/{suite.tests.length}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{suite.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Duration:</span>
                        <span className="font-medium">{suite.totalDuration}ms</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Passed:</span>
                        <span className="font-medium text-green-600">{suite.successCount}</span>
                      </div>
                      {suite.failureCount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-red-600">Failed:</span>
                          <span className="font-medium text-red-600">{suite.failureCount}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-4">
            {results.map((suite, suiteIndex) => (
              <Card key={suiteIndex}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTestIcon(suite.suiteName)}
                    {suite.suiteName}
                  </CardTitle>
                  <CardDescription>{suite.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {suite.tests.map((test, testIndex) => (
                      <div 
                        key={testIndex}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {test.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{test.testName}</p>
                            {test.error && (
                              <p className="text-sm text-red-600">{test.error}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{test.duration.toFixed(2)}ms</p>
                          {test.metrics && Object.keys(test.metrics).length > 0 && (
                            <p className="text-muted-foreground">
                              {Object.keys(test.metrics).length} metrics
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {results.map((suite, suiteIndex) => (
                suite.tests
                  .filter(test => test.metrics && Object.keys(test.metrics).length > 0)
                  .map((test, testIndex) => (
                    <Card key={`${suiteIndex}-${testIndex}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{test.testName}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {test.metrics && Object.entries(test.metrics).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{key}:</span>
                              <span className="font-medium">
                                {typeof value === 'number' ? 
                                  (key.includes('Time') || key.includes('Duration') ? `${value.toFixed(2)}ms` : 
                                   key.includes('Size') || key.includes('Count') ? value.toLocaleString() :
                                   value.toString()) : 
                                  String(value)
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      <PerformanceMonitor isOpen={showMonitor} onClose={() => setShowMonitor(false)} />
    </div>
  );
};