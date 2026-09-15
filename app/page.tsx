'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ComplaintForm } from '@/components/citizen/ComplaintForm';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  FileText,
  MapPin,
  Cpu,
  UserCheck,
  CheckCircle2,
  PhoneCall,
  Flame,
  LayoutDashboard,
  Layers,
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useLanguage();

  const pipelineSteps = [
    { num: '01', title: 'Citizen Complaint', desc: 'Hindi, Hinglish, or English text, voice input, or photo upload', icon: FileText },
    { num: '02', title: 'Location Detection', desc: 'Browser GPS geocoding to Bhopal locality and ward', icon: MapPin },
    { num: '03', title: 'AI Analysis & Urgency', desc: 'Keyword extraction, severity scoring, and duplicate check', icon: Cpu },
    { num: '04', title: 'Responsible Office', desc: 'Mapped to BMC Zonal Office or Specialized Depot', icon: Building2 },
    { num: '05', title: 'Operator Review', desc: 'Human-in-the-loop validation & routing confirmation', icon: UserCheck },
    { num: '06', title: 'Action & Resolution', desc: 'Dispatched to field teams with structured SLA', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Digital Public Infrastructure for Bhopal Municipal Corporation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Bhopal Civic Intelligence
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Turn citizen complaints into structured, actionable civic tickets with multilingual natural language triage and transparent urgency scoring.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="#intake-form"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 transition flex items-center gap-2"
            >
              Report a Complaint
              <ArrowRight className="w-4 h-4" />
            </a>

            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4 text-sky-400" />
              Operator Dashboard
            </Link>

            <Link
              href="/dashboard/evaluation"
              className="px-5 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 border border-slate-700/80 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              View Model Evaluation
            </Link>
          </div>
        </div>
      </section>

      {/* Visual Pipeline Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600">The Triage Lifecycle</h2>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">From Citizen Grievance to Municipal Action</h3>
          <p className="text-xs text-slate-500 mt-1.5">
            An auditable, transparent AI pipeline ensuring high-confidence routing without silent automation.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition relative group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {step.num}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">{step.title}</h4>
                <p className="text-[11px] text-slate-500 leading-normal">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Intake Form Section */}
      <section id="intake-form" className="scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 text-center mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
            Citizen Grievance Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Submit a Civic Grievance
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Our AI engine automatically detects language, identifies the department, evaluates public safety urgency, and recommends the nearest BMC office.
          </p>
        </div>

        <ComplaintForm />
      </section>
    </div>
  );
}
