'use client';

import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Check,
  AlertCircle,
  Loader2,
  Table,
} from 'lucide-react';

export default function ImportCsvPage() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const sampleCsvContent = `complaint_id,description,language,date,latitude,longitude,locality,ward,department,category,urgency,source
BMC-2026-90001,Water pipe leaking heavily near Bansal Hospital,English,2026-09-14,23.1952,77.4289,Shahpura Sector A/B,52,Water Supply,Pipe Burst / Water Leakage,Medium,CM Helpline Export
BMC-2026-90002,Colony ke bheetar 2 din se kachra nahi uthaya gaya,Hinglish,2026-09-13,23.2329,77.4334,MP Nagar Zone 1,58,Solid Waste Management,Garbage Heap / Unattended Dump,Medium,Municipal App Export
BMC-2026-90003,सड़क पर गहरा गड्ढा है बारिश में पानी भर जाता है,Hindi,2026-09-12,23.2384,77.4022,New Market (TT Nagar),32,Roads / Potholes,Potholes / Damaged Road Surface,High,Citizen Portal
BMC-2026-90004,Open junction box with exposed wire sparking near school,English,2026-09-14,23.2105,77.4312,Arera Colony (E-5),47,Street Lighting / Electrical,Exposed / Dangling Electric Wire,Critical,Representative Office Export`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'complaints_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length <= 1) {
      setParseError('CSV file has no data rows.');
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const rowObj: any = {};
      headers.forEach((header, idx) => {
        rowObj[header] = values[idx] || '';
      });
      rows.push(rowObj);
    }

    setParsedRows(rows);
    setParseError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setImportResult(null);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        parseCsvText(text);
      };
      reader.readAsText(selected);
    }
  };

  const executeImport = async () => {
    if (parsedRows.length === 0) return;
    setImporting(true);
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows: parsedRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setImportResult(data);
    } catch (err: any) {
      alert(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">CSV Dataset Batch Importer</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              Bulk Triage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingest external municipal grievance records (CM Helpline exports, social media dumps, helpline logs).
          </p>
        </div>

        <button
          onClick={downloadSampleCsv}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5" />
          Download Sample CSV
        </button>
      </div>

      {/* Upload Box */}
      <div className="p-8 bg-white rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-4 shadow-sm hover:border-blue-500 transition">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">Upload complaints.csv</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Expected headers: complaint_id, description, language, date, latitude, longitude, locality, ward, department, category, urgency, source
          </p>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
        />
      </div>

      {/* Import Result Summary Counters (Requirement #30) */}
      {importResult && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Import Validation Summary</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Rows Detected</span>
              <span className="text-2xl font-bold text-slate-900">{importResult.summary.rowsDetected}</span>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">Valid Rows</span>
              <span className="text-2xl font-bold text-emerald-700">{importResult.summary.validRows}</span>
            </div>

            <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-[10px] uppercase font-bold text-rose-700 block mb-1">Invalid Rows</span>
              <span className="text-2xl font-bold text-rose-700">{importResult.summary.invalidRows}</span>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-700 block mb-1">Duplicate Rows</span>
              <span className="text-2xl font-bold text-amber-700">{importResult.summary.duplicateRows}</span>
            </div>
          </div>
        </div>
      )}

      {/* Parsed Rows Preview */}
      {parsedRows.length > 0 && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Detected Rows ({parsedRows.length})</h3>
              <p className="text-xs text-slate-500">Preview of rows parsed from uploaded file</p>
            </div>

            <button
              onClick={executeImport}
              disabled={importing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Import Valid Rows to Database
            </button>
          </div>

          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider sticky top-0">
                  <th className="py-2 px-3">Complaint ID</th>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Locality</th>
                  <th className="py-2 px-3">Ward</th>
                  <th className="py-2 px-3">Department</th>
                  <th className="py-2 px-3">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono font-bold text-blue-700">{row.complaint_id || 'AUTO'}</td>
                    <td className="py-2 px-3 max-w-xs truncate text-slate-800">{row.description}</td>
                    <td className="py-2 px-3 text-slate-600">{row.locality}</td>
                    <td className="py-2 px-3 text-slate-600">{row.ward}</td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{row.department}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {row.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
