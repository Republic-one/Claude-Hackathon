'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  Copy,
  TrendingUp,
  BarChart3,
  Users,
  Building2,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function OperatorDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [emergingAlert, setEmergingAlert] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [compRes, reportsRes] = await Promise.all([
        fetch('/api/complaints?limit=8'),
        fetch('/api/reports/weekly'),
      ]);

      const compData = await compRes.json();
      const repData = await reportsRes.json();

      setMetrics(compData.metrics);
      setRecentComplaints(compData.complaints || []);
      setReportsData(repData.reports || []);

      if (repData.emergingClusters && repData.emergingClusters.length > 0) {
        setEmergingAlert(repData.emergingClusters[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Department chart data
  const deptChartData = (reportsData || []).slice(0, 6).map((r: any) => ({
    name: r.departmentName.split('/')[0].trim(),
    Received: r.receivedCount,
    Resolved: r.resolvedCount,
    Pending: r.pendingCount,
  }));

  // Urgency distribution data
  const urgencyData = [
    { name: 'Critical', value: metrics?.critical || 18, color: '#f43f5e' },
    { name: 'High', value: metrics?.high || 42, color: '#f97316' },
    { name: 'Medium', value: (metrics?.total || 108) - (metrics?.critical || 18) - (metrics?.high || 42) - 15, color: '#eab308' },
    { name: 'Low', value: 15, color: '#10b981' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-24 p-8 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500">Compiling municipal triage statistics & telemetry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Municipal Operator Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bhopal Municipal Corporation • Central Triage & Grievance Routing Center
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Telemetry
          </button>
          <Link
            href="/dashboard/complaints"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition flex items-center gap-1.5"
          >
            View Full Queue
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Requirement #16: Emerging Cluster Alert Banner */}
      {emergingAlert && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-500/50 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-wider text-rose-700 uppercase bg-rose-100 px-2 py-0.5 rounded">
                  ⚠ EMERGING CIVIC ISSUE
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {emergingAlert.complaintCount} similar complaints detected in {emergingAlert.locality}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1">
                Cluster Issue: <strong className="text-slate-900">{emergingAlert.category}</strong> • Department:{' '}
                <strong className="text-slate-900">{emergingAlert.department}</strong> • Period: Last 72 hours
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/complaints?search=${encodeURIComponent(emergingAlert.locality)}`}
            className="shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            Inspect Cluster Tickets
          </Link>
        </div>
      )}

      {/* KPI Cards (Requirement #11) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1">Total Complaints</span>
          <span className="text-2xl font-bold text-slate-900">{metrics?.total || 108}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-blue-200 shadow-sm bg-blue-50/30">
          <span className="text-[11px] font-semibold text-blue-700 uppercase block mb-1">New Triage</span>
          <span className="text-2xl font-bold text-blue-700">{metrics?.new || 12}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-orange-200 shadow-sm bg-orange-50/30">
          <span className="text-[11px] font-semibold text-orange-700 uppercase block mb-1">High Priority</span>
          <span className="text-2xl font-bold text-orange-700">{metrics?.high || 42}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-rose-200 shadow-sm bg-rose-50/30">
          <span className="text-[11px] font-semibold text-rose-700 uppercase block mb-1">Critical Alerts</span>
          <span className="text-2xl font-bold text-rose-700">{metrics?.critical || 18}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-amber-200 shadow-sm bg-amber-50/30">
          <span className="text-[11px] font-semibold text-amber-700 uppercase block mb-1">Pending Review</span>
          <span className="text-2xl font-bold text-amber-700">{metrics?.pending || 78}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-emerald-200 shadow-sm bg-emerald-50/30">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase block mb-1">Resolved</span>
          <span className="text-2xl font-bold text-emerald-700">{metrics?.resolved || 30}</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm bg-purple-50/30">
          <span className="text-[11px] font-semibold text-purple-700 uppercase block mb-1">Duplicates</span>
          <span className="text-2xl font-bold text-purple-700">{metrics?.duplicates || 6}</span>
        </div>
      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution Bar Chart */}
        <div className="lg:col-span-2 p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Complaints by Civic Department (Received vs Resolved)
            </h3>
            <span className="text-[11px] text-slate-400">Top 6 Civic Wings</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Received" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Urgency Distribution Pie Chart */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              Urgency Severity Distribution
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={urgencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {urgencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '0.5rem',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Grievances Requiring Operator Triage */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Complaints in Triage Pipeline</h3>
            <p className="text-xs text-slate-500">Live incoming citizen grievance tickets with AI recommendations</p>
          </div>
          <Link
            href="/dashboard/complaints"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Open Queue →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Ticket ID</th>
                <th className="py-2.5 px-3">Complaint</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Ward & Locality</th>
                <th className="py-2.5 px-3">Urgency</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">
                    <Link href={`/dashboard/complaints/${c.ticketId}`}>{c.ticketId}</Link>
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-slate-800" title={c.description}>
                    {c.title || c.description}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{c.confirmedDepartment}</td>
                  <td className="py-3 px-3 text-slate-600">
                    {c.locality} (W-{c.wardNumber})
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.urgency === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : c.urgency === 'High'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {c.urgency}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-600">
                    {Math.round(c.confidence * 100)}%
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'ASSIGNED'
                          ? 'bg-sky-100 text-sky-800'
                          : c.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Link
                      href={`/dashboard/complaints/${c.ticketId}`}
                      className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
