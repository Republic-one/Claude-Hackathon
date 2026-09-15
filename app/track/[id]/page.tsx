'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  PhoneCall,
  ExternalLink,
  Copy,
  Layers,
  Sparkles,
  Loader2,
  Trash2,
} from 'lucide-react';

export default function TicketTrackPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/complaints/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Ticket not found');
        return res.json();
      })
      .then((data) => setComplaint(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteComplaint = async () => {
    if (!confirm(`Are you sure you want to withdraw and delete complaint #${complaint.ticketId}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/complaints/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete complaint');

      // Remove from localStorage
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('bhopal_my_tickets') || '[]');
        const filtered = stored.filter((t: any) => t.ticketId !== complaint.ticketId && t.ticketId !== id);
        localStorage.setItem('bhopal_my_tickets', JSON.stringify(filtered));
      }

      alert(`Complaint #${complaint.ticketId} was withdrawn successfully.`);
      router.push('/track');
    } catch (err: any) {
      alert(err.message || 'Failed to delete complaint');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto my-24 p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading civic grievance record...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Grievance Not Found</h2>
        <p className="text-xs text-slate-500">
          No civic complaint record was found with Ticket ID: <strong className="font-mono text-slate-800">{id}</strong>
        </p>
        <Link
          href="/track"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Search
        </Link>
      </div>
    );
  }

  const steps = ['NEW', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];
  const currentStepIndex = steps.indexOf(complaint.status) >= 0 ? steps.indexOf(complaint.status) : 2;

  return (
    <div className="max-w-4xl mx-auto my-10 px-4 sm:px-6 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/track"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Track Another Ticket
        </Link>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-900 text-white font-mono">
            {complaint.ticketId}
          </span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold ${
              complaint.status === 'RESOLVED'
                ? 'bg-emerald-100 text-emerald-800'
                : complaint.status === 'ASSIGNED'
                ? 'bg-sky-100 text-sky-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {complaint.status}
          </span>
          <button
            onClick={handleDeleteComplaint}
            disabled={deleting}
            className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1 transition ml-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? 'Withdrawing...' : 'Withdraw / Delete'}
          </button>
        </div>
      </div>

      {/* Progress Pipeline */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-6">Resolution Status Tracker</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 transition-all duration-500 z-0"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((st, idx) => {
            const isDone = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={st} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isDone
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-4 ring-blue-50'
                      : 'bg-white text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] mt-2 font-bold tracking-tight uppercase ${
                    isCurrent ? 'text-blue-700' : isDone ? 'text-slate-800' : 'text-slate-400'
                  }`}
                >
                  {st.replace('_', ' ')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Grievance Details & AI Routing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Complaint details & explainability */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <span className="text-xs text-slate-400 block font-mono">
                Filed on: {new Date(complaint.createdAt).toLocaleDateString()} at{' '}
                {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <h1 className="text-xl font-bold text-slate-900 mt-1">{complaint.title}</h1>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {complaint.description}
            </p>

            {complaint.photoCaption && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <span className="font-semibold text-slate-800">Photo context:</span>
                <span>{complaint.photoCaption}</span>
              </div>
            )}
          </div>

          {/* AI Explainability Box (Requirement #13) */}
          <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Why was this routed here?</h3>
              </div>
              <span className="text-xs font-mono text-sky-400 font-semibold">
                Confidence: {Math.round(complaint.confidence * 100)}%
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{complaint.aiExplanation}</p>

            <div className="pt-2 flex flex-wrap gap-1.5">
              {complaint.keywords &&
                JSON.parse(complaint.keywords).map((kw: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">
                    #{kw}
                  </span>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Classifier: Deterministic Multilingual NLP + Rule-based Gazetteer</span>
              <span className="text-emerald-400">Audited by Operator</span>
            </div>
          </div>
        </div>

        {/* Right Col: Responsible Office Card (Requirement #5 & #38) */}
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Building2 className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Responsible Office</span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Demo Dataset
              </span>
            </div>

            {complaint.responsibleOffice ? (
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Assigned Unit:</span>
                  <strong className="text-slate-900 text-sm">{complaint.responsibleOffice.officeName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Address:</span>
                  <span className="text-slate-700">{complaint.responsibleOffice.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Working Hours:</span>
                  <span className="text-slate-700">{complaint.responsibleOffice.workingHours}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Helpline Contact:</span>
                  <span className="text-blue-700 font-bold">{complaint.responsibleOffice.phone}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600">
                Bhopal Municipal Corporation HQ, Mata Mandir, Bhopal, MP
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Locality:</span>
                <span className="font-semibold text-slate-800">{complaint.locality}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Ward:</span>
                <span className="font-semibold text-slate-800">Ward {complaint.wardNumber}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Priority:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                    complaint.urgency === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : complaint.urgency === 'High'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {complaint.urgency}
                </span>
              </div>
            </div>
          </div>

          {/* Acknowledgement Message */}
          {complaint.acknowledgement && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Acknowledgement
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(complaint.acknowledgement.messageText)}
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <p className="text-[11px] font-mono text-slate-700 whitespace-pre-wrap leading-relaxed">
                {complaint.acknowledgement.messageText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
