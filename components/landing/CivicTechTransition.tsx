'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Cpu,
  MapPin,
  Building2,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  BarChart3,
  Search,
} from 'lucide-react';

interface SampleCase {
  id: string;
  title: string;
  titleHi: string;
  input: string;
  language: string;
  department: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  sla: string;
  ward: string;
  office: string;
  rationale: string;
  rationaleHi: string;
}

const SAMPLE_CASES: SampleCase[] = [
  {
    id: 'c1',
    title: 'Water Pipeline Burst',
    titleHi: 'पानी की मुख्य पाइपलाइन फूटी',
    input: 'बड़ा तालाब वीआईपी रोड के पास मेन वाटर सप्लाई लाइन फट गई है और सड़क पर 2 फीट पानी भर गया है, ट्रैफिक रुका है।',
    language: 'Hindi (हिंदी)',
    department: 'Water Supply & Sewerage',
    urgency: 'CRITICAL',
    score: 94,
    sla: '4 Hours',
    ward: 'Ward 23 (Khanugaon / VIP Road)',
    office: 'BMC Water Works Maintenance Zone 5',
    rationale: 'Active flooding on major arterial road + clean drinking water wastage.',
    rationaleHi: 'प्रमुख वीआईपी रोड पर जलभराव और 40% पेयजल आपूर्ति बाधित होने का खतरा।',
  },
  {
    id: 'c2',
    title: 'Dangling High Voltage Wire',
    titleHi: 'खुला हाई वोल्टेज बिजली का तार',
    input: 'MP Nagar Zone-1 commercial complex ke samne transformer se live open wire footpath par gira hai. Danger of electrocution!',
    language: 'Hinglish (हिंग्लिश)',
    department: 'Electrical & Street Lighting',
    urgency: 'CRITICAL',
    score: 98,
    sla: '2 Hours',
    ward: 'Ward 48 (MP Nagar Zone 1)',
    office: 'BMC Central Electrical Depot - Zone 10',
    rationale: 'Severe immediate threat to human life in high footfall commercial zone.',
    rationaleHi: 'भीड़भाड़ वाले वाणिज्यिक क्षेत्र में पैदल यात्रियों के लिए तत्काल जानलेवा खतरा।',
  },
  {
    id: 'c3',
    title: 'Sanitation & Garbage Accumulation',
    titleHi: 'कचरा डिपो ओवरफ्लो',
    input: 'Near Taj-ul-Masajid Gate No. 2, the garbage bin is overflowing for 3 days and stray animals are spreading waste.',
    language: 'English',
    department: 'Solid Waste Management',
    urgency: 'MEDIUM',
    score: 62,
    sla: '24 Hours',
    ward: 'Ward 09 (Motia Khan / Old City)',
    office: 'BMC Old City Zonal Sanitation Depot - Zone 2',
    rationale: 'Public health hygiene risk near high tourist & heritage congregation point.',
    rationaleHi: 'धरोहर क्षेत्र के पास स्वास्थ्य स्वच्छता जोखिम, कचरा गाड़ी तत्काल रवाना।',
  },
];

