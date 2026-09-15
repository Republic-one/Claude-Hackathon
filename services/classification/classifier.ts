import fs from 'fs';
import path from 'path';
import { AIClassificationResult, ComplaintLanguage } from '@/lib/types';

interface DepartmentCategory {
  id: string;
  name: string;
  nameHindi: string;
  subCategories: string[];
  keywordsEnglish: string[];
  keywordsHindi: string[];
  keywordsHinglish: string[];
  defaultUrgency: string;
  safetyRiskFactor: number;
  outageRiskFactor: number;
}

interface Department {
  id: string;
  code: string;
  name: string;
  nameHindi: string;
  bmcDivision: string;
  slaDays: number;
  contactEmail: string;
  categories: DepartmentCategory[];
}

interface TaxonomyConfig {
  departments: Department[];
}

function loadTaxonomy(): TaxonomyConfig {
  const filePath = path.join(process.cwd(), 'config', 'departments.json');
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContents);
}

export function detectLanguage(text: string): ComplaintLanguage {
  // Check for Devanagari script unicode range: \u0900-\u097F
  const devanagariRegex = /[\u0900-\u097F]/;
  if (devanagariRegex.test(text)) {
    return 'Hindi';
  }

  const hinglishTokens = [
    'hamare', 'hamara', 'humare', 'area', 'me', 'mein', 'se', 'din', 'hai', 'hain',
    'raat', 'ko', 'bilkul', 'dark', 'rehta', 'band', 'kharab', 'pani', 'paani', 'nahi',
    'aa', 'raha', 'gaddha', 'sadak', 'sadke', 'kachra', 'kuda', 'badboo', 'bohot',
    'bhi', 'kripya', 'shikayat', 'dhakkan', 'manhole', 'khula', 'taar', 'bijli',
    'sewer', 'gutter', 'machhar', 'dawa', 'chhidkao', 'gaadi', 'jhula', 'ped', 'gir',
    'gaya', 'thela', 'kabza', 'kutta', 'kaat', 'rasta', 'nal', 'nalo'
  ];

  const lower = text.toLowerCase();
  const words = lower.split(/[\s,.\-?!()]+/);
  let hinglishCount = 0;

  for (const word of words) {
    if (hinglishTokens.includes(word)) {
      hinglishCount++;
    }
  }

  if (hinglishCount >= 2 || (words.length <= 6 && hinglishCount >= 1)) {
    return 'Hinglish';
  }

  return 'English';
}

export function classifyComplaint(
  text: string,
  imageCaption?: string,
  audioTranscription?: string
): Omit<AIClassificationResult, 'urgency' | 'urgencyScore' | 'urgencyReasons' | 'severity'> {
  const taxonomy = loadTaxonomy();
  const fullText = [text, imageCaption, audioTranscription].filter(Boolean).join(' ');
  const language = detectLanguage(fullText);
  const normalizedText = fullText.toLowerCase();

  let bestDept: Department | null = null;
  let bestCategory: DepartmentCategory | null = null;
  let highestScore = 0;
  let matchedKeywords: string[] = [];

  for (const dept of taxonomy.departments) {
    for (const cat of dept.categories) {
      let score = 0;
      const foundKeywords: string[] = [];

      const keywordSets = [
        ...cat.keywordsEnglish,
        ...cat.keywordsHindi,
        ...cat.keywordsHinglish,
      ];

      for (const kw of keywordSets) {
        const lowerKw = kw.toLowerCase();
        if (normalizedText.includes(lowerKw)) {
          // Longer phrases get exponentially higher weight
          const tokenCount = lowerKw.split(' ').length;
          const weight = tokenCount > 1 ? 4 * tokenCount : 2;
          score += weight;
          if (!foundKeywords.includes(kw)) {
            foundKeywords.push(kw);
          }
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestDept = dept;
        bestCategory = cat;
        matchedKeywords = foundKeywords;
      }
    }
  }

  // Fallback to "Other" if no strong match
  if (!bestDept || !bestCategory || highestScore === 0) {
    const otherDept = taxonomy.departments.find((d) => d.code === 'OTHER') || taxonomy.departments[taxonomy.departments.length - 1];
    const otherCat = otherDept.categories[0];
    return {
      department: otherDept.name,
      departmentCode: otherDept.code,
      category: otherCat.name,
      subCategory: otherCat.subCategories[0] || 'General',
      confidence: 0.45,
      keywords: ['general inquiry', 'unclassified'],
      language,
      reason: 'Rule-based fallback: No specific civic keyword found with high confidence; routed to Central Citizen Grievance Cell.',
      isRuleBasedFallback: true,
    };
  }

  // Calculate confidence score normalized to 0.70 - 0.98
  const baseConfidence = Math.min(0.98, 0.72 + Math.min(highestScore, 8) * 0.032);
  const selectedSubCategory = bestCategory.subCategories[0] || 'General';

  let explanationReason = `Complaint explicitly mentions civic indicators: "${matchedKeywords.slice(0, 3).join('", "')}". System mapped to ${bestDept.name} (${bestCategory.name}).`;
  if (language === 'Hinglish') {
    explanationReason += ' Hinglish vernacular terms were recognized and normalized.';
  } else if (language === 'Hindi') {
    explanationReason += ' Devanagari Hindi terminology matched department civic guidelines.';
  }

  return {
    department: bestDept.name,
    departmentCode: bestDept.code,
    category: bestCategory.name,
    subCategory: selectedSubCategory,
    confidence: Number(baseConfidence.toFixed(2)),
    keywords: matchedKeywords.length > 0 ? matchedKeywords.slice(0, 6) : [bestCategory.name.toLowerCase()],
    language,
    reason: explanationReason,
    isRuleBasedFallback: true,
  };
}
