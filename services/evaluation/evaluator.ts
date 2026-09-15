import fs from 'fs';
import path from 'path';
import { classifyComplaint } from '@/services/classification/classifier';
import { calculateUrgency } from '@/services/urgency/scorer';

export interface EvaluationResult {
  totalTestCases: number;
  departmentAccuracy: number;
  categoryAccuracy: number;
  urgencyAgreement: number;
  duplicateF1: number;
  duplicatePrecision: number;
  duplicateRecall: number;
  averageConfidence: number;
  evaluatedAt: string;
  confusionMatrix: {
    departments: string[];
    matrix: number[][];
  };
  samplePredictions: {
    id: string;
    text: string;
    trueDept: string;
    predDept: string;
    trueCat: string;
    predCat: string;
    trueUrgency: string;
    predUrgency: string;
    confidence: number;
    isDeptCorrect: boolean;
    isCatCorrect: boolean;
  }[];
}

let cachedEvaluation: EvaluationResult | null = null;

export function runModelEvaluation(): EvaluationResult {
  const filePath = path.join(process.cwd(), 'config', 'evaluation-dataset.json');
  const rawData = fs.readFileSync(filePath, 'utf-8');
  const dataset = JSON.parse(rawData);

  const testCases = dataset.test_cases || [];
  const duplicatePairs = dataset.duplicate_pairs || [];

  let correctDept = 0;
  let correctCat = 0;
  let correctUrgency = 0;
  let totalConfidence = 0;

  const deptList = [
    'Street Lighting / Electrical',
    'Water Supply',
    'Sewerage / Drainage',
    'Solid Waste Management',
    'Roads / Potholes',
    'Sanitation',
    'Public Health',
    'Parks / Gardens',
    'Encroachment',
    'Stray Animals',
    'Traffic-related civic infrastructure',
    'Storm Water Drainage',
    'Public Toilets',
    'Tree / Horticulture',
  ];

  // Initialize confusion matrix
  const matrix: number[][] = Array(deptList.length)
    .fill(0)
    .map(() => Array(deptList.length).fill(0));

  const samplePredictions = [];

  for (const tc of testCases) {
    const classRes = classifyComplaint(tc.text);
    const urgencyRes = calculateUrgency(tc.text, classRes.departmentCode, classRes.category);

    const isDeptMatch = classRes.department.toLowerCase() === tc.true_department.toLowerCase();
    const isCatMatch = classRes.category.toLowerCase() === tc.true_category.toLowerCase();
    const isUrgencyMatch = urgencyRes.level.toLowerCase() === tc.true_urgency.toLowerCase();

    if (isDeptMatch) correctDept++;
    if (isCatMatch) correctCat++;
    if (isUrgencyMatch) correctUrgency++;
    totalConfidence += classRes.confidence;

    // Fill confusion matrix
    const trueIndex = deptList.findIndex((d) => d.toLowerCase() === tc.true_department.toLowerCase());
    const predIndex = deptList.findIndex((d) => d.toLowerCase() === classRes.department.toLowerCase());
    if (trueIndex !== -1 && predIndex !== -1) {
      matrix[trueIndex][predIndex]++;
    }

    samplePredictions.push({
      id: tc.id,
      text: tc.text,
      trueDept: tc.true_department,
      predDept: classRes.department,
      trueCat: tc.true_category,
      predCat: classRes.category,
      trueUrgency: tc.true_urgency,
      predUrgency: urgencyRes.level,
      confidence: classRes.confidence,
      isDeptCorrect: isDeptMatch,
      isCatCorrect: isCatMatch,
    });
  }

  // Duplicate Pair Evaluation
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;

  for (const pair of duplicatePairs) {
    // Check keyword overlap and same category
    const cat1 = classifyComplaint(pair.text1).category;
    const cat2 = classifyComplaint(pair.text2).category;
    const isPredictedDuplicate = cat1 === cat2 && pair.locality1 === pair.locality2;

    if (isPredictedDuplicate && pair.is_duplicate) tp++;
    else if (isPredictedDuplicate && !pair.is_duplicate) fp++;
    else if (!isPredictedDuplicate && pair.is_duplicate) fn++;
    else tn++;
  }

  const duplicatePrecision = tp + fp > 0 ? tp / (tp + fp) : 1.0;
  const duplicateRecall = tp + fn > 0 ? tp / (tp + fn) : 1.0;
  const duplicateF1 =
    duplicatePrecision + duplicateRecall > 0
      ? (2 * duplicatePrecision * duplicateRecall) / (duplicatePrecision + duplicateRecall)
      : 1.0;

  const total = testCases.length || 1;
  const result: EvaluationResult = {
    totalTestCases: total,
    departmentAccuracy: Number(((correctDept / total) * 100).toFixed(1)),
    categoryAccuracy: Number(((correctCat / total) * 100).toFixed(1)),
    urgencyAgreement: Number(((correctUrgency / total) * 100).toFixed(1)),
    duplicateF1: Number(duplicateF1.toFixed(2)),
    duplicatePrecision: Number((duplicatePrecision * 100).toFixed(1)),
    duplicateRecall: Number((duplicateRecall * 100).toFixed(1)),
    averageConfidence: Number(((totalConfidence / total) * 100).toFixed(1)),
    evaluatedAt: new Date().toISOString(),
    confusionMatrix: {
      departments: deptList,
      matrix,
    },
    samplePredictions,
  };

  cachedEvaluation = result;
  return result;
}

export function getCachedEvaluation(): EvaluationResult | null {
  return cachedEvaluation;
}
