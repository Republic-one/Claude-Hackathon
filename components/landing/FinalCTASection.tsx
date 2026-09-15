'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ComplaintForm } from '@/components/citizen/ComplaintForm';
import {
  FilePlus,
  Search,
  LayoutDashboard,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const FinalCTASection: React.FC = () => {
  const { locale, t } = useLanguage();
  const isHindi = locale === 'hi';

  return (
    <section id="intake-portal" className="scroll-mt-24 py-20 px-4 sm:px-6 lg:px-8 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Top Header Card */}
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 border border-blue-800/60 p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-sky-500/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-sky-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{isHindi ? 'नागरिक सेवा केंद्र • भोपाल' : 'Bhopal Citizen Civic Gateway'}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {isHindi ? (
                <>
                  भोपाल को बेहतर बनाएं —{' '}
                  <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-amber-300 bg-clip-text text-transparent">
                    दर्ज करें. ट्रैक करें. समाधान पाएं.
                  </span>
                </>
              ) : (
                <>
                  Help Make Bhopal Better —{' '}
                  <span className="bg-gradient-to-r from-sky-300 via-blue-200 to-amber-300 bg-clip-text text-transparent">
                    Report. Track. Resolve.
                  </span>
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {isHindi
                ? 'चाहे सड़क पर गड्ढा हो, पानी का लीकेज हो या स्ट्रीट लाइट की समस्या — हमारा AI इंजन कुछ ही सेकंड्स में आपकी शिकायत को सही म्यूनिसिपल टीम तक पहुंचाएगा।'
                : 'Whether it is a broken water pipeline, uncollected garbage, or streetlighting fault — our AI engine immediately validates and routes your grievance to the designated BMC office.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/track"
                className="px-5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
              >
                <Search className="w-4 h-4 text-sky-400" />
                <span>{isHindi ? 'शिकायत की स्थिति जांचें' : 'Track Existing Ticket'}</span>
              </Link>

              <Link
                href="/dashboard"
                className="px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 border border-slate-700/80 text-xs sm:text-sm font-semibold transition flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>{isHindi ? 'ऑपरेटर डैशबोर्ड' : 'BMC Operator Portal'}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* The Working Live ComplaintForm Container */}
        <div className="rounded-3xl bg-white text-slate-900 border border-slate-200 shadow-2xl p-4 sm:p-8 lg:p-10">
          <div className="border-b border-slate-200 pb-6 mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
                <FilePlus className="w-3.5 h-3.5 text-blue-700" />
                <span>{isHindi ? 'ऑनलाइन शिकायत पंजीकरण' : 'Official Grievance Intake Form'}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {isHindi ? 'नागरिक शिकायत दर्ज करें' : 'Submit a Civic Grievance'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isHindi
                  ? 'अपनी भाषा (हिंदी / English / हिंग्लिश) में लिखें, आवाज रिकॉर्ड करें या फोटो अपलोड करें।'
                  : 'Enter details in your preferred language, record a voice note, or attach photo evidence.'}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>AI Auto-Geocoded to 85 BMC Wards</span>
            </div>
          </div>

          {/* Embedded Real Complaint Form Component */}
          <ComplaintForm />
        </div>
      </div>
    </section>
  );
};
