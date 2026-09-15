'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Train,
  Zap,
  Radio,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Play,
  Pause,
  Compass,
} from 'lucide-react';

const STATIONS = [
  { name: 'AIIMS Bhopal', nameHi: 'एम्स भोपाल', line: 'Orange Line', distance: '0.0 km', status: 'Operational' },
  { name: 'DB City / MP Nagar', nameHi: 'डीबी सिटी / एमपी नगर', line: 'Orange Line', distance: '3.8 km', status: 'Active Hub' },
  { name: 'Subhash Nagar', nameHi: 'सुभाष नगर डिपो', line: 'Orange Line', distance: '6.2 km', status: 'Central Depot' },
  { name: 'Bhopal Junction', nameHi: 'भोपाल जंक्शन', line: 'Blue Line', distance: '9.4 km', status: 'Interchange' },
  { name: 'Karond Chauraha', nameHi: 'करौंद चौराहा', line: 'Orange Line', distance: '14.9 km', status: 'Phase-1 Ext' },
];

export const BhopalMetroFinale: React.FC = () => {
  const { locale } = useLanguage();
  const isHindi = locale === 'hi';
  const [stationIdx, setStationIdx] = useState(1);
  const [isMoving, setIsMoving] = useState(true);
  const [speed, setSpeed] = useState(58);

  useEffect(() => {
    if (!isMoving) return;
    const timer = setInterval(() => {
      setStationIdx((prev) => (prev + 1) % STATIONS.length);
      // Realistic speed fluctuation
      setSpeed(Math.floor(52 + Math.random() * 18));
    }, 4500);
    return () => clearInterval(timer);
  }, [isMoving]);

  const currentStation = STATIONS[stationIdx];

  return (
    <section className="relative bg-slate-950 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800">
      {/* City Background & Ambient Cyber Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105 transition-transform duration-1000"
          style={{
            backgroundImage: "url('/images/landmarks/bhopal-metro.jpg')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/85 to-slate-900/70" />
        <div className="absolute top-1/2 left-1/3 w-[650px] h-[350px] bg-orange-600/15 blur-[160px] rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-[500px] h-[300px] bg-sky-500/15 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-950/80 border border-orange-500/40 text-orange-300 text-xs font-bold tracking-wider uppercase">
            <Train className="w-3.5 h-3.5 text-orange-400" />
            <span>{isHindi ? 'भोपाल मेट्रो • स्मार्ट मोबिलिटी एवं भविष्य' : 'Bhopal Metro • The Next Horizon'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {isHindi ? (
              <>
                गतिशील, हरित एवं{' '}
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
                  स्मार्ट भोपाल की ओर
                </span>
              </>
            ) : (
              <>
                Moving Bhopal Toward a{' '}
                <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-sky-400 bg-clip-text text-transparent">
                  Smarter, Connected Future
                </span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            {isHindi
              ? 'भोपाल मेट्रो और स्मार्ट सिटी का एकीकृत डिजिटल इंफ्रास्ट्रक्चर — नागरिकों के जीवन को तेज, सुरक्षित और सुगम बनाने के लिए।'
              : 'The Bhopal Metro represents our city’s rapid stride into modern sustainable transit, directly interconnected with BMC smart corridors and civic services.'}
          </p>
        </div>

        {/* The Animated Metro Stage */}
        <div className="rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden space-y-8">
          {/* Top Realtime Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
              </span>
              <div className="font-bold text-slate-200">
                <span className="text-orange-400 font-mono">PRIORITY CORRIDOR: </span>
                <span>Orange Line (Subhash Nagar ⇄ AIIMS)</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 font-mono text-slate-300">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>CBTC Signaling: <strong>ACTIVE</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-slate-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Speed: <strong>{speed} km/h</strong></span>
              </div>
            </div>
          </div>

          {/* Animated Elevated Track & Metro Train Scene */}
          <div className="relative h-64 sm:h-72 w-full rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 overflow-hidden flex flex-col justify-end p-4">
            {/* Distant Skyline Silhouette */}
            <div className="absolute top-6 left-0 right-0 h-24 opacity-25 pointer-events-none flex items-end justify-between px-6">
              <div className="w-20 h-16 bg-slate-700 rounded-t-lg" />
              <div className="w-14 h-20 bg-slate-600 rounded-t-lg" />
              <div className="w-24 h-12 bg-slate-700 rounded-t-lg" />
              <div className="w-16 h-24 bg-slate-600 rounded-t-lg" />
              <div className="w-32 h-14 bg-slate-700 rounded-t-lg" />
              <div className="w-20 h-18 bg-slate-600 rounded-t-lg" />
            </div>

            {/* Station Callout Sign Floating */}
            <div className="absolute top-6 left-6 z-20 bg-slate-950/90 border border-orange-500/40 rounded-xl px-4 py-2 shadow-lg backdrop-blur-md">
              <div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Current Approaching Station</span>
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {isHindi ? currentStation.nameHi : currentStation.name}
              </div>
            </div>

            {/* The Moving Metro Train Container */}
            <div className="relative w-full h-32 flex items-end overflow-hidden">
              {/* Animated Train Graphic */}
              <div
                className={`flex items-end transition-transform duration-1000 ease-in-out ${
                  isMoving ? 'translate-x-0' : 'translate-x-1/4'
                }`}
                style={{ width: '120%' }}
              >
                {/* Metro Engine Coach */}
                <div className="relative w-72 sm:w-96 h-20 bg-gradient-to-r from-orange-500 via-slate-200 to-slate-100 rounded-tr-3xl rounded-tl-lg border border-slate-400 shadow-2xl flex items-center justify-between px-4 z-10">
                  {/* Front Headlights */}
                  <div className="absolute right-2 top-8 w-3.5 h-3.5 bg-amber-200 rounded-full shadow-[0_0_20px_6px_rgba(251,191,36,0.9)] animate-pulse" />
                  <div className="absolute right-2 bottom-4 w-3.5 h-3.5 bg-amber-200 rounded-full shadow-[0_0_20px_6px_rgba(251,191,36,0.9)] animate-pulse" />

                  {/* Windshield */}
                  <div className="absolute right-5 top-2 bottom-2 w-14 bg-slate-900 rounded-r-xl border border-sky-400/30 flex items-center justify-center">
                    <span className="text-[9px] font-mono text-orange-400 font-bold">BHOPAL</span>
                  </div>

                  {/* Windows */}
                  <div className="flex items-center gap-3 ml-2">
                    <div className="w-12 h-8 bg-sky-900/90 rounded-md border border-sky-400/40 shadow-inner flex items-center justify-center text-[10px] text-sky-200 font-mono">
                      MPMRCL
                    </div>
                    <div className="w-12 h-8 bg-sky-900/90 rounded-md border border-sky-400/40 shadow-inner" />
                    <div className="w-12 h-8 bg-sky-900/90 rounded-md border border-sky-400/40 shadow-inner hidden sm:block" />
                  </div>

                  {/* Orange Stripe & Logo */}
                  <div className="text-[10px] font-black tracking-wider text-orange-700 bg-white/80 px-2 py-0.5 rounded mr-16">
                    METRO
                  </div>
                </div>

                {/* Second Coach */}
                <div className="relative w-64 sm:w-80 h-20 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 border-t border-b border-l border-slate-400 shadow-xl flex items-center justify-around px-4 -ml-1">
                  <div className="w-12 h-8 bg-sky-900/90 rounded-md border border-sky-400/40 shadow-inner" />
                  <div className="w-12 h-8 bg-sky-900/90 rounded-md border border-sky-400/40 shadow-inner" />
                  <div className="w-12 h-8 bg-sky-900/90 rounded-md border border-sky-400/40 shadow-inner hidden sm:block" />
                </div>
              </div>
            </div>

            {/* Elevated Viaduct Concrete Bridge */}
            <div className="relative w-full h-8 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border-t-2 border-orange-500/80 shadow-lg flex items-center justify-between px-6 z-20">
              <div className="w-full flex justify-between">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-3 h-6 bg-slate-900 rounded-b border border-slate-600" />
                ))}
              </div>
            </div>
          </div>

          {/* Station Selector Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {STATIONS.map((st, i) => {
              const isSelected = i === stationIdx;
              return (
                <button
                  key={st.name}
                  onClick={() => {
                    setStationIdx(i);
                    setIsMoving(false);
                    setTimeout(() => setIsMoving(true), 2000);
                  }}
                  className={`p-3 rounded-2xl text-left transition-all border ${
                    isSelected
                      ? 'bg-orange-950/80 border-orange-500 text-white shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <div className="text-[10px] font-mono text-orange-400 font-bold mb-0.5">
                    {st.distance}
                  </div>
                  <div className="text-xs font-bold text-slate-100 truncate">
                    {isHindi ? st.nameHi : st.name}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{st.status}</div>
                </button>
              );
            })}
          </div>

          {/* Interactive Pause/Play Button */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setIsMoving(!isMoving)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center gap-2"
            >
              {isMoving ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isMoving ? 'Pause Animation' : 'Resume Metro Travel'}</span>
            </button>

            <a
              href="#intake-portal"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-orange-500/20"
            >
              <span>{isHindi ? 'शिकायत दर्ज करने के लिए आगे बढ़ें' : 'Proceed to Grievance Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
