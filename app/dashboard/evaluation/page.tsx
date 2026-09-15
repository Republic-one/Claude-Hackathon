'use client';

import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Play,
  RotateCw,
  BarChart,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function AIEvaluationPage() {
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [runningBenchmark, setRunningBenchmark] = useState(false);

  const loadEvaluation = async () => {
    try {
      const res = await fetch('/api/evaluation');
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error('Failed to load evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerBenchmark = async () => {
    setRunningBenchmark(true);
    try {
      const res = await fetch('/api/evaluation', { method: 'POST' });
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      alert('Benchmark execution failed');
    } finally {
      setRunningBenchmark(false);
    }
  };

  useEffect(() => {
    loadEvaluation();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-24 p-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500">Loading AI evaluation benchmarks...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              AI Model Evaluation & Benchmark Results
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
              Held-Out Test Set Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Calculated dynamically against 25 labeled multilingual Bhopal civic test cases and duplicate pairs.
          </p>
        </div>

        <button
          onClick={triggerBenchmark}
          disabled={runningBenchmark}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
        >
          {runningBenchmark ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
          Run Live Benchmark Test
        </button>
      </div>

      {evaluation ? (
        <>
          {/* Key Metrics Cards (Requirement #31) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Department Accuracy
              </span>
              <span className="text-2xl font-black text-emerald-600">{evaluation.departmentAccuracy}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">Ground-truth alignment</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Category Accuracy
              </span>
              <span className="text-2xl font-black text-blue-600">{evaluation.categoryAccuracy}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">Sub-issue precision</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Urgency Agreement
              </span>
              <span className="text-2xl font-black text-amber-600">{evaluation.urgencyAgreement}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">SLA severity match</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Duplicate F1 Score
              </span>
              <span className="text-2xl font-black text-purple-600">{evaluation.duplicateF1}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Precision: {evaluation.duplicatePrecision}%</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Avg AI Confidence
              </span>
              <span className="text-2xl font-black text-sky-600">{evaluation.averageConfidence}%</span>
              <span className="text-[10px] text-slate-400 block mt-1">Classification score</span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Test Cases Evaluated
              </span>
              <span className="text-2xl font-black text-slate-900">{evaluation.totalTestCases}</span>
              <span className="text-[10px] text-slate-400 block mt-1">Hindi, Hinglish, English</span>
            </div>
          </div>

          {/* Confusion Matrix (Requirement #31) */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Department Classification Confusion Matrix</h3>
                <p className="text-xs text-slate-500">True Class (Rows) vs Predicted Class (Columns)</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Evaluated: {new Date(evaluation.evaluatedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold">
                    <th className="py-2 px-2 text-left">True Dept \ Predicted</th>
                    {evaluation.confusionMatrix.departments.map((d: string, i: number) => (
                      <th key={i} className="py-2 px-2 max-w-[80px] truncate" title={d}>
                        {d.split(' ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluation.confusionMatrix.departments.map((deptName: string, rowIdx: number) => (
                    <tr key={rowIdx} className="hover:bg-slate-50">
                      <td className="py-2 px-2 font-semibold text-slate-800 text-left whitespace-nowrap">
                        {deptName}
                      </td>
                      {evaluation.confusionMatrix.matrix[rowIdx].map((val: number, colIdx: number) => {
                        const isDiagonal = rowIdx === colIdx;
                        return (
                          <td
                            key={colIdx}
                            className={`py-2 px-2 font-mono ${
                              val > 0 && isDiagonal
                                ? 'bg-emerald-100 text-emerald-900 font-bold'
                                : val > 0
                                ? 'bg-rose-100 text-rose-800 font-bold'
                                : 'text-slate-300'
                            }`}
                          >
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Held-Out Test Case Predictions Table */}
          <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sample Held-Out Test Predictions</h3>
              <p className="text-xs text-slate-500">Direct comparison between citizen prompt, true label, and AI prediction.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Complaint Text</th>
                    <th className="py-2.5 px-3">True Department</th>
                    <th className="py-2.5 px-3">Predicted Department</th>
                    <th className="py-2.5 px-3">True Urgency</th>
                    <th className="py-2.5 px-3">Predicted Urgency</th>
                    <th className="py-2.5 px-3 text-center">Dept Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluation.samplePredictions.slice(0, 10).map((p: any) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 max-w-sm truncate text-slate-800" title={p.text}>
                        {p.text}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{p.trueDept}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.predDept}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.trueUrgency}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{p.predUrgency}</td>
                      <td className="py-2.5 px-3 text-center">
                        {p.isDeptCorrect ? (
                          <span className="inline-block w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-bold leading-4 text-center">
                            ✓
                          </span>
                        ) : (
                          <span className="inline-block w-4 h-4 rounded-full bg-rose-100 text-rose-700 font-bold leading-4 text-center">
                            ✗
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Evaluation Pending</h3>
          <p className="text-xs text-slate-500">Run the benchmark to calculate test metrics from held-out dataset.</p>
        </div>
      )}
    </div>
  );
}
