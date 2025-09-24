'use client';

import React, { useEffect, useMemo, useState } from 'react';

export default function OpsAdminMonitorPage() {
  const [timeframe, setTimeframe] = useState<'1h' | '24h' | '7d'>('24h');
  const [perf, setPerf] = useState<any>(null);
  const [sys, setSys] = useState<any>(null);
  const [errs, setErrs] = useState<any>(null);
  const [perfRaw, setPerfRaw] = useState<any[]>([]);
  const [errsRaw, setErrsRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/monitoring/performance?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
      fetch(`/api/monitoring/system?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
      fetch(`/api/monitoring/errors?timeframe=${timeframe}`).then(r => r.json()).catch(() => null),
    ]).then(([p, s, e]) => {
      setPerf(p?.data?.stats || null);
      setPerfRaw(p?.data?.recentMetrics || []);
      setSys(s?.data?.stats || null);
      setErrs(e?.data?.stats || null);
      setErrsRaw(e?.data?.recentErrors || []);
      setLoading(false);
    });
  }, [timeframe]);

  const slowPages = useMemo(() => {
    const arr: Array<{ page: string; avg: number }> = [];
    (perf?.slowestPages || []).forEach((p: any) => arr.push({ page: p.page, avg: Math.round(p.avgTime) }));
    return arr.slice(0, 8);
  }, [perf]);

  if (loading) return <div className="p-4">Monitoring verileri yükleniyor...</div>;

  return (
    <div className="p-4 space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold">Monitor</h1>
        <select className="border rounded px-2 py-1 text-xs" value={timeframe} onChange={e => setTimeframe(e.target.value as any)}>
          <option value="1h">1 saat</option>
          <option value="24h">24 saat</option>
          <option value="7d">7 gün</option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Avg Load</div>
          <div className="text-lg">{Math.round(perf?.averageLoadTime || 0)} ms</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Avg FCP</div>
          <div className="text-lg">{Math.round(perf?.averageFCP || 0)} ms</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Avg LCP</div>
          <div className="text-lg">{Math.round(perf?.averageLCP || 0)} ms</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Avg CPU</div>
          <div className="text-lg">{Math.round(sys?.averageCpuUsage || 0)}%</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Avg Memory</div>
          <div className="text-lg">{Math.round(sys?.averageMemoryUsage || 0)}%</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-xs text-gray-500">Avg Resp Time</div>
          <div className="text-lg">{Math.round(sys?.averageResponseTime || 0)} ms</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">En Yavaş Sayfalar</h2>
            <span className="text-xs text-gray-500">top {slowPages.length}</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Sayfa</th>
                <th className="py-1 w-24 text-right">Ort. (ms)</th>
              </tr>
            </thead>
            <tbody>
              {slowPages.map((p) => (
                <tr key={p.page} className="border-t">
                  <td className="py-1 truncate max-w-[240px]">{p.page}</td>
                  <td className="py-1 text-right">{p.avg}</td>
                </tr>
              ))}
              {slowPages.length === 0 && (
                <tr><td className="py-2 text-gray-500" colSpan={2}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="border rounded p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Kritik Hatalar (son 24s)</h2>
            <span className="text-xs text-gray-500">{errs?.criticalErrors || 0}</span>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Tip</th>
                <th className="py-1">Sayfa</th>
                <th className="py-1 w-24">Seviye</th>
              </tr>
            </thead>
            <tbody>
              {errsRaw
                .filter((e: any) => e.severity === 'CRITICAL')
                .slice(-10)
                .reverse()
                .map((e: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 truncate max-w-[160px]">{e.errorType}</td>
                    <td className="py-1 truncate max-w-[180px]">{e.page || '-'}</td>
                    <td className="py-1 text-xs">{e.severity}</td>
                  </tr>
                ))}
              {(!errsRaw || errsRaw.filter((e: any) => e.severity === 'CRITICAL').length === 0) && (
                <tr><td className="py-2 text-gray-500" colSpan={3}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}


