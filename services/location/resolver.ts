import fs from 'fs';
import path from 'path';
import { WardInfo, LocalityInfo, MunicipalOfficeInfo, ResolvedLocation } from '@/lib/types';

interface GazetteerData {
  city: string;
  state: string;
  defaultCoordinates: { lat: number; lng: number };
  wards: WardInfo[];
  localities: LocalityInfo[];
  municipal_offices: MunicipalOfficeInfo[];
}

function loadGazetteer(): GazetteerData {
  const filePath = path.join(process.cwd(), 'config', 'bhopal-gazetteer.json');
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContents);
}

// Haversine formula to compute distance between two coordinates in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function resolveLocationFromCoordinates(
  lat: number,
  lng: number,
  departmentName?: string
): ResolvedLocation {
  const gazetteer = loadGazetteer();

  // Find closest locality
  let nearestLocality: LocalityInfo = gazetteer.localities[0];
  let minLocalityDistance = Infinity;

  for (const loc of gazetteer.localities) {
    const dist = calculateDistanceKm(lat, lng, loc.center_lat, loc.center_lng);
    if (dist < minLocalityDistance) {
      minLocalityDistance = dist;
      nearestLocality = loc;
    }
  }

  // Find corresponding ward
  let matchedWard = gazetteer.wards.find((w) => w.ward_id === nearestLocality.ward_id);
  if (!matchedWard) {
    // Spatial nearest ward fallback
    let minWardDist = Infinity;
    for (const w of gazetteer.wards) {
      const dist = calculateDistanceKm(lat, lng, w.center_lat, w.center_lng);
      if (dist < minWardDist) {
        minWardDist = dist;
        matchedWard = w;
      }
    }
  }

  const wardNumber = matchedWard ? matchedWard.ward_number : 45;
  const wardName = matchedWard ? matchedWard.ward_name : 'Arera Colony / Habibganj';

  // Find responsible office based on department or nearest zonal office
  const nearestOffice = findResponsibleOffice(lat, lng, matchedWard?.zone_id, departmentName);

  return {
    latitude: lat,
    longitude: lng,
    address: `${nearestLocality.locality_name}, Ward ${wardNumber}, Bhopal, MP ${nearestLocality.pincode}`,
    locality: nearestLocality.locality_name,
    wardNumber,
    wardName,
    pincode: nearestLocality.pincode,
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    isGpsDetected: true,
    nearestOffice,
    recommendationSource: 'Browser Geolocation + Bhopal Gazetteer Spatial Match',
  };
}

export function resolveLocationFromText(query: string, departmentName?: string): ResolvedLocation {
  const gazetteer = loadGazetteer();
  const lower = query.toLowerCase();

  // 1. Check exact or alias match in localities
  let matchedLocality = gazetteer.localities.find((loc) => {
    if (loc.locality_name.toLowerCase().includes(lower) || lower.includes(loc.locality_name.toLowerCase())) {
      return true;
    }
    return loc.aliases.some((alias) => lower.includes(alias.toLowerCase()) || alias.toLowerCase().includes(lower));
  });

  // 2. Check wards if no locality matched
  let matchedWard: WardInfo | undefined;
  if (!matchedLocality) {
    matchedWard = gazetteer.wards.find((w) => {
      if (w.ward_name.toLowerCase().includes(lower) || lower.includes(w.ward_name.toLowerCase())) return true;
      return w.aliases.some((alias) => lower.includes(alias.toLowerCase()));
    });
    if (matchedWard) {
      matchedLocality = gazetteer.localities.find((l) => l.ward_id === matchedWard?.ward_id) || gazetteer.localities[0];
    }
  }

  if (!matchedLocality) {
    // Default fallback to central Bhopal
    matchedLocality = gazetteer.localities[0]; // Arera Colony (E-5)
  }

  if (!matchedWard) {
    matchedWard = gazetteer.wards.find((w) => w.ward_id === matchedLocality.ward_id) || gazetteer.wards[8];
  }

  const nearestOffice = findResponsibleOffice(
    matchedLocality.center_lat,
    matchedLocality.center_lng,
    matchedWard?.zone_id,
    departmentName
  );

  return {
    latitude: matchedLocality.center_lat,
    longitude: matchedLocality.center_lng,
    address: `${matchedLocality.locality_name}, Ward ${matchedWard.ward_number}, Bhopal, MP ${matchedLocality.pincode}`,
    locality: matchedLocality.locality_name,
    wardNumber: matchedWard.ward_number,
    wardName: matchedWard.ward_name,
    pincode: matchedLocality.pincode,
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    isGpsDetected: false,
    nearestOffice,
    recommendationSource: 'Manual Locality/Landmark Gazetteer Resolution',
  };
}

export function findResponsibleOffice(
  lat: number,
  lng: number,
  zoneId?: string,
  departmentName?: string
): MunicipalOfficeInfo {
  const gazetteer = loadGazetteer();
  let candidateOffices = gazetteer.municipal_offices;

  // If department matches specialized depot (e.g. Electrical depot, Water works, PWD)
  if (departmentName) {
    const lowerDept = departmentName.toLowerCase();
    const deptMatches = candidateOffices.filter((o) =>
      o.department.toLowerCase().includes(lowerDept) ||
      (lowerDept.includes('street light') && o.office_id === 'bmc-electrical-depot') ||
      (lowerDept.includes('water') && o.office_id === 'bmc-water-works') ||
      (lowerDept.includes('pothole') && o.office_id === 'bmc-pwd-roads')
    );
    if (deptMatches.length > 0) {
      candidateOffices = deptMatches;
    }
  }

  // Calculate distances for candidate offices
  const officesWithDistance = candidateOffices.map((office) => ({
    ...office,
    distanceKm: calculateDistanceKm(lat, lng, office.latitude, office.longitude),
  }));

  // Sort by shortest distance
  officesWithDistance.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  return officesWithDistance[0] || gazetteer.municipal_offices[0];
}

export function getAllWards(): WardInfo[] {
  return loadGazetteer().wards;
}

export function getAllLocalities(): LocalityInfo[] {
  return loadGazetteer().localities;
}

export function getAllMunicipalOffices(): MunicipalOfficeInfo[] {
  return loadGazetteer().municipal_offices;
}
