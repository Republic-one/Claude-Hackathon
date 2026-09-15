'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import {
  Sparkles,
  ArrowRight,
  LayoutDashboard,
  Search,
  ShieldCheck,
  ChevronDown,
  Building2,
  Cpu,
  MapPin,
  Clock,
  Flame,
} from 'lucide-react';

interface LandingHeroProps {
  onExploreClick?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onExploreClick }) => {
  const { locale, t } = useLanguage();

  const isHindi = locale === 'hi';

  const stats = [
    { label: isHindi ? 'भोपाल वार्ड्स' : 'BMC Wards', val: '85', sub: isHindi ? 'पूर्णतः मैप' : 'GIS Integrated', icon: MapPin },
    { label: isHindi ? 'ज़ोनल ऑफिस' : 'Zonal Depots', val: '19', sub: isHindi ? 'सक्रिय डिस्पैच' : 'Live Connected', icon: Building2 },
    { label: isHindi ? 'AI ट्रायज गति' : 'AI Triage Speed', val: '< 2.4s', sub: isHindi ? 'तत्काल विश्लेषण' : 'Multilingual NLP', icon: Cpu },
    { label: isHindi ? 'SLA ट्रैकिंग' : 'SLA Compliance', val: '99.4%', sub: isHindi ? 'पारदर्शी मॉनिटरिंग' : 'Strict Urgency', icon: Clock },
  ];

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-slate-950 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
      {/* Background Graphic & Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: "url('/images/landmarks/smart-city-hero.jpg')",
          }}
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[450px] h-[350px] bg-sky-500/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute top-10 left-10 w-[350px] h-[250px] bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto w-full text-center space-y-8 my-auto">
        {/* Top Civic Authority Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-sky-500/30 text-sky-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-sky-950/50 hover:border-sky-400/50 transition">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>
            {isHindi
              ? 'भोपाल नगर निगम • स्मार्ट सिटी नागरिक शिकायत एवं AI ट्रायज प्रणाली'
              : 'Bhopal Municipal Corporation • Smart City Grievance & AI Triage'}
          </span>
        </div>

        {/* Main Hero Typography */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1] drop-shadow-sm">
            {isHindi ? (
              <>
                स्मार्ट, जवाबदेह और आधुनिक <br />
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-amber-300 bg-clip-text text-transparent">
                  भोपाल का निर्माण
                </span>
              </>
            ) : (
              <>
                Building a Smarter, More Responsive{' '}
                <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-amber-300 bg-clip-text text-transparent">
                  Bhopal
                </span>
              </>
            )}
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            {isHindi
              ? 'नागरिकों की शिकायतों को बहुभाषी AI ट्रायज, लाइव वार्ड मैपिंग और पारदर्शी SLA के साथ त्वरित समाधान में बदलें।'
              : 'Transform citizen grievances into verified, prioritized civic action with Hindi/English AI triage, 85-ward geolocation routing, and transparent municipal accountability.'}
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {/* Primary CTA: Jump to Grievance Intake Form */}
          <a
            href="#intake-portal"
            className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2.5"
          >
            <Flame className="w-5 h-5 text-amber-300" />
            <span>{isHindi ? 'शिकायत दर्ज करें' : 'Report Civic Grievance'}</span>
            <ArrowRight className="w-4 h-4" />
          </a>

          {/* Secondary CTA: Track Grievance */}
          <Link
            href="/track"
            className="px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700/80 hover:border-slate-600 font-bold text-sm sm:text-base shadow-lg backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition flex items-center gap-2.5"
          >
            <Search className="w-4 h-4 text-sky-400" />
            <span>{isHindi ? 'शिकायत ट्रैक करें' : 'Track Grievance'}</span>
          </Link>

          {/* Tertiary CTA: Operator Dashboard */}
          <Link
            href="/dashboard"
            className="px-6 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800 font-semibold text-sm sm:text-base backdrop-blur-sm transition flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            <span>{isHindi ? 'ऑपरेटर डैशबोर्ड' : 'Operator Portal'}</span>
          </Link>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 pt-6 max-w-4xl mx-auto">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-left hover:border-slate-700 transition group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <Icon className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {stat.val}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Cinematic Scroll Indicator */}
      <div className="relative z-10 pt-10 text-center flex flex-col items-center justify-center">
        <a
          href="#bhopal-journey"
          onClick={onExploreClick}
          className="group inline-flex flex-col items-center gap-2 text-slate-400 hover:text-sky-300 transition cursor-pointer"
        >
          <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-slate-400 group-hover:text-sky-300 transition">
            {isHindi ? 'भोपाल की धरोहर एवं स्मार्ट यात्रा देखें' : 'SCROLL TO EXPLORE BHOPAL'}
          </span>
          <div className="w-8 h-12 rounded-full border-2 border-slate-700 group-hover:border-sky-400 flex items-start justify-center p-1.5 transition">
            <div className="w-1.5 h-3 bg-sky-400 rounded-full animate-bounce" />
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-sky-300 transition" />
        </a>
      </div>
    </section>
  );
};
