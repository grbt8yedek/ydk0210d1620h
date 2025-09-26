import { useEffect, useState, useMemo } from 'react';

export function useMonitoringAlert(timeframe: '1h' | '24h' | '7d' = '24h') {
  const [perf, setPerf] = useState<any>(null);
  const [sys, setSys] = useState<any>(null);
  const [errs, setErrs] = useState<any>(null);
  const [security, setSecurity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/monitoring/performance?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
      fetch(`/api/monitoring/system?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
      fetch(`/api/monitoring/errors?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
      fetch(`/api/monitoring/security?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
    ]).then(([p, s, e, sec]) => {
      setPerf(p?.data?.stats || null);
      setSys(s?.data?.stats || null);
      setErrs(e?.data?.stats || null);
      setSecurity(sec?.data?.stats || null);
      setLoading(false);
    });
  }, [timeframe]);

  const alertInfo = useMemo(() => {
    if (loading || !perf || !sys || !errs) {
      return { riskCount: 0, riskItems: [] };
    }

    const errorRate = (perf?.totalRequests || 0) > 0 ? 
      ((errs?.totalErrors || 0) / (perf?.totalRequests || 0)) * 100 : 0;

    const slo = {
      errorRate: { value: errorRate, ok: errorRate < 1 },
      lcp: { value: Math.round(perf?.averageLCP || 0), ok: (perf?.averageLCP || 0) < 2500 },
      resp: { value: Math.round(sys?.averageResponseTime || 0), ok: (sys?.averageResponseTime || 0) < 2000 },
      cpu: { value: Math.round(sys?.averageCpuUsage || 0), ok: (sys?.averageCpuUsage || 0) < 80 },
      mem: { value: Math.round(sys?.averageMemoryUsage || 0), ok: (sys?.averageMemoryUsage || 0) < 85 },
      security: { value: security?.securityScore || 100, ok: (security?.securityScore || 100) >= 70 },
    };

    const riskItems = [
      !slo.errorRate.ok && 'Error Rate (>1%)',
      !slo.lcp.ok && 'LCP (>=2500 ms)',
      !slo.resp.ok && 'Response Time (>=2000 ms)',
      !slo.cpu.ok && 'CPU (>=80%)',
      !slo.mem.ok && 'Memory (>=85%)',
      !slo.security.ok && 'Security Score (<70)',
    ].filter(Boolean) as string[];

    return {
      riskCount: riskItems.length,
      riskItems,
      loading
    };
  }, [perf, sys, errs, security, loading]);

  return alertInfo;
}
