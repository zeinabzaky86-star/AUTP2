import { useEffect, useState, useCallback } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdate: number;
}

interface PerformanceData {
  webVitals: PerformanceMetric[];
  componentMetrics: ComponentPerformance[];
  navigationTiming: PerformanceNavigationTiming | null;
  userAgent: string;
  connectionType: string;
}

export const usePerformanceMonitoring = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    webVitals: [],
    componentMetrics: [],
    navigationTiming: null,
    userAgent: navigator.userAgent,
    connectionType: (navigator as any).connection?.effectiveType || 'unknown'
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Web Vitals monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const handleMetric = (metric: any) => {
      let rating: 'good' | 'needs-improvement' | 'poor';
      
      // Define thresholds based on Web Vitals standards
      switch (metric.name) {
        case 'CLS':
          rating = metric.value <= 0.1 ? 'good' : metric.value <= 0.25 ? 'needs-improvement' : 'poor';
          break;
        case 'INP':
          rating = metric.value <= 200 ? 'good' : metric.value <= 500 ? 'needs-improvement' : 'poor';
          break;
        case 'FCP':
          rating = metric.value <= 1800 ? 'good' : metric.value <= 3000 ? 'needs-improvement' : 'poor';
          break;
        case 'LCP':
          rating = metric.value <= 2500 ? 'good' : metric.value <= 4000 ? 'needs-improvement' : 'poor';
          break;
        case 'TTFB':
          rating = metric.value <= 800 ? 'good' : metric.value <= 1800 ? 'needs-improvement' : 'poor';
          break;
        default:
          rating = 'good';
      }

      const performanceMetric: PerformanceMetric = {
        name: metric.name,
        value: metric.value,
        rating,
        timestamp: Date.now()
      };

      setPerformanceData(prev => ({
        ...prev,
        webVitals: [...prev.webVitals, performanceMetric]
      }));
    };

    // Collect Web Vitals
    onCLS(handleMetric);
    onINP(handleMetric);
    onFCP(handleMetric);
    onLCP(handleMetric);
    onTTFB(handleMetric);

    // Navigation timing
    if (performance.getEntriesByType) {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      setPerformanceData(prev => ({
        ...prev,
        navigationTiming: navTiming
      }));
    }

  }, [isMonitoring]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    console.log('🔍 Performance monitoring started');
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    console.log('⏹️ Performance monitoring stopped');
  }, []);

  const trackComponentPerformance = useCallback((componentName: string, renderTime: number, mountTime: number = 0) => {
    if (!isMonitoring) return;

    setPerformanceData(prev => {
      const existingIndex = prev.componentMetrics.findIndex(c => c.componentName === componentName);
      
      if (existingIndex >= 0) {
        const updated = [...prev.componentMetrics];
        updated[existingIndex] = {
          ...updated[existingIndex],
          renderTime,
          updateCount: updated[existingIndex].updateCount + 1,
          lastUpdate: Date.now()
        };
        return { ...prev, componentMetrics: updated };
      } else {
        return {
          ...prev,
          componentMetrics: [...prev.componentMetrics, {
            componentName,
            renderTime,
            mountTime,
            updateCount: 1,
            lastUpdate: Date.now()
          }]
        };
      }
    });
  }, [isMonitoring]);

  const measureAsyncOperation = useCallback(async <T,>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<{ result: T; duration: number }> => {
    const startTime = performance.now();
    const result = await operation();
    const duration = performance.now() - startTime;
    
    if (isMonitoring) {
      console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  }, [isMonitoring]);

  const measureSyncOperation = useCallback(<T,>(
    operationName: string,
    operation: () => T
  ): { result: T; duration: number } => {
    const startTime = performance.now();
    const result = operation();
    const duration = performance.now() - startTime;
    
    if (isMonitoring) {
      console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
    }
    
    return { result, duration };
  }, [isMonitoring]);

  const getPerformanceReport = useCallback(() => {
    const report = {
      timestamp: Date.now(),
      webVitals: performanceData.webVitals,
      componentMetrics: performanceData.componentMetrics,
      navigationTiming: performanceData.navigationTiming,
      userAgent: performanceData.userAgent,
      connectionType: performanceData.connectionType,
      memoryUsage: (performance as any).memory ? {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit
      } : null,
      resourceTiming: performance.getEntriesByType('resource').slice(-20) // Last 20 resources
    };

    return report;
  }, [performanceData]);

  const clearMetrics = useCallback(() => {
    setPerformanceData({
      webVitals: [],
      componentMetrics: [],
      navigationTiming: null,
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown'
    });
  }, []);

  return {
    performanceData,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    trackComponentPerformance,
    measureAsyncOperation,
    measureSyncOperation,
    getPerformanceReport,
    clearMetrics
  };
};

// Higher-order component for automatic performance tracking
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    const { trackComponentPerformance, isMonitoring } = usePerformanceMonitoring();
    const [mountTime] = useState(performance.now());

    useEffect(() => {
      if (isMonitoring) {
        const renderTime = performance.now() - mountTime;
        trackComponentPerformance(componentName, renderTime, mountTime);
      }
    });

    return <WrappedComponent {...props} />;
  };
}