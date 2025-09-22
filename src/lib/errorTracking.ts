// Basit error tracking sistemi (Sentry alternatifi)

interface ErrorEvent {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  sessionId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

class ErrorTracker {
  private errors: ErrorEvent[] = [];
  private maxErrors = 1000;

  // Hata yakalama ve kaydetme
  track(error: Error, context?: {
    userId?: string;
    sessionId?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
    metadata?: Record<string, any>;
  }) {
    const errorEvent: ErrorEvent = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      userId: context?.userId,
      sessionId: context?.sessionId,
      severity: context?.severity || 'medium',
      metadata: context?.metadata
    };

    this.errors.push(errorEvent);

    // Eski hataları temizle
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Console'a logla (development için)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', errorEvent);
    }

    // Ana site monitoring API'sine gönder
    this.sendToMonitoringAPI(errorEvent);
  }

  // Monitoring API'sine gönderme
  private async sendToMonitoringAPI(errorEvent: ErrorEvent) {
    try {
      if (typeof window !== 'undefined') {
        await fetch('/api/monitoring/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timestamp: errorEvent.timestamp,
            errorType: errorEvent.message,
            errorMessage: errorEvent.message,
            stackTrace: errorEvent.stack,
            severity: errorEvent.severity.toUpperCase(),
            page: errorEvent.url,
            userId: errorEvent.userId,
            sessionId: errorEvent.sessionId,
            requestId: errorEvent.id,
            metadata: errorEvent.metadata
          })
        });
      }
    } catch (err) {
      console.error('Failed to send error to monitoring API:', err);
    }
  }

  // Hata listesini alma
  getErrors(limit?: number): ErrorEvent[] {
    return limit ? this.errors.slice(-limit) : this.errors;
  }

  // Kritik hataları alma
  getCriticalErrors(): ErrorEvent[] {
    return this.errors.filter(error => error.severity === 'critical');
  }

  // Hata istatistikleri
  getStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentErrors = this.errors.filter(error => 
      new Date(error.timestamp) >= last24h
    );

    return {
      total: this.errors.length,
      last24h: recentErrors.length,
      bySeverity: {
        low: recentErrors.filter(e => e.severity === 'low').length,
        medium: recentErrors.filter(e => e.severity === 'medium').length,
        high: recentErrors.filter(e => e.severity === 'high').length,
        critical: recentErrors.filter(e => e.severity === 'critical').length,
      },
      topErrors: this.getTopErrors(recentErrors),
      uniqueUsers: new Set(recentErrors.map(e => e.userId).filter(Boolean)).size
    };
  }

  // En çok tekrarlanan hatalar
  private getTopErrors(errors: ErrorEvent[]) {
    const errorCounts = errors.reduce((acc, error) => {
      const key = error.message;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));
  }

  // ID oluşturma
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Hataları temizleme
  clear() {
    this.errors = [];
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

// Global error handler
export function setupErrorTracking() {
  if (typeof window !== 'undefined') {
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      errorTracker.track(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'),
        {
          severity: 'high',
          metadata: { type: 'unhandledrejection', reason: event.reason }
        }
      );
    });

    // Uncaught errors
    window.addEventListener('error', (event) => {
      errorTracker.track(
        new Error(event.message),
        {
          severity: 'high',
          metadata: {
            type: 'uncaught',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    });
  }
}

// React Error Boundary için hook
export function useErrorTracking() {
  const trackError = (error: Error, context?: any) => {
    errorTracker.track(error, context);
  };

  return { trackError };
}
