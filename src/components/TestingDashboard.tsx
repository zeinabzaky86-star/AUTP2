import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { testingSuite, ComponentTest, TestResult } from '@/utils/testingSuite';
import { Play, CheckCircle, XCircle, Wrench, RotateCcw } from 'lucide-react';

export default function TestingDashboard() {
  const [testResults, setTestResults] = useState<ComponentTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [autoFixes, setAutoFixes] = useState<string[]>([]);

  const runTests = async () => {
    setIsRunning(true);
    try {
      const results = await testingSuite.runAllTests();
      setTestResults(results);
      setLastRun(new Date());
      
      // Generate and log the report
      const report = testingSuite.generateReport();
      console.log(report);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAutoFix = async () => {
    try {
      const fixes = await testingSuite.autoFix();
      setAutoFixes(fixes);
      
      // Re-run tests after fixes
      if (fixes.length > 0) {
        setTimeout(runTests, 1000);
      }
    } catch (error) {
      console.error('Auto-fix failed:', error);
    }
  };

  const calculateStats = () => {
    const totalTests = testResults.reduce((acc, suite) => acc + suite.tests.length, 0);
    const passedTests = testResults.reduce((acc, suite) => 
      acc + suite.tests.filter(test => test.passed).length, 0
    );
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    };
  };

  const stats = calculateStats();

  useEffect(() => {
    // Auto-run tests on component mount
    runTests();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AuTP Website Testing Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing suite for all website functionality
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            className="gap-2"
          >
            {isRunning ? (
              <RotateCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isRunning ? 'Running...' : 'Run Tests'}
          </Button>
          <Button 
            onClick={runAutoFix} 
            variant="outline"
            className="gap-2"
          >
            <Wrench className="w-4 h-4" />
            Auto-Fix
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
            <CardDescription>Total Tests</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-green-600">{stats.passed}</CardTitle>
            <CardDescription>Passed</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-red-600">{stats.failed}</CardTitle>
            <CardDescription>Failed</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{stats.successRate}%</CardTitle>
            <CardDescription>Success Rate</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Progress Bar */}
      {stats.total > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{stats.passed}/{stats.total}</span>
              </div>
              <Progress 
                value={stats.successRate} 
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-fix Results */}
      {autoFixes.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Auto-fixes applied:</strong>
            <ul className="mt-2 list-disc list-inside space-y-1">
              {autoFixes.map((fix, index) => (
                <li key={index} className="text-sm">{fix}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Test Results */}
      <div className="grid gap-4">
        {testResults.map((suite) => (
          <Card key={suite.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {suite.tests.every(test => test.passed) ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {suite.name}
                </CardTitle>
                <Badge variant={suite.tests.every(test => test.passed) ? 'default' : 'destructive'}>
                  {suite.tests.filter(test => test.passed).length}/{suite.tests.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suite.tests.map((test, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 rounded-lg border">
                    {test.passed ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{test.test}</p>
                      {test.error && (
                        <p className="text-red-600 text-xs mt-1">{test.error}</p>
                      )}
                      {test.details && (
                        <p className="text-muted-foreground text-xs mt-1">
                          {JSON.stringify(test.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Last Run Info */}
      {lastRun && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Last run: {lastRun.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}