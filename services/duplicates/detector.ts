import { DuplicateMatch } from '@/lib/types';
import { prisma } from '@/lib/prisma';

// Calculate Jaccard similarity of two token sets
function tokenJaccardSimilarity(text1: string, text2: string): number {
  const tokenize = (t: string) =>
    new Set(
      t
        .toLowerCase()
        .replace(/[^\w\s\u0900-\u097F]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const set1 = tokenize(text1);
  const set2 = tokenize(text2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) {
      intersection++;
    }
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export async function detectDuplicates(params: {
  text: string;
  category: string;
  department: string;
  locality?: string;
  wardNumber?: number;
  excludeTicketId?: string;
}): Promise<{
  probability: number;
  bestMatch: DuplicateMatch | null;
  candidates: DuplicateMatch[];
  reason: string;
}> {
  const { text, category, department, locality, wardNumber, excludeTicketId } = params;

  // Retrieve complaints within recent 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const recentComplaints = await prisma.complaint.findMany({
    where: {
      createdAt: { gte: fourteenDaysAgo },
      ...(excludeTicketId ? { ticketId: { not: excludeTicketId } } : {}),
    },
    select: {
      id: true,
      ticketId: true,
      title: true,
      description: true,
      locality: true,
      wardNumber: true,
      confirmedDepartment: true,
      confirmedCategory: true,
      createdAt: true,
      status: true,
    },
    take: 100,
  });

  const candidates: DuplicateMatch[] = [];

  for (const comp of recentComplaints) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Category & Department match (40% max)
    if (comp.confirmedCategory.toLowerCase() === category.toLowerCase()) {
      score += 40;
      reasons.push('Identical civic complaint category');
    } else if (comp.confirmedDepartment.toLowerCase() === department.toLowerCase()) {
      score += 20;
      reasons.push('Same department');
    }

    // 2. Locality & Ward match (30% max)
    if (locality && comp.locality && comp.locality.toLowerCase() === locality.toLowerCase()) {
      score += 30;
      reasons.push(`Same reported locality (${locality})`);
    } else if (wardNumber && comp.wardNumber && comp.wardNumber === wardNumber) {
      score += 18;
      reasons.push(`Same municipal ward (Ward ${wardNumber})`);
    }

    // 3. Text & Lexical Overlap (30% max)
    const combinedCurrent = `${text}`.toLowerCase();
    const combinedPast = `${comp.title} ${comp.description}`.toLowerCase();
    const jaccard = tokenJaccardSimilarity(combinedCurrent, combinedPast);

    score += Math.round(jaccard * 30);
    if (jaccard > 0.25) {
      reasons.push(`Strong vocabulary similarity (${Math.round(jaccard * 100)}% token overlap)`);
    }

    // Time window decay factor
    const daysAgo = (Date.now() - new Date(comp.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysAgo <= 3) {
      score = Math.min(100, score + 5);
      reasons.push('Reported within past 72 hours');
    }

    // Cap at 100
    const finalScore = Math.min(99, score);

    if (finalScore >= 50) {
      candidates.push({
        complaintId: comp.id,
        ticketId: comp.ticketId,
        title: comp.title,
        description: comp.description,
        locality: comp.locality || 'Bhopal',
        wardNumber: comp.wardNumber || 0,
        department: comp.confirmedDepartment,
        category: comp.confirmedCategory,
        createdAt: comp.createdAt.toISOString(),
        similarityScore: finalScore,
        reason: reasons.join('; '),
      });
    }
  }

  // Sort candidates by highest score
  candidates.sort((a, b) => b.similarityScore - a.similarityScore);

  const bestMatch = candidates[0] || null;
  const probability = bestMatch ? bestMatch.similarityScore : 0;

  let reason = 'No significant duplicate complaint detected in this locality or time window.';
  if (bestMatch) {
    reason = `Potential duplicate of #${bestMatch.ticketId} (${bestMatch.similarityScore}% match): ${bestMatch.reason}`;
  }

  return {
    probability,
    bestMatch,
    candidates: candidates.slice(0, 5),
    reason,
  };
}
