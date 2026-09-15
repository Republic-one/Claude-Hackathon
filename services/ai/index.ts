import { classifyComplaint } from '@/services/classification/classifier';
import { calculateUrgency } from '@/services/urgency/scorer';
import { resolveLocationFromCoordinates, resolveLocationFromText } from '@/services/location/resolver';
import { detectDuplicates } from '@/services/duplicates/detector';
import { AIClassificationResult, ResolvedLocation, AcknowledgementTemplate } from '@/lib/types';

export interface FullComplaintAnalysis {
  classification: AIClassificationResult;
  location: ResolvedLocation;
  duplicateInfo: {
    probability: number;
    bestMatch: any;
    candidates: any[];
    reason: string;
  };
  acknowledgement: AcknowledgementTemplate;
}

export async function runFullAnalysis(params: {
  text: string;
  photoCaption?: string;
  audioTranscription?: string;
  latitude?: number;
  longitude?: number;
  manualLocality?: string;
}): Promise<FullComplaintAnalysis> {
  const { text, photoCaption, audioTranscription, latitude, longitude, manualLocality } = params;

  // 1. Classification & Language
  const classResult = classifyComplaint(text, photoCaption, audioTranscription);

  // 2. Urgency & Severity
  const urgencyResult = calculateUrgency(text, classResult.departmentCode, classResult.category);

  const classification: AIClassificationResult = {
    ...classResult,
    urgency: urgencyResult.level,
    urgencyScore: urgencyResult.score,
    urgencyReasons: urgencyResult.reasons,
    severity: urgencyResult.severity,
  };

  // 3. Location & Office Mapping
  let location: ResolvedLocation;
  if (latitude && longitude) {
    location = resolveLocationFromCoordinates(latitude, longitude, classification.department);
  } else if (manualLocality) {
    location = resolveLocationFromText(manualLocality, classification.department);
  } else {
    // Try to extract locality from text itself
    location = resolveLocationFromText(text, classification.department);
  }

  // 4. Duplicate Detection
  let duplicateInfo = {
    probability: 0,
    bestMatch: null as any,
    candidates: [] as any[],
    reason: 'Initial intake analysis (no database duplicates checked yet).',
  };

  try {
    duplicateInfo = await detectDuplicates({
      text,
      category: classification.category,
      department: classification.department,
      locality: location.locality,
      wardNumber: location.wardNumber,
    });
  } catch (err) {
    // In memory / before DB initialized, gracefully proceed
  }

  // 5. Acknowledgement Generation
  const dummyTicketId = 'BMC-2026-PENDING';
  const officeName = location.nearestOffice ? location.nearestOffice.office_name : 'Bhopal Municipal Corporation';
  const officePhone = location.nearestOffice ? location.nearestOffice.phone : '+91-755-2542222';

  const acknowledgement: AcknowledgementTemplate = {
    ticketId: dummyTicketId,
    department: classification.department,
    locality: location.locality,
    ward: `Ward ${location.wardNumber} (${location.wardName})`,
    urgency: classification.urgency,
    officeName,
    officePhone,
    message: `Your civic complaint has been registered successfully.\n\nComplaint ID: ${dummyTicketId}\nDepartment: ${classification.department}\nCategory: ${classification.category}\nArea: ${location.locality}\nWard: Ward ${location.wardNumber}\nPriority: ${classification.urgency}\nAssigned Office: ${officeName}\n\nStatus: The complaint has been forwarded to the municipal operator for review and assignment.\nHelpline: ${officePhone}`,
  };

  return {
    classification,
    location,
    duplicateInfo,
    acknowledgement,
  };
}
