'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Building2,
  FilePlus,
  Search,
  LayoutDashboard,
  Table,
  MapPin,
  BarChart3,
  BrainCircuit,
  UploadCloud,
  Menu,
  X,
  AlertTriangle,
  Languages,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const moreTools = [
    { href: '/dashboard/reports', label: t.weeklyReports, icon: BarChart3, desc: 'SLA & resolution analytics by department' },
    { href: '/dashboard/evaluation', label: t.aiEvaluation, icon: BrainCircuit, desc: 'Held-out test benchmark & NLP accuracy' },
    { href: '/dashboard/import', label: t.importCsv, icon: UploadCloud, desc: 'Batch import & validate historical CSV complaints' },
  ];

  const isMoreActive = moreTools.some((tool) => pathname === tool.href);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Civic Authority Notification Strip */}
      <div className="bg-slate-950 text-slate-300 text-xs px-4 sm:px-8 py-1.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200 tracking-wide truncate">
            Bhopal Municipal Corporation (BMC)
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="text-slate-400 text-[11px] hidden md:inline truncate">
            Smart City Citizen Grievance & AI Triage System
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">{t.demoBadge}</span>
            <span className="sm:hidden">Demo</span>
          </span>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <Languages className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            <button
              onClick={() => setLocale('en')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                locale === 'en' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale('hi')}
              className={`px-2 py-0.5 text-xs rounded font-medium transition ${
                locale === 'hi' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-3.5 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl">
                  Bhopal Civic Intelligence
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                AI Triage, Urgency Scoring & Municipal Routing Hub
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-2">
            {/* Primary Action: Report Complaint */}
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                pathname === '/'
                  ? 'bg-blue-600 text-white shadow-blue-600/30'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              <span>{t.reportComplaint}</span>
            </Link>

            {/* Track Grievance */}
            <Link
              href="/track"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname.startsWith('/track')
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{t.trackComplaint}</span>
            </Link>

            {/* Subtle Divider */}
            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* Operator Dashboard */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === '/dashboard'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t.operatorDashboard}</span>
            </Link>

            {/* Complaint Queue */}
            <Link
              href="/dashboard/complaints"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname.startsWith('/dashboard/complaints')
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>{t.complaintQueue}</span>
            </Link>

            {/* Cluster Map */}
            <Link
              href="/dashboard/map"
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname === '/dashboard/map'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t.clusterMap}</span>
            </Link>

            {/* Dropdown Menu for Analytics, Evaluation, Import */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isMoreActive
                    ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>More Tools</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Analytics & Data Operations
                  </div>
                  {moreTools.map((tool) => {
                    const Icon = tool.icon;
                    const active = pathname === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition ${
                          active ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{tool.label}</div>
                          <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{tool.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Medium Screen View: Compact quick links */}
          <div className="hidden lg:flex xl:hidden items-center gap-2">
            <Link
              href="/"
              className="px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>Report</span>
            </Link>
            <Link
              href="/track"
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track</span>
            </Link>
            <Link
              href="/dashboard"
              className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Mobile & Tablet Hamburger Button */}
          <div className="xl:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200 max-h-[85vh] overflow-y-auto">
          {/* Citizen Services */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Citizen Services
            </div>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                pathname === '/' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <FilePlus className="w-4 h-4" />
              {t.reportComplaint}
            </Link>
            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                pathname.startsWith('/track') ? 'bg-slate-900 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              {t.trackComplaint}
            </Link>
          </div>

          {/* Municipal Operator Tools */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Municipal Operator & Triage Tools
            </div>
            {[
              { href: '/dashboard', label: t.operatorDashboard, icon: LayoutDashboard },
              { href: '/dashboard/complaints', label: t.complaintQueue, icon: Table },
              { href: '/dashboard/map', label: t.clusterMap, icon: MapPin },
              { href: '/dashboard/reports', label: t.weeklyReports, icon: BarChart3 },
              { href: '/dashboard/evaluation', label: t.aiEvaluation, icon: BrainCircuit },
              { href: '/dashboard/import', label: t.importCsv, icon: UploadCloud },
            ].map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-700' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
