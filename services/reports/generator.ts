import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export interface DepartmentSummaryReport {
  departmentCode: string;
  departmentName: string;
  nameHindi: string;
  receivedCount: number;
  resolvedCount: number;
  pendingCount: number;
  medianResolutionDays: number;
  highPriorityCount: number;
  duplicateCount: number;
  topCategories: { category: string; count: number }[];
  topLocalities: { locality: string; count: number }[];
  repeatClusters: { locality: string; issue: string; count: number }[];
}

export interface EmergingClusterAlert {
  locality: string;
  department: string;
  category: string;
  complaintCount: number;
  timeframe: string;
  severity: string;
  sampleTicketIds: string[];
}

export async function generateWeeklyReports(): Promise<{
  reports: DepartmentSummaryReport[];
  emergingClusters: EmergingClusterAlert[];
}> {
  // Load departments from config
  const deptConfigPath = path.join(process.cwd(), 'config', 'departments.json');
  const { departments } = JSON.parse(fs.readFileSync(deptConfigPath, 'utf-8'));

  const allComplaints = await prisma.complaint.findMany({
    select: {
      id: true,
      ticketId: true,
      confirmedDepartment: true,
      confirmedCategory: true,
      locality: true,
      urgency: true,
      status: true,
      isDuplicate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const reports: DepartmentSummaryReport[] = [];

  for (const dept of departments) {
    const deptComplaints = allComplaints.filter(
      (c) => c.confirmedDepartment.toLowerCase() === dept.name.toLowerCase()
    );

    const receivedCount = deptComplaints.length;
    const resolvedCount = deptComplaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const pendingCount = receivedCount - resolvedCount;
    const highPriorityCount = deptComplaints.filter((c) => c.urgency === 'High' || c.urgency === 'Critical').length;
    const duplicateCount = deptComplaints.filter((c) => c.isDuplicate).length;

    // Median resolution days
    const resolvedDurations: number[] = [];
    for (const c of deptComplaints) {
      if (c.status === 'RESOLVED' || c.status === 'CLOSED') {
        const days = Math.max(0.5, (new Date(c.updatedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        resolvedDurations.push(days);
      }
    }
    resolvedDurations.sort((a, b) => a - b);
    const medianResolutionDays =
      resolvedDurations.length > 0
        ? Number(resolvedDurations[Math.floor(resolvedDurations.length / 2)].toFixed(1))
        : dept.slaDays;

    // Top categories
    const categoryCounts: Record<string, number> = {};
    for (const c of deptComplaints) {
      categoryCounts[c.confirmedCategory] = (categoryCounts[c.confirmedCategory] || 0) + 1;
    }
    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Top localities
    const localityCounts: Record<string, number> = {};
    for (const c of deptComplaints) {
      if (c.locality) {
        localityCounts[c.locality] = (localityCounts[c.locality] || 0) + 1;
      }
    }
    const topLocalities = Object.entries(localityCounts)
      .map(([locality, count]) => ({ locality, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    // Repeat clusters
    const repeatClusters: { locality: string; issue: string; count: number }[] = [];
    for (const loc of topLocalities) {
      if (loc.count >= 2) {
        const topIssue = topCategories[0]?.category || 'Service disruption';
        repeatClusters.push({
          locality: loc.locality,
          issue: topIssue,
          count: loc.count,
        });
      }
    }

    reports.push({
      departmentCode: dept.code,
      departmentName: dept.name,
      nameHindi: dept.nameHindi,
      receivedCount,
      resolvedCount,
      pendingCount,
      medianResolutionDays,
      highPriorityCount,
      duplicateCount,
      topCategories,
      topLocalities,
      repeatClusters,
    });
  }

  // Detect Emerging Clusters (any locality + category with >= 3 complaints in past 72 hours)
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const clusterMap: Record<string, { count: number; department: string; category: string; tickets: string[] }> = {};

  for (const c of allComplaints) {
    if (c.locality && new Date(c.createdAt) >= threeDaysAgo) {
      const key = `${c.locality}::${c.confirmedCategory}`;
      if (!clusterMap[key]) {
        clusterMap[key] = {
          count: 0,
          department: c.confirmedDepartment,
          category: c.confirmedCategory,
          tickets: [],
        };
      }
      clusterMap[key].count++;
      clusterMap[key].tickets.push(c.ticketId);
    }
  }

  const emergingClusters: EmergingClusterAlert[] = [];
  for (const [key, val] of Object.entries(clusterMap)) {
    if (val.count >= 3) {
      const locality = key.split('::')[0];
      emergingClusters.push({
        locality,
        department: val.department,
        category: val.category,
        complaintCount: val.count,
        timeframe: 'Last 72 hours',
        severity: val.count >= 5 ? 'CRITICAL' : 'HIGH',
        sampleTicketIds: val.tickets.slice(0, 3),
      });
    }
  }

  return {
    reports,
    emergingClusters,
  };
}
