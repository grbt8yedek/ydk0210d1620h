'use client';

import React, { useEffect, useState } from 'react';

export default function OpsAdminMonitorPage() {
  const [perf, setPerf] = useState<any>(null);
  const [sys, setSys] = useState<any>(null);
  const [errs, setErrs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/monitoring/performance?timeframe=24h').then(r => r.json()).catch(() => null),
      fetch('/api/monitoring/system?timeframe=24h').then(r => r.json()).catch(() => null),
      fetch('/api/monitoring/errors?timeframe=24h').then(r => r.json()).catch(() => null),
    ]).then(([p, s, e]) => {
      setPerf(p?.data?.stats || null);
      setSys(s?.data?.stats || null);
      setErrs(e?.data?.stats || null);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-4">Monitoring verileri yükleniyor...</div>;

  return (
    <div className="p-4 grid gap-4 md:grid-cols-2">
      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Sayfa Performansı (24h)</h2>
        <div>Avg Load: {Math.round((perf?.averageLoadTime || 0))} ms</div>
        <div>Avg FCP: {Math.round((perf?.averageFCP || 0))} ms</div>
        <div>Avg LCP: {Math.round((perf?.averageLCP || 0))} ms</div>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-semibold mb-2">Sistem (24h)</h2>
        <div>Avg CPU: {Math.round((sys?.averageCpuUsage || 0))}%</div>
        <div>Avg Memory: {Math.round((sys?.averageMemoryUsage || 0))}%</div>
        <div>Avg Resp Time: {Math.round((sys?.averageResponseTime || 0))} ms</div>
      </section>

      <section className="border rounded p-4 md:col-span-2">
        <h2 className="font-semibold mb-2">Hatalar (24h)</h2>
        <div>Toplam: {errs?.totalErrors || 0}</div>
        <div>Kritik: {errs?.criticalErrors || 0}</div>
        <div>Yüksek: {errs?.highErrors || 0}</div>
      </section>
    </div>
  );
}


