export type ComplaintLanguage = 'English' | 'Hindi' | 'Hinglish';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ComplaintStatus = 'NEW' | 'UNDER_REVIEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface AIClassificationResult {
  department: string;
  departmentCode: string;
  category: string;
  subCategory: string;
  confidence: number;
  keywords: string[];
  language: ComplaintLanguage;
  urgency: UrgencyLevel;
  urgencyScore: number;
  urgencyReasons: string[];
  severity: number;
  reason: string;
  isRuleBasedFallback: boolean;
}

export interface WardInfo {
  ward_id: string;
  ward_number: number;
  ward_name: string;
  zone_id: string;
  zone_name: string;
  center_lat: number;
  center_lng: number;
  aliases: string[];
}

export interface LocalityInfo {
  locality_id: string;
  locality_name: string;
  ward_id: string;
  pincode: string;
  center_lat: number;
  center_lng: number;
  aliases: string[];
}

export interface MunicipalOfficeInfo {
  office_id: string;
  office_name: string;
  department: string;
  zone_id: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  working_hours: string;
  is_head_office: boolean;
  distanceKm?: number;
}

export interface ResolvedLocation {
  latitude: number;
  longitude: number;
  address: string;
  locality: string;
  wardNumber: number;
  wardName: string;
  pincode: string;
  city: string;
  state: string;
  isGpsDetected: boolean;
  nearestOffice?: MunicipalOfficeInfo;
  recommendationSource: string;
}

export interface DuplicateMatch {
  complaintId: string;
  ticketId: string;
  title: string;
  description: string;
  locality: string;
  wardNumber: number;
  department: string;
  category: string;
  createdAt: string;
  similarityScore: number;
  reason: string;
}

export interface ComplaintSubmissionPayload {
  title: string;
  description: string;
  language?: ComplaintLanguage;
  photoCaption?: string;
  imageUrl?: string;
  audioTranscription?: string;
  latitude?: number;
  longitude?: number;
  locality?: string;
  wardNumber?: number;
  address?: string;
  isGpsDetected?: boolean;
}

export interface AcknowledgementTemplate {
  ticketId: string;
  department: string;
  locality: string;
  ward: string;
  urgency: UrgencyLevel;
  officeName: string;
  officePhone: string;
  message: string;
}
