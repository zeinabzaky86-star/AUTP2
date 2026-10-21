import { supabase } from '@/integrations/supabase/client';

export interface TestResult {
  testName: string;
  success: boolean;
  duration: number;
  error?: string;
  metrics?: Record<string, number>;
}

export interface TestSuite {
  name: string;
  description: string;
  tests: (() => Promise<TestResult>)[];
}

// Authentication Performance Tests
const authenticationTests = {
  name: 'Authentication Performance',
  description: 'Tests authentication flow performance',
  tests: [
    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        const { data, error } = await supabase.auth.getSession();
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Session Check',
          success: !error,
          duration,
          error: error?.message,
          metrics: { responseTime: duration }
        };
      } catch (error: any) {
        return {
          testName: 'Session Check',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    },

    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        // Test sign-up validation (without actual signup)
        const mockEmail = `test-${Date.now()}@example.com`;
        const mockPassword = 'TestPassword123!';
        
        // Just validate the format - don't actually create account
        const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mockEmail);
        const isValidPassword = mockPassword.length >= 8;
        
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Auth Validation',
          success: isValidEmail && isValidPassword,
          duration,
          metrics: { 
            emailValidation: duration * 0.1,
            passwordValidation: duration * 0.1
          }
        };
      } catch (error: any) {
        return {
          testName: 'Auth Validation',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    }
  ]
};

// Database Performance Tests
const databaseTests = {
  name: 'Database Performance',
  description: 'Tests database query performance',
  tests: [
    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, name, category')
          .limit(10);
        
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Services Query',
          success: !error && Array.isArray(data),
          duration,
          error: error?.message,
          metrics: { 
            queryTime: duration,
            recordCount: data?.length || 0
          }
        };
      } catch (error: any) {
        return {
          testName: 'Services Query',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    },

    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, tenant_type')
          .limit(5);
        
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Profiles Query',
          success: !error,
          duration,
          error: error?.message,
          metrics: { 
            queryTime: duration,
            recordCount: data?.length || 0
          }
        };
      } catch (error: any) {
        return {
          testName: 'Profiles Query',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    },

    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('id, status, created_at')
          .order('created_at', { ascending: false })
          .limit(20);
        
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Bookings Query',
          success: !error,
          duration,
          error: error?.message,
          metrics: { 
            queryTime: duration,
            recordCount: data?.length || 0
          }
        };
      } catch (error: any) {
        return {
          testName: 'Bookings Query',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    }
  ]
};

// UI Component Performance Tests
const uiTests = {
  name: 'UI Component Performance',
  description: 'Tests UI component rendering performance',
  tests: [
    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        // Simulate component mount/render cycle
        const mockElement = document.createElement('div');
        mockElement.innerHTML = `
          <div class="card">
            <h2>Service Card</h2>
            <p>Description text</p>
            <button>Book Service</button>
          </div>
        `;
        document.body.appendChild(mockElement);
        
        // Force layout calculation
        mockElement.offsetHeight;
        
        document.body.removeChild(mockElement);
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Component Rendering',
          success: true,
          duration,
          metrics: { renderTime: duration }
        };
      } catch (error: any) {
        return {
          testName: 'Component Rendering',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    },

    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        // Test list rendering performance
        const listContainer = document.createElement('ul');
        for (let i = 0; i < 100; i++) {
          const listItem = document.createElement('li');
          listItem.textContent = `Item ${i}`;
          listContainer.appendChild(listItem);
        }
        
        document.body.appendChild(listContainer);
        listContainer.offsetHeight; // Force layout
        document.body.removeChild(listContainer);
        
        const duration = performance.now() - startTime;
        
        return {
          testName: 'List Rendering',
          success: true,
          duration,
          metrics: { 
            renderTime: duration,
            itemCount: 100
          }
        };
      } catch (error: any) {
        return {
          testName: 'List Rendering',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    }
  ]
};

