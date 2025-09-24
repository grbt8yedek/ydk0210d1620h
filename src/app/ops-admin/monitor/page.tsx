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

  const errorRate = useMemo(() => {
    const totalReq = perf?.totalRequests || 0;
    const totalErr = errs?.totalErrors || 0;
    return totalReq > 0 ? (totalErr / totalReq) * 100 : 0;
  }, [perf, errs]);

  const slo = useMemo(() => {
    const lcp = Math.round(perf?.averageLCP || 0);
    const resp = Math.round(sys?.averageResponseTime || 0);
    const cpu = Math.round(sys?.averageCpuUsage || 0);
    const mem = Math.round(sys?.averageMemoryUsage || 0);
    return {
      errorRate: { value: errorRate, ok: errorRate < 1 },
      lcp: { value: lcp, ok: lcp < 2500 },
      resp: { value: resp, ok: resp < 2000 },
      cpu: { value: cpu, ok: cpu < 80 },
      mem: { value: mem, ok: mem < 85 },
    };
  }, [errorRate, perf, sys]);

  const errTypes = useMemo(() => {
    const map = errs?.errorsByType || {};
    return Object.keys(map)
      .map(k => ({ type: k, count: map[k] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [errs]);

  const topErrorPages = useMemo(() => {
    return (errs?.topErrorPages || []).slice(0, 6);
  }, [errs]);

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

      {/* SLO / Sağlık Rozetleri */}
      <div className="grid gap-2 md:grid-cols-5">
        <div className={`border rounded p-2 ${slo.errorRate.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">Error Rate</div>
          <div className="text-sm">{errorRate.toFixed(2)}%</div>
        </div>
        <div className={`border rounded p-2 ${slo.lcp.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">LCP P50</div>
          <div className="text-sm">{Math.round(perf?.averageLCP || 0)} ms</div>
        </div>
        <div className={`border rounded p-2 ${slo.resp.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">Resp P50</div>
          <div className="text-sm">{Math.round(sys?.averageResponseTime || 0)} ms</div>
        </div>
        <div className={`border rounded p-2 ${slo.cpu.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">CPU Avg</div>
          <div className="text-sm">{Math.round(sys?.averageCpuUsage || 0)}%</div>
        </div>
        <div className={`border rounded p-2 ${slo.mem.ok ? 'border-green-300' : 'border-red-300'}`}>
          <div className="text-[10px] text-gray-500">Memory Avg</div>
          <div className="text-sm">{Math.round(sys?.averageMemoryUsage || 0)}%</div>
        </div>
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

      <div className="grid gap-3 md:grid-cols-2">
        <section className="border rounded p-3">
          <h2 className="font-medium mb-2">Hata Dağılımı (Türe Göre)</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Tür</th>
                <th className="py-1 w-16 text-right">Adet</th>
              </tr>
            </thead>
            <tbody>
              {errTypes.map((t) => (
                <tr key={t.type} className="border-t">
                  <td className="py-1 truncate max-w-[220px]">{t.type}</td>
                  <td className="py-1 text-right">{t.count}</td>
                </tr>
              ))}
              {errTypes.length === 0 && (
                <tr><td className="py-2 text-gray-500" colSpan={2}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </section>
        <section className="border rounded p-3">
          <h2 className="font-medium mb-2">En Çok Hata Veren Sayfalar</h2>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-1">Sayfa</th>
                <th className="py-1 w-16 text-right">Hata</th>
                <th className="py-1 w-20 text-right">Kritik</th>
              </tr>
            </thead>
            <tbody>
              {topErrorPages.map((p: any, i: number) => (
                <tr key={i} className="border-t">
                  <td className="py-1 truncate max-w-[220px]">{p.page}</td>
                  <td className="py-1 text-right">{p.count}</td>
                  <td className="py-1 text-right">{p.criticalCount}</td>
                </tr>
              ))}
              {topErrorPages.length === 0 && (
                <tr><td className="py-2 text-gray-500" colSpan={3}>Kayıt yok</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}


