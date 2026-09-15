'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building,
  ArrowRight,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  ShieldCheck,
  X,
  Loader2,
} from 'lucide-react';

export default function TrackSearchPage() {
  const [ticketId, setTicketId] = useState('');
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [ticketToDelete, setTicketToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('bhopal_my_tickets') || '[]');
        setMyTickets(stored);
      } catch (e) {
        console.warn('Error reading stored tickets:', e);
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketId.trim()) {
      router.push(`/track/${ticketId.trim().toUpperCase()}`);
    }
  };

  const executeDelete = async () => {
    if (!ticketToDelete) return;

    setIsDeleting(true);
    const targetId = ticketToDelete.ticketId;
    try {
      const res = await fetch(`/api/complaints/${targetId}`, { method: 'DELETE' });
      
      // Regardless of whether it succeeded on server or was already deleted (404), remove from local list
      const updated = myTickets.filter((t) => t.ticketId !== targetId);
      setMyTickets(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bhopal_my_tickets', JSON.stringify(updated));
      }

      setTicketToDelete(null);
      setNotification({
        type: 'success',
        message: `Complaint #${targetId} has been successfully withdrawn and deleted.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      // Still remove from localStorage if network/server failed
      const updated = myTickets.filter((t) => t.ticketId !== targetId);
      setMyTickets(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bhopal_my_tickets', JSON.stringify(updated));
      }
      setTicketToDelete(null);
      setNotification({
        type: 'success',
        message: `Complaint #${targetId} removed from your active list.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsDeleting(false);
    }
  };

  const sampleTickets = ['BMC-2026-00001', 'BMC-2026-00002', 'BMC-2026-00003', 'BMC-2026-00007'];

  return (
    <div className="max-w-4xl mx-auto my-8 sm:my-12 px-4 sm:px-6 space-y-6">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Search Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xl space-y-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
          <Search className="w-6 h-6" />
        </div>

        <div className="max-w-xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Track Civic Grievance</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enter your unique Bhopal Municipal Corporation Ticket ID to check triage status, assigned office, and timeline.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
          <input
            type="text"
            value={ticketId}
            onChange={(e) => setTicketId(e.target.value)}
            placeholder="e.g. BMC-2026-00115"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm uppercase font-mono text-slate-900"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-1.5 shrink-0 shadow-sm"
          >
            Track
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400 block mb-2">Try quick demo tickets:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {sampleTickets.map((id) => (
              <button
                key={id}
                onClick={() => router.push(`/track/${id}`)}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs transition border border-slate-200"
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* "My Filed Complaints" Section */}
      {myTickets.length > 0 && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <h2 className="text-base font-bold text-slate-900">My Registered Complaints (मेरी शिकायतें)</h2>
                <p className="text-[11px] text-slate-500">
                  Grievances filed from this browser. You can check real-time status or delete/withdraw them anytime.
                </p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {myTickets.length} {myTickets.length === 1 ? 'Complaint' : 'Complaints'}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {myTickets.map((item) => (
              <div
                key={item.ticketId}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 p-3 rounded-xl transition"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 text-sm sm:text-base">{item.ticketId}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'ASSIGNED'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.urgency && (
                      <span className="text-[11px] text-slate-500">
                        Priority: <strong className="text-slate-800">{item.urgency}</strong>
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-800 line-clamp-2">{item.title}</div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                    <span>Category: {item.category || item.department || 'General Civic'}</span>
                    <span>•</span>
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                  <Link
                    href={`/track/${item.ticketId}`}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-blue-200 shadow-xs"
                  >
                    View Status
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => setTicketToDelete(item)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-rose-200 shadow-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete / Withdraw
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Withdraw / Delete Complaint</h3>
              </div>
              <button
                onClick={() => setTicketToDelete(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to withdraw complaint <strong className="font-mono text-slate-900">#{ticketToDelete.ticketId}</strong>?
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800 line-clamp-1">{ticketToDelete.title}</div>
              <div className="text-slate-500">Department: {ticketToDelete.department || ticketToDelete.category}</div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              This will remove the complaint from the municipal triage queue and delete your tracking record.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setTicketToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 transition flex items-center gap-1.5 shadow-sm"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isDeleting ? 'Deleting...' : 'Yes, Delete Complaint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