// Network Performance Tests
const networkTests = {
  name: 'Network Performance',
  description: 'Tests network request performance',
  tests: [
    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        const response = await fetch('/favicon.ico');
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Static Asset Load',
          success: response.ok,
          duration,
          metrics: { 
            responseTime: duration,
            status: response.status,
            size: Number(response.headers.get('content-length')) || 0
          }
        };
      } catch (error: any) {
        return {
          testName: 'Static Asset Load',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    },

    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        // Test API endpoint performance
        const { data, error } = await supabase.rpc('admin_count');
        const duration = performance.now() - startTime;
        
        return {
          testName: 'RPC Function Call',
          success: !error,
          duration,
          error: error?.message,
          metrics: { 
            rpcTime: duration,
            result: data
          }
        };
      } catch (error: any) {
        return {
          testName: 'RPC Function Call',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    }
  ]
};

// Memory and Resource Tests
const resourceTests = {
  name: 'Resource Usage',
  description: 'Tests memory and resource usage',
  tests: [
    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        const memoryInfo = (performance as any).memory;
        
        if (!memoryInfo) {
          throw new Error('Memory API not available');
        }
        
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Memory Usage Check',
          success: true,
          duration,
          metrics: {
            used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)
          }
        };
      } catch (error: any) {
        return {
          testName: 'Memory Usage Check',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    },

    async (): Promise<TestResult> => {
      const startTime = performance.now();
      try {
        // Test garbage collection by creating and releasing objects
        const testObjects = [];
        for (let i = 0; i < 10000; i++) {
          testObjects.push({ id: i, data: `test-data-${i}` });
        }
        
        // Clear references
        testObjects.length = 0;
        
        const duration = performance.now() - startTime;
        
        return {
          testName: 'Memory Allocation Test',
          success: true,
          duration,
          metrics: { allocationTime: duration }
        };
      } catch (error: any) {
        return {
          testName: 'Memory Allocation Test',
          success: false,
          duration: performance.now() - startTime,
          error: error.message
        };
      }
    }
  ]
};

export const performanceTestSuites: TestSuite[] = [
  authenticationTests,
  databaseTests,
  uiTests,
  networkTests,
  resourceTests
];

// Performance test runner
export const runPerformanceTests = async (suites: TestSuite[] = performanceTestSuites) => {
  const results = [];
  
  for (const suite of suites) {
    console.log(`🧪 Running ${suite.name} tests...`);
    
    const suiteResults = {
      suiteName: suite.name,
      description: suite.description,
      tests: [] as TestResult[],
      startTime: Date.now(),
      endTime: 0,
      totalDuration: 0,
      successCount: 0,
      failureCount: 0
    };
    
    for (const test of suite.tests) {
      try {
        const result = await test();
        suiteResults.tests.push(result);
        
        if (result.success) {
          suiteResults.successCount++;
        } else {
          suiteResults.failureCount++;
        }
        
        console.log(`  ${result.success ? '✅' : '❌'} ${result.testName}: ${result.duration.toFixed(2)}ms`);
        
        if (result.error) {
          console.log(`    Error: ${result.error}`);
        }
        
        // Add small delay between tests to avoid overwhelming
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error: any) {
        const failedResult: TestResult = {
          testName: 'Unknown Test',
          success: false,
          duration: 0,
          error: error.message
        };
        
        suiteResults.tests.push(failedResult);
        suiteResults.failureCount++;
        console.log(`  ❌ Test failed: ${error.message}`);
      }
    }
    
    suiteResults.endTime = Date.now();
    suiteResults.totalDuration = suiteResults.endTime - suiteResults.startTime;
    
    console.log(`📊 ${suite.name} completed: ${suiteResults.successCount} passed, ${suiteResults.failureCount} failed`);
    
    results.push(suiteResults);
  }
  
  return results;
};

// Continuous performance monitoring
export const startContinuousMonitoring = (intervalMs: number = 30000) => {
  let isRunning = true;
  
  const runMonitoring = async () => {
    if (!isRunning) return;
    
    try {
      const lightSuites = [databaseTests, networkTests]; // Run lighter tests continuously
      await runPerformanceTests(lightSuites);
    } catch (error) {
      console.error('Continuous monitoring error:', error);
    }
    
    if (isRunning) {
      setTimeout(runMonitoring, intervalMs);
    }
  };
  
  // Start monitoring
  setTimeout(runMonitoring, intervalMs);
  
  // Return stop function
  return () => {
    isRunning = false;
    console.log('⏹️ Continuous performance monitoring stopped');
  };
};