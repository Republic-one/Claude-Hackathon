'use client';

import React from 'react';
import { LandingHero } from '@/components/landing/LandingHero';
import { BhopalLandmarksJourney } from '@/components/landing/BhopalLandmarksJourney';
import { CivicTechTransition } from '@/components/landing/CivicTechTransition';
import { BhopalMetroFinale } from '@/components/landing/BhopalMetroFinale';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* 1. Full-Screen Cinematic Hero */}
      <LandingHero />

      {/* 2 & 3 & 4 & 5. 3D Scroll Journey: Top 7 Famous Places of Bhopal */}
      <BhopalLandmarksJourney />

      {/* 6 & 7. Civic Technology Transition & Live Pipeline Simulator */}
      <CivicTechTransition />

      {/* 8. Bhopal Metro Finale: Futuristic Transit Showcase */}
      <BhopalMetroFinale />

      {/* 9 & 10. Final Civic CTA & Working Grievance Intake Portal */}
      <FinalCTASection />
    </div>
  );
}
