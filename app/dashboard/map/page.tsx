'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Building2, Layers, AlertTriangle, Loader2 } from 'lucide-react';

const DynamicCivicMap = dynamic(
  () => import('@/components/map/CivicMap').then((mod) => mod.CivicMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <span className="text-xs text-slate-500">Loading interactive Bhopal civic map...</span>
        </div>
      </div>
    ),
  }
);

export default function ClusterMapPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [offices, setOffices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/complaints?limit=100').then((r) => r.json()),
      fetch('/api/gazetteer').then((r) => r.json()),
    ])
      .then(([compData, gazData]) => {
        setComplaints(compData.complaints || []);
        setOffices(gazData.municipal_offices || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Compute major locality clusters
  const localityClusters: Record<string, { count: number; department: string; urgency: string }> = {};
  for (const c of complaints) {
    if (c.locality) {
      if (!localityClusters[c.locality]) {
        localityClusters[c.locality] = { count: 0, department: c.confirmedDepartment, urgency: c.urgency };
      }
      localityClusters[c.locality].count++;
    }
  }

  const topClusters = Object.entries(localityClusters)
    .map(([loc, data]) => ({ locality: loc, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive Complaint Cluster Map</h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
            OpenStreetMap GIS
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Spatial density visualization of complaints, emerging civic hot-spots, and municipal zonal offices across Bhopal.
        </p>
      </div>

      {/* Main Map */}
      <DynamicCivicMap complaints={complaints} offices={offices} />

      {/* Requirement #14: Repeat Civic Clusters */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-600" />
          Detected High-Density Civic Complaint Clusters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topClusters.map((cluster, i) => (
            <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{cluster.locality}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {cluster.count} Complaints
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Primary Issue: <strong className="text-slate-700">{cluster.department}</strong>
              </p>
              <span className="text-[10px] text-slate-400 block font-mono">Last 14 days telemetry</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
