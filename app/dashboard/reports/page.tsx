'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Layers,
  MapPin,
  TrendingUp,
  Building2,
  Loader2,
} from 'lucide-react';

export default function WeeklyReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/weekly')
      .then((res) => res.json())
      .then((data) => setReports(data.reports || []))
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-24 p-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500">Compiling weekly departmental analytics and SLAs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Weekly Department Civic Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              Week of {new Date().toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed performance breakdown, resolution velocity, and recurring locality clusters across all 15 BMC departments.
          </p>
        </div>
      </div>

      {/* Department Cards Grid (Requirement #15) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((dept) => (
          <div
            key={dept.departmentCode}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            {/* Header */}
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">{dept.departmentName}</h3>
                  <span className="text-xs text-slate-400 font-medium">{dept.nameHindi}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                  {dept.departmentCode}
                </span>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-3 text-center">
                <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Received</span>
                  <span className="text-lg font-bold text-blue-900">{dept.receivedCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Resolved</span>
                  <span className="text-lg font-bold text-emerald-900">{dept.resolvedCount}</span>
                </div>
                <div className="p-2 rounded-lg bg-amber-50/50 border border-amber-100">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending</span>
                  <span className="text-lg font-bold text-amber-900">{dept.pendingCount}</span>
                </div>
              </div>

              {/* Resolution Time & Priority */}
              <div className="flex items-center justify-between text-xs pt-3 text-slate-600 border-t border-slate-100 mt-3">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  Median Time: <strong>{dept.medianResolutionDays} days</strong>
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-semibold">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  High Priority: {dept.highPriorityCount}
                </span>
              </div>
            </div>

            {/* Top Affected Localities */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                Top Affected Localities
              </span>
              {dept.topLocalities && dept.topLocalities.length > 0 ? (
                <div className="space-y-1">
                  {dept.topLocalities.slice(0, 3).map((loc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span className="truncate max-w-[180px]">
                        {idx + 1}. {loc.locality}
                      </span>
                      <span className="font-semibold text-slate-900">{loc.count} complaints</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400 text-[11px]">No complaints reported.</span>
              )}
            </div>

            {/* Repeat Complaint Clusters */}
            {dept.repeatClusters && dept.repeatClusters.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700">
                <span className="font-bold text-slate-900 block mb-0.5">Repeat Cluster:</span>
                <span>
                  {dept.repeatClusters[0].locality} — {dept.repeatClusters[0].count} repeat complaints
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
