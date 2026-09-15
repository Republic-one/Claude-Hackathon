'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Building2, AlertTriangle, Layers } from 'lucide-react';

interface CivicMapProps {
  complaints: any[];
  offices: any[];
  selectedComplaint?: any;
}

export const CivicMap: React.FC<CivicMapProps> = ({ complaints, offices, selectedComplaint }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initLeaflet() {
      try {
        const L = (await import('leaflet')).default;

        const mapContainer = document.getElementById('bhopal-civic-leaflet-map');
        if (!mapContainer || (mapContainer as any)._leaflet_id) return;

        const map = L.map('bhopal-civic-leaflet-map').setView([23.259933, 77.412613], 12);

        // OpenStreetMap tile layer (graceful fallback if no proprietary key)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors | Bhopal Civic System',
          maxZoom: 18,
        }).addTo(map);

        // Office icon
        const officeIcon = L.divIcon({
          className: 'custom-office-icon',
          html: `<div style="background-color:#1e3a8a;color:#fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-size:14px;">🏢</div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        // Add municipal offices
        offices.forEach((off) => {
          if (off.latitude && off.longitude) {
            L.marker([off.latitude, off.longitude], { icon: officeIcon })
              .addTo(map)
              .bindPopup(`
                <div style="font-family:sans-serif;font-size:12px;padding:4px;">
                  <strong style="color:#1e3a8a;">${off.office_name || off.officeName}</strong><br/>
                  <span style="color:#64748b;">${off.department}</span><br/>
                  <small style="color:#475569;">${off.address}</small><br/>
                  <b style="color:#0284c7;">${off.phone}</b>
                </div>
              `);
          }
        });

        // Add complaint pins
        complaints.forEach((c) => {
          if (c.latitude && c.longitude) {
            const pinColor =
              c.urgency === 'Critical'
                ? '#f43f5e'
                : c.urgency === 'High'
                ? '#f97316'
                : c.urgency === 'Medium'
                ? '#eab308'
                : '#10b981';

            const compIcon = L.divIcon({
              className: 'custom-comp-icon',
              html: `<div style="background-color:${pinColor};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            });

            L.marker([c.latitude, c.longitude], { icon: compIcon })
              .addTo(map)
              .bindPopup(`
                <div style="font-family:sans-serif;font-size:11px;padding:4px;max-width:200px;">
                  <span style="font-family:monospace;font-weight:bold;color:#1d4ed8;">${c.ticketId}</span><br/>
                  <strong>${c.title}</strong><br/>
                  <span style="color:#64748b;">${c.confirmedDepartment}</span><br/>
                  <span style="color:#d97706;font-weight:bold;">${c.urgency} Priority</span><br/>
                  <a href="/dashboard/complaints/${c.ticketId}" style="color:#0284c7;font-weight:bold;text-decoration:none;display:inline-block;margin-top:4px;">View Ticket →</a>
                </div>
              `);
          }
        });

        if (isMounted) setMapLoaded(true);
      } catch (err) {
        console.error('Error initializing Leaflet map:', err);
        if (isMounted) setMapError(true);
      }
    }

    initLeaflet();

    return () => {
      isMounted = false;
    };
  }, [complaints, offices]);

  if (mapError) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="text-sm font-bold text-slate-800">Map Rendering Fallback</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Online map tiles could not be initialized. Active complaints and municipal offices remain fully accessible through the structured list below.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <div id="bhopal-civic-leaflet-map" className="w-full h-full"></div>

      {/* Floating Legend */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/90 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-[11px] space-y-1.5">
        <span className="font-bold text-slate-800 block text-[10px] uppercase">Map Legend</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 border border-white"></div>
          <span>Critical Grievance</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 border border-white"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white"></div>
          <span>Low Priority</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
          <span className="text-sm">🏢</span>
          <span className="font-semibold text-blue-900">BMC Municipal Office</span>
        </div>
      </div>
    </div>
  );
};
