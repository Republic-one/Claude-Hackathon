'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  RefreshCw,
  Building,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

function ComplaintQueueContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialDuplicate = searchParams.get('duplicate') === 'true';

  const [complaints, setComplaints] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [department, setDepartment] = useState('ALL');
  const [urgency, setUrgency] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [language, setLanguage] = useState('ALL');
  const [duplicateOnly, setDuplicateOnly] = useState(initialDuplicate);

  const fetchComplaints = async (currentPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (department !== 'ALL') params.set('department', department);
      if (urgency !== 'ALL') params.set('urgency', urgency);
      if (status !== 'ALL') params.set('status', status);
      if (language !== 'ALL') params.set('language', language);
      if (duplicateOnly) params.set('duplicate', 'true');

      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      setComplaints(data.complaints || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints(1);
    setPage(1);
  }, [department, urgency, status, language, duplicateOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchComplaints(1);
    setPage(1);
  };

  const departmentsList = [
    'ALL',
    'Street Lighting / Electrical',
    'Water Supply',
    'Sewerage / Drainage',
    'Solid Waste Management',
    'Roads / Potholes',
    'Sanitation',
    'Public Health',
    'Parks / Gardens',
    'Encroachment',
    'Stray Animals',
    'Traffic-related civic infrastructure',
    'Storm Water Drainage',
    'Public Toilets',
    'Tree / Horticulture',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Civic Complaint Queue</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              {total} Total Tickets
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Filter, inspect AI triage classifications, and dispatch to Bhopal Municipal Corporation offices.
          </p>
        </div>

        <button
          onClick={() => fetchComplaints(page)}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Table
        </button>
      </div>

      {/* Filter & Search Bar (Requirement #12) */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
        {/* Search row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ticket ID (e.g. BMC-2026-00001), keywords, locality, ward, or category..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50"
            >
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50"
            >
              <option value="ALL">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-slate-50"
            >
              <option value="ALL">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi (Devanagari)</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={duplicateOnly}
                onChange={(e) => setDuplicateOnly(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-purple-700">Duplicates Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <span className="text-xs text-slate-500">Querying complaints...</span>
          </div>
        ) : complaints.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            No complaints found matching the active filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Ticket ID</th>
                  <th className="py-3 px-3">Complaint</th>
                  <th className="py-3 px-3">Department & Category</th>
                  <th className="py-3 px-3">Ward / Locality</th>
                  <th className="py-3 px-3">Urgency</th>
                  <th className="py-3 px-3">Conf.</th>
                  <th className="py-3 px-3">Duplicate</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-blue-50/40 transition group">
                    <td className="py-3 px-3 font-mono font-bold text-blue-700 whitespace-nowrap">
                      <Link href={`/dashboard/complaints/${c.ticketId}`} className="hover:underline">
                        {c.ticketId}
                      </Link>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate" title={c.title}>
                        {c.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5" title={c.description}>
                        {c.description}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{c.confirmedDepartment}</div>
                      <div className="text-[11px] text-slate-500">{c.confirmedCategory}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{c.locality}</div>
                      <div className="text-[11px] text-slate-500">Ward {c.wardNumber}</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.urgency === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : c.urgency === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.urgency} ({c.urgencyScore})
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {Math.round(c.confidence * 100)}%
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {c.isDuplicate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                          {Math.round(c.duplicateProbability)}% MATCH
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'ASSIGNED'
                            ? 'bg-sky-100 text-sky-800'
                            : c.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'UNDER_REVIEW'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/complaints/${c.ticketId}`}
                        className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white font-semibold transition inline-flex items-center gap-1"
                      >
                        Triage
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs text-slate-600">
          <div>
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} items)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (page > 1) {
                  setPage(page - 1);
                  fetchComplaints(page - 1);
                }
              }}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              onClick={() => {
                if (page < totalPages) {
                  setPage(page + 1);
                  fetchComplaints(page + 1);
                }
              }}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComplaintQueuePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto my-24 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <span className="text-xs text-slate-500">Loading complaint queue...</span>
        </div>
      }
    >
      <ComplaintQueueContent />
    </Suspense>
  );
}
