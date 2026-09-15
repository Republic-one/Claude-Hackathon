import { UrgencyLevel } from '@/lib/types';

export interface UrgencyAnalysis {
  score: number;
  level: UrgencyLevel;
  severity: number; // 1 to 5
  reasons: string[];
}

export function calculateUrgency(text: string, departmentCode: string, category: string): UrgencyAnalysis {
  const lower = text.toLowerCase();
  let score = 15; // baseline score
  const reasons: string[] = [];

  // 1. PUBLIC SAFETY EVALUATION
  let publicSafetyFound = false;

  if (
    lower.includes('dark road') ||
    lower.includes('bilkul dark') ||
    lower.includes('road dark') ||
    lower.includes('raat ko dark') ||
    lower.includes('andhera') ||
    lower.includes('visibility')
  ) {
    score += 20;
    reasons.push('Road visibility and night-time pedestrian safety hazard');
    publicSafetyFound = true;
  }

  if (
    lower.includes('open manhole') ||
    lower.includes('manhole open') ||
    lower.includes('khula manhole') ||
    lower.includes('dhakkan') ||
    lower.includes('मैनहोल') ||
    lower.includes('ढक्कन') ||
    category.toLowerCase().includes('manhole')
  ) {
    score += 50;
    reasons.push('Open or broken manhole poses direct fatal fall risk');
    publicSafetyFound = true;
  }

  if (
    lower.includes('exposed wire') ||
    lower.includes('live wire') ||
    lower.includes('khula taar') ||
    lower.includes('electric shock') ||
    lower.includes('sparking') ||
    lower.includes('current aa raha') ||
    category.toLowerCase().includes('wire')
  ) {
    score += 50;
    reasons.push('Exposed electrical wiring or electrocution hazard');
    publicSafetyFound = true;
  }

  if (
    lower.includes('flooding') ||
    lower.includes('water logging') ||
    lower.includes('jal bharav') ||
    lower.includes('ghar me pani') ||
    lower.includes('submerged') ||
    category.toLowerCase().includes('water logging')
  ) {
    score += 40;
    reasons.push('Severe monsoon waterlogging entering homes or submerging roads');
    publicSafetyFound = true;
  }

  if (
    lower.includes('cave in') ||
    lower.includes('road sink') ||
    lower.includes('sadak dhans') ||
    lower.includes('gehra gaddha') ||
    lower.includes('deep pothole') ||
    lower.includes('bike gir gayi') ||
    lower.includes('accident')
  ) {
    score += 35;
    reasons.push('Hazardous road condition with reported accident risk');
    publicSafetyFound = true;
  }

  if (
    lower.includes('dog bite') ||
    lower.includes('rabid') ||
    lower.includes('kutta kaat') ||
    lower.includes('aggressive stray dog')
  ) {
    score += 35;
    reasons.push('Aggressive stray animal pack or dog bite hazard');
    publicSafetyFound = true;
  }

  if (
    lower.includes('dirty water') ||
    lower.includes('contaminated') ||
    lower.includes('ganda pani') ||
    lower.includes('dengue') ||
    lower.includes('malaria')
  ) {
    score += 35;
    reasons.push('Drinking water contamination or vector-borne epidemic hazard');
    publicSafetyFound = true;
  }

  // 2. SERVICE OUTAGE EVALUATION
  if (
    lower.includes('street light band') ||
    lower.includes('street light') ||
    lower.includes('light nahi') ||
    lower.includes('batti band') ||
    lower.includes('street light failure') ||
    departmentCode === 'STREET_LIGHTING'
  ) {
    score += 20;
    reasons.push('Public street illumination civic infrastructure failure');
  }

  if (
    lower.includes('pani nahi aa raha') ||
    lower.includes('no water') ||
    lower.includes('nal me pani nahi') ||
    lower.includes('water cut') ||
    departmentCode === 'WATER_SUPPLY'
  ) {
    score += 25;
    reasons.push('Essential drinking water supply disrupted');
  }

  if (
    lower.includes('sewer overflow') ||
    lower.includes('gutter ufan') ||
    lower.includes('sewage on street') ||
    departmentCode === 'SEWERAGE_DRAINAGE'
  ) {
    score += 25;
    reasons.push('Sanitary sewage overflow causing bio-hazard in residential area');
  }

  if (
    lower.includes('kachra gaadi nahi aayi') ||
    lower.includes('garbage heap') ||
    lower.includes('kachre ka dher')
  ) {
    score += 15;
    reasons.push('Uncollected municipal solid waste accumulation');
  }

  // 3. DURATION FACTOR EXTRACTION
  const durationMatch =
    lower.match(/(\d+)\s*(din|day|days|hafte|week|weeks)/i) ||
    lower.match(/(teen|char|paanch|3|4|5|7)\s*(din|days)/i);

  if (durationMatch) {
    let days = parseInt(durationMatch[1], 10);
    if (isNaN(days)) {
      const word = durationMatch[1].toLowerCase();
      if (word === 'teen') days = 3;
      else if (word === 'char') days = 4;
      else if (word === 'paanch') days = 5;
      else days = 3;
    }

    if (days >= 7) {
      score += 25;
      reasons.push(`Problem persistent for over 7 days (${days} days reported)`);
    } else if (days >= 4) {
      score += 20;
      reasons.push(`Problem reported for ${days} days (exceeds municipal SLA)`);
    } else if (days >= 2) {
      score += 15;
      reasons.push(`Problem reported for ${days} days`);
    } else if (days >= 1) {
      score += 10;
      reasons.push(`Ongoing outage reported for ${days} day`);
    }
  } else if (lower.includes('week') || lower.includes('hafte')) {
    score += 20;
    reasons.push('Prolonged issue reported across multiple days');
  }

  // Cap score at 100 max, 10 min
  score = Math.min(100, Math.max(10, score));

  // Determine Level and Severity
  let level: UrgencyLevel = 'Medium';
  let severity = 3;

  if (score >= 81) {
    level = 'Critical';
    severity = 5;
  } else if (score >= 61) {
    level = 'High';
    severity = 4;
  } else if (score >= 31) {
    level = 'Medium';
    severity = 3;
  } else {
    level = 'Low';
    severity = 2;
  }

  if (reasons.length === 0) {
    reasons.push('Standard priority assigned based on municipal category SLA');
  }

  return {
    score,
    level,
    severity,
    reasons,
  };
}
