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
  UserCheck,
  Edit3,
  Flame,
  Check,
  FileText,
  History,
  AlertCircle,
} from 'lucide-react';

export default function OperatorTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Modals / Dropdowns for Human-in-the-loop editing
  const [activeModal, setActiveModal] = useState<'DEPT' | 'CATEGORY' | 'URGENCY' | 'LOCATION' | 'ACK' | null>(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [editedLocality, setEditedLocality] = useState('');
  const [editedWard, setEditedWard] = useState<number>(45);
  const [editedAckMessage, setEditedAckMessage] = useState('');
  const [operatorNotes, setOperatorNotes] = useState('');

  const fetchComplaint = async () => {
    try {
      const [compRes, deptRes] = await Promise.all([
        fetch(`/api/complaints/${id}`),
        fetch('/api/departments'),
      ]);
      const compData = await compRes.json();
      const deptData = await deptRes.json();

      setComplaint(compData);
      setDepartments(deptData.departments || []);

      setSelectedDept(compData.confirmedDepartment);
      setSelectedCat(compData.confirmedCategory);
      setSelectedUrgency(compData.urgency);
      setEditedLocality(compData.locality || '');
      setEditedWard(compData.wardNumber || 45);
      if (compData.acknowledgement) {
        setEditedAckMessage(compData.acknowledgement.messageText);
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const executeOperatorAction = async (action: string, payload: any = {}) => {
    setActionLoading(true);
    setSuccessNotice(null);
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          operatorName: 'Rajesh Sharma (BMC Chief Triage Officer)',
          notes: operatorNotes || undefined,
          ...payload,
        }),
      });

      if (!res.ok) throw new Error('Operator action failed');
      const data = await res.json();
      setComplaint(data.complaint);
      setActiveModal(null);
      setOperatorNotes('');
      setSuccessNotice(`Action "${action.replace('_', ' ')}" executed and recorded in audit ledger.`);
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto my-24 p-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading full ticket audit history & AI telemetry...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Ticket Not Found</h2>
        <Link
          href="/dashboard/complaints"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Queue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/complaints"
            className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-mono font-bold text-slate-900">{complaint.ticketId}</h1>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  complaint.status === 'RESOLVED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : complaint.status === 'ASSIGNED'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {complaint.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">Channel: {complaint.sourceChannel} • Filed on {new Date(complaint.createdAt).toLocaleString()}</p>
          </div>
        </div>

        {/* Responsible AI Human-In-The-Loop Indicator Banner (Requirement #9) */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
          <span className="px-2.5 py-1 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI Recommended
          </span>
          <span className="text-slate-400 font-bold">+</span>
          <span
            className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
              complaint.isOperatorConfirmed
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-50 text-amber-800 border border-amber-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            {complaint.isOperatorConfirmed ? 'Operator Confirmed' : 'Operator Approval Pending'}
          </span>
        </div>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Human-in-the-Loop Action Bar (Requirement #9) */}
      <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl text-white shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Human-In-The-Loop Governance Controls
          </span>
          <p className="text-xs text-slate-300">
            Responsible AI mandate: Operators must review and approve or adjust triage routing before field assignment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!complaint.isOperatorConfirmed && (
            <button
              onClick={() => executeOperatorAction('APPROVE_ROUTING')}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 text-slate-950" />
              Approve Routing
            </button>
          )}

          <button
            onClick={() => setActiveModal('DEPT')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5 text-sky-400" />
            Change Department
          </button>

          <button
            onClick={() => setActiveModal('URGENCY')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Change Urgency
          </button>

          <button
            onClick={() => setActiveModal('LOCATION')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            Edit Location
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1 & 2: Citizen input, AI explainability, Urgency, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Complaint Card */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Original Citizen Grievance
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                Language: {complaint.language}
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">{complaint.title}</h2>
              <p className="text-sm text-slate-700 mt-2 p-4 rounded-xl bg-slate-50 border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {complaint.description}
              </p>
            </div>

            {complaint.photoCaption && (
              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/60 text-xs text-blue-900 flex items-center gap-2">
                <span className="font-semibold">Photo context caption:</span>
                <span>{complaint.photoCaption}</span>
              </div>
            )}
          </div>

          {/* AI Analysis & Explainability Box (Requirement #13) */}
          <div className="p-6 bg-slate-900 text-slate-100 rounded-2xl shadow-lg border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm text-white">Why was this routed here?</h3>
              </div>
              <span className="text-xs font-mono text-sky-300 font-bold px-2 py-0.5 rounded bg-sky-500/20">
                Confidence: {Math.round(complaint.confidence * 100)}%
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              {complaint.aiExplanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Identified Keywords & Tokens:</span>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {complaint.keywords &&
                    JSON.parse(complaint.keywords).map((kw: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 text-[10px] font-mono">
                        {kw}
                      </span>
                    ))}
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60">
                <span className="text-slate-400 block text-[11px]">Taxonomy Classification:</span>
                <strong className="text-white text-xs block mt-1">{complaint.confirmedDepartment}</strong>
                <span className="text-slate-300 text-[11px] block">{complaint.confirmedCategory}</span>
              </div>
            </div>
          </div>

          {/* Transparent Urgency Engine Card (Requirement #4) */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Transparent Urgency Engine (Score: {complaint.urgencyScore}/100)
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                  complaint.urgency === 'Critical'
                    ? 'bg-rose-100 text-rose-800'
                    : complaint.urgency === 'High'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {complaint.urgency.toUpperCase()} (Severity {complaint.severity}/5)
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-600 block">Scoring Reasons:</span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {complaint.urgencyReasons &&
                  JSON.parse(complaint.urgencyReasons).map((reason: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          {/* Audit Log Timeline (Requirement #32) */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Audit Log & Decision History
              </h3>
            </div>

            <div className="space-y-3">
              {complaint.auditLogs && complaint.auditLogs.length > 0 ? (
                complaint.auditLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-3 text-xs border-l-2 border-blue-500 pl-3 py-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action.replace('_', ' ')}</span>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Actor: <strong className="text-slate-800">{log.operator}</strong>
                        {log.notes && <span> • {log.notes}</span>}
                      </p>
                      {log.oldValue && log.newValue && (
                        <div className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 inline-block">
                          {log.oldValue} → {log.newValue}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No audit entries recorded.</div>
              )}
            </div>
          </div>
        </div>

        {/* Col 3: Responsible Office, Duplicates, Acknowledgement */}
        <div className="space-y-6">
          {/* Responsible Office Card (Requirement #5 & #38) */}
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
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Assigned Unit:</span>
                  <strong className="text-slate-900 text-sm">{complaint.responsibleOffice.officeName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Address:</span>
                  <span className="text-slate-700">{complaint.responsibleOffice.address}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Working Hours:</span>
                  <span className="text-slate-700">{complaint.responsibleOffice.workingHours}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Contact Helpline:</span>
                  <span className="text-blue-700 font-bold">{complaint.responsibleOffice.phone}</span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Source: {complaint.officeRecommendationSource || 'Spatial Proximity & Ward Mapping'}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Central Municipal Office Mata Mandir</div>
            )}
          </div>

          {/* Duplicate Detection Card (Requirement #7) */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                Duplicate Detection
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  complaint.isDuplicate ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {Math.round(complaint.duplicateProbability)}% MATCH
              </span>
            </div>

            {complaint.duplicateReason ? (
              <p className="text-xs text-purple-900 bg-purple-50 p-3 rounded-xl border border-purple-200 leading-relaxed">
                {complaint.duplicateReason}
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                No duplicate complaints detected in this locality and 14-day rolling window.
              </p>
            )}

            {complaint.linkedDuplicates && complaint.linkedDuplicates.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-600 block">Linked Complaints:</span>
                {complaint.linkedDuplicates.map((link: any) => (
                  <div key={link.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-mono text-blue-700">{link.duplicateComplaint?.ticketId}</span>
                    <span className="text-[10px] text-slate-500">{link.similarityScore}% similar</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Acknowledgement Generator (Requirement #10) */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Acknowledgement Generator
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  complaint.acknowledgement?.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}
              >
                {complaint.acknowledgement?.isApproved ? 'APPROVED' : 'PENDING'}
              </span>
            </div>

            <textarea
              rows={4}
              value={editedAckMessage}
              onChange={(e) => setEditedAckMessage(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => navigator.clipboard.writeText(editedAckMessage)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                onClick={() => executeOperatorAction('UPDATE_ACK', { messageText: editedAckMessage, isApproved: true })}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                Save & Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Human-In-The-Loop Interactive Modals */}
      {activeModal === 'DEPT' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Change Department / Category</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Civic Department</label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  const deptObj = departments.find((d) => d.name === e.target.value);
                  if (deptObj && deptObj.categories?.[0]) {
                    setSelectedCat(deptObj.categories[0].name);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Target Category</label>
              <select
                value={selectedCat}
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                {departments
                  .find((d) => d.name === selectedDept)
                  ?.categories?.map((cat: any) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  )) || <option value={selectedCat}>{selectedCat}</option>}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Operator Justification</label>
              <input
                type="text"
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="Reason for reassignment..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  executeOperatorAction('CHANGE_DEPARTMENT', {
                    department: selectedDept,
                    category: selectedCat,
                  })
                }
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Confirm Department
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'URGENCY' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Change Urgency Level</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Select Urgency</label>
              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              >
                <option value="Critical">Critical (81-100)</option>
                <option value="High">High (61-80)</option>
                <option value="Medium">Medium (31-60)</option>
                <option value="Low">Low (0-30)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Operator Justification</label>
              <input
                type="text"
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                placeholder="Reason for urgency change..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  executeOperatorAction('CHANGE_URGENCY', {
                    urgency: selectedUrgency,
                    urgencyScore:
                      selectedUrgency === 'Critical'
                        ? 90
                        : selectedUrgency === 'High'
                        ? 75
                        : selectedUrgency === 'Medium'
                        ? 50
                        : 25,
                  })
                }
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Confirm Urgency
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'LOCATION' && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Correct Locality & Ward</h3>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Locality</label>
              <input
                type="text"
                value={editedLocality}
                onChange={(e) => setEditedLocality(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Ward Number</label>
              <input
                type="number"
                value={editedWard}
                onChange={(e) => setEditedWard(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  executeOperatorAction('EDIT_LOCATION', {
                    locality: editedLocality,
                    wardNumber: editedWard,
                  })
                }
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
              >
                Save Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
