'use client'

import { useEffect, useMemo, useState } from 'react'

export default function AlertBadge() {
  const [open, setOpen] = useState(false)
  const [perf, setPerf] = useState<any>(null)
  const [sys, setSys] = useState<any>(null)
  const [errs, setErrs] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/monitoring/performance?timeframe=24h').then(r => r.json()).catch(() => null),
      fetch('/api/monitoring/system?timeframe=24h').then(r => r.json()).catch(() => null),
      fetch('/api/monitoring/errors?timeframe=24h').then(r => r.json()).catch(() => null),
    ]).then(([p, s, e]) => {
      setPerf(p?.data?.stats || null)
      setSys(s?.data?.stats || null)
      setErrs(e?.data?.stats || null)
    })
  }, [])

  const errorRate = useMemo(() => {
    const totalReq = perf?.totalRequests || 0
    const totalErr = errs?.totalErrors || 0
    return totalReq > 0 ? (totalErr / totalReq) * 100 : 0
  }, [perf, errs])

  const risks = useMemo(() => {
    if (!perf || !sys || !errs) return [] as string[]
    return [
      !(errorRate < 1) && `Error Rate ${errorRate.toFixed(2)}% (>1%)`,
      !(Math.round(perf?.averageLCP || 0) < 2500) && `LCP ${Math.round(perf?.averageLCP || 0)} ms (>=2500)`,
      !(Math.round(sys?.averageResponseTime || 0) < 2000) && `Response ${Math.round(sys?.averageResponseTime || 0)} ms (>=2000)`,
      !(Math.round(sys?.averageCpuUsage || 0) < 80) && `CPU ${Math.round(sys?.averageCpuUsage || 0)}% (>=80%)`,
      !(Math.round(sys?.averageMemoryUsage || 0) < 85) && `Memory ${Math.round(sys?.averageMemoryUsage || 0)}% (>=85%)`,
    ].filter(Boolean) as string[]
  }, [perf, sys, errs, errorRate])

  if (!perf || !sys || !errs) return null

  return (
    <div className="mt-1">
      {risks.length > 0 && (
        <button
          onClick={() => setOpen(true)}
          className="text-xs px-2 py-0.5 rounded border border-red-400 text-red-700 hover:bg-red-50"
          aria-label={`Uyarı: ${risks.length}`}
        >
          Uyarı: {risks.length}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded shadow border w-full max-w-sm p-3 text-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">Riskli Birimler</div>
              <button className="text-xs text-gray-600 hover:underline" onClick={() => setOpen(false)}>Kapat</button>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {risks.map(r => <li key={r} className="text-red-700">{r}</li>)}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}