export const CivicTechTransition: React.FC = () => {
  const { locale } = useLanguage();
  const isHindi = locale === 'hi';
  const [selectedCase, setSelectedCase] = useState<SampleCase>(SAMPLE_CASES[0]);

  const pipelineSteps = [
    {
      num: '01',
      title: isHindi ? 'नागरिक शिकायत दर्ज' : 'Citizen Grievance Filing',
      desc: isHindi
        ? 'हिंदी, हिंग्लिश या अंग्रेजी में टेक्स्ट, आवाज या फोटो अपलोड करें।'
        : 'Accepts Hindi, Hinglish, English text, live voice notes, or photo evidence.',
      icon: FileText,
    },
    {
      num: '02',
      title: isHindi ? 'स्मार्ट GIS लोकेशन मैपिंग' : 'Autonomous GIS Geocoding',
      desc: isHindi
        ? 'ब्राउज़र GPS व लैंडमार्क से भोपाल के 85 वार्डों में सटीक मैपिंग।'
        : 'Detects coordinates and correlates them to 85 BMC Wards & 19 Zones.',
      icon: MapPin,
    },
    {
      num: '03',
      title: isHindi ? 'AI विश्लेषण एवं अर्जेंसी स्कोर' : 'Multilingual NLP & Urgency Triage',
      desc: isHindi
        ? 'प्राथमिकता व खतरे की गंभीरता (0-100) के आधार पर SLA तय करता है।'
        : 'Classifies department, extracts critical safety keywords, and scores severity (0-100).',
      icon: Cpu,
    },
    {
      num: '04',
      title: isHindi ? 'जिम्मेदार बीएमसी कार्यालय' : 'Responsible Office Routing',
      desc: isHindi
        ? 'संबंधित बीएमसी ज़ोनल डिपो व फील्ड इंजीनियर को कार्य सौंपता है।'
        : 'Directly routes ticket to nearest BMC Zonal Office or Specialized Depot.',
      icon: Building2,
    },
    {
      num: '05',
      title: isHindi ? 'मानवीय ऑपरेटर सत्यापन' : 'Operator Human-in-the-Loop',
      desc: isHindi
        ? 'म्यूनिसिपल ऑपरेटर द्वारा 1-क्लिक में पुष्टि या समायोजन।'
        : 'Operators validate AI predictions with full audit logs and override capability.',
      icon: UserCheck,
    },
    {
      num: '06',
      title: isHindi ? 'त्वरित फील्ड कार्रवाई' : 'SLA Action & Public Tracking',
      desc: isHindi
        ? 'फील्ड टीमों द्वारा समाधान एवं नागरिक को लाइव ट्रैकिंग।'
        : 'Dispatches field teams with strict countdown SLA and real-time citizen updates.',
      icon: CheckCircle2,
    },
  ];

  return (
    <section className="relative bg-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800">
      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/80 border border-blue-600/30 text-sky-400 text-xs font-bold tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>{isHindi ? 'धरोहर से डिजिटल गवर्नेंस की ओर' : 'From Heritage to Next-Gen Governance'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {isHindi ? (
              <>
                स्मार्ट AI तकनीक से संचालित{' '}
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-amber-300 bg-clip-text text-transparent">
                  नागरिक समाधान तंत्र
                </span>
              </>
            ) : (
              <>
                Powering Bhopal with{' '}
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-amber-300 bg-clip-text text-transparent">
                  Intelligent Civic Infrastructure
                </span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {isHindi
              ? 'बिना किसी देरी के नागरिकों की शिकायतों की सटीक पहचान, स्वचालित वर्गीकरण और पारदर्शी नगर निगम कार्रवाई।'
              : 'Our auditable AI triage architecture ensures no complaint gets lost in municipal bureaucracy, providing instantaneous routing and public safety prioritization.'}
          </p>
        </div>

        {/* 6-Step Visual Lifecycle Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-blue-500/50 transition-all duration-300 group hover:-translate-y-1 shadow-lg shadow-black/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-black text-sky-400 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800/60">
                    STEP {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-sky-300 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Interactive Live Triage Simulator */}
        <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{isHindi ? 'लाइव AI ट्रायज सिमुलेटर' : 'Live AI Triage Simulator'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isHindi ? 'देखें AI शिकायतों को कैसे प्रोसेस करता है' : 'Experience How the AI Decodes Bhopal Grievances'}
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {SAMPLE_CASES.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedCase(item)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedCase.id === item.id
                      ? 'bg-blue-600 text-white shadow-md border border-blue-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {isHindi ? item.titleHi : item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Grievance Box */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Input Grievance Text</span>
                <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[11px] font-mono font-semibold">
                  {selectedCase.language}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 bg-slate-950 p-4 rounded-xl border border-slate-800 italic leading-relaxed">
                "{selectedCase.input}"
              </p>
              <div className="text-[11px] text-slate-400">
                <strong className="text-slate-300">Context: </strong>
                {isHindi ? selectedCase.rationaleHi : selectedCase.rationale}
              </div>
            </div>

            {/* AI Output Triage Card */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-blue-950/20 border border-blue-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-sky-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
                    AI Triage Engine Output
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      selectedCase.urgency === 'CRITICAL'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : selectedCase.urgency === 'HIGH'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {selectedCase.urgency} Urgency
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                    Score: {selectedCase.score}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Target Municipal Dept:</span>
                  <span className="font-bold text-white text-sm">{selectedCase.department}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Guaranteed SLA:</span>
                  <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedCase.sla}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Detected Locality / Ward:</span>
                  <span className="font-bold text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    {selectedCase.ward}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Assigned Dispatch Unit:</span>
                  <span className="font-bold text-sky-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-sky-400" />
                    {selectedCase.office}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Human-in-the-loop validation active on Operator Dashboard</span>
                </span>
                <Link
                  href="/dashboard/evaluation"
                  className="font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
                >
                  <span>View Benchmark Metrics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
