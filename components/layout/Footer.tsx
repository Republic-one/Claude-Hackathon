'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, PhoneCall, Building, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: About */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Bhopal Civic Intelligence & Triage System
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
              An intelligent, responsible civic grievance platform designed for the Bhopal Municipal Corporation.
              Features multilingual natural language understanding (Hindi, Hinglish, English), transparent urgency
              scoring, geolocation-to-office mapping, duplicate clustering, and operator human-in-the-loop validation.
            </p>
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300">
                <strong className="text-white">Data Privacy Notice: </strong>
                Your location is used only to identify the relevant service area and routing office in this demo. No unnecessary personal names, Aadhaar, or precise house coordinates are stored.
              </p>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-sky-400 transition">
                  {t.reportComplaint}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-sky-400 transition">
                  {t.trackComplaint}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-sky-400 transition">
                  {t.operatorDashboard}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/complaints" className="hover:text-sky-400 transition">
                  {t.complaintQueue}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/evaluation" className="hover:text-sky-400 transition">
                  {t.aiEvaluation}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Civic Helplines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">BMC Demo Helplines</h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                <span>BMC Toll-Free: <strong>1800-233-0014</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                <span>Central Control: <strong>0755-2542222</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                <span>Water Supply Cell: <strong>0755-2660144</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-sky-400" />
                <span>Electrical Depot: <strong>0755-2554311</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © 2026 Bhopal Civic Complaint Intelligence & Triage System • Built for Municipal Operations Hackathon
          </div>
          <div className="flex items-center gap-2 text-amber-400/90 font-medium">
            <span>{t.demoNotice}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
