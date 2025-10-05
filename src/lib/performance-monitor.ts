import { logger } from '@/lib/logger';

export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static startTimer(label: string): () => void {
    const start = Date.now();
    return () => {
      const duration = Date.now() - start;
      this.recordMetric(label, duration);
    };
  }

  static recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }

    // Log slow queries
    if (value > 1000) { // > 1 second
      logger.warn(`Slow query detected: ${label} took ${value}ms`);
    }
  }

  static getStats(label: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return null;

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { avg, min, max, count: values.length };
  }

  static getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    for (const [label] of this.metrics) {
      stats[label] = this.getStats(label);
    }
    return stats;
  }
}

// Database query wrapper with monitoring
export function withPerformanceMonitoring<T>(
  label: string,
  query: () => Promise<T>
): Promise<T> {
  const endTimer = PerformanceMonitor.startTimer(label);
  return query().finally(endTimer);
}

export default PerformanceMonitor;
