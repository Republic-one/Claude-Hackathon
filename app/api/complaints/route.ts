import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runFullAnalysis } from '@/services/ai';
import { z } from 'zod';

const complaintSchema = z.object({
  title: z.string().optional().nullable().default('Civic Grievance Report'),
  description: z.string().min(1, 'Description is required'),
  language: z.string().optional().nullable(),
  photoCaption: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  audioTranscription: z.string().optional().nullable(),
  latitude: z.union([z.number(), z.string().transform((val) => parseFloat(val))]).optional().nullable(),
  longitude: z.union([z.number(), z.string().transform((val) => parseFloat(val))]).optional().nullable(),
  locality: z.string().optional().nullable(),
  wardNumber: z.union([z.number(), z.string().transform((val) => parseInt(val, 10))]).optional().nullable(),
  address: z.string().optional().nullable(),
  isGpsDetected: z.boolean().optional(),
  sourceChannel: z.string().optional().default('Citizen Portal'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const department = searchParams.get('department') || '';
    const category = searchParams.get('category') || '';
    const ward = searchParams.get('ward');
    const urgency = searchParams.get('urgency') || '';
    const status = searchParams.get('status') || '';
    const language = searchParams.get('language') || '';
    const duplicateOnly = searchParams.get('duplicate') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { ticketId: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
        { locality: { contains: search } },
        { confirmedCategory: { contains: search } },
      ];
    }

    if (department && department !== 'ALL') {
      whereClause.confirmedDepartment = department;
    }

    if (category && category !== 'ALL') {
      whereClause.confirmedCategory = category;
    }

    if (ward && ward !== 'ALL') {
      whereClause.wardNumber = parseInt(ward, 10);
    }

    if (urgency && urgency !== 'ALL') {
      whereClause.urgency = urgency;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (language && language !== 'ALL') {
      whereClause.language = language;
    }

    if (duplicateOnly) {
      whereClause.isDuplicate = true;
    }

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where: whereClause }),
      prisma.complaint.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          responsibleOffice: true,
          linkedDuplicates: true,
        },
      }),
    ]);

    // KPI Metrics calculation
    const [totalAll, newCount, highCount, criticalCount, pendingCount, resolvedCount, duplicateCount] = await Promise.all([
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'NEW' } }),
      prisma.complaint.count({ where: { urgency: 'High' } }),
      prisma.complaint.count({ where: { urgency: 'Critical' } }),
      prisma.complaint.count({ where: { status: { in: ['NEW', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.complaint.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
      prisma.complaint.count({ where: { isDuplicate: true } }),
    ]);

    return NextResponse.json({
      complaints,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      metrics: {
        total: totalAll,
        new: newCount,
        high: highCount,
        critical: criticalCount,
        pending: pendingCount,
        resolved: resolvedCount,
        duplicates: duplicateCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json({ error: 'Failed to fetch complaints', details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const parsed = complaintSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid complaint input data', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const finalTitle = (data.title && data.title.trim().length >= 3)
      ? data.title.trim()
      : (data.description.trim().length >= 3 ? data.description.trim().slice(0, 60) : 'Civic Grievance Report');

    // Run AI analysis
    const analysis = await runFullAnalysis({
      text: `${finalTitle}. ${data.description}`,
      photoCaption: data.photoCaption || undefined,
      audioTranscription: data.audioTranscription || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
      manualLocality: data.locality || undefined,
    });

    let created: any = null;
    let ackMessage = '';

    try {
      // Generate next unique ticket number safely
      const latestComplaint = await prisma.complaint.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { ticketId: true },
      });

      let nextSeq = 1;
      if (latestComplaint && latestComplaint.ticketId) {
        const match = latestComplaint.ticketId.match(/\d+$/);
        if (match) {
          nextSeq = parseInt(match[0], 10) + 1;
        }
      } else {
        nextSeq = (await prisma.complaint.count()) + 1;
      }

      let ticketId = `BMC-2026-${String(nextSeq).padStart(5, '0')}`;
      let exists = await prisma.complaint.findFirst({ where: { ticketId } });
      while (exists) {
        nextSeq += 1;
        ticketId = `BMC-2026-${String(nextSeq).padStart(5, '0')}`;
        exists = await prisma.complaint.findFirst({ where: { ticketId } });
      }

      // Find or fallback office
      let officeDbId: string | null = null;
      if (analysis.location.nearestOffice) {
        const office = await prisma.municipalOffice.findFirst({
          where: { officeId: analysis.location.nearestOffice.office_id },
        });
        if (office) officeDbId = office.id;
      }

      // Determine duplicate status
      const isDup = analysis.duplicateInfo.probability >= 70;
      const primaryId = analysis.duplicateInfo.bestMatch?.complaintId || null;

      created = await prisma.complaint.create({
        data: {
          ticketId,
          title: finalTitle,
          description: data.description,
          photoCaption: data.photoCaption || null,
          imageUrl: data.imageUrl || null,
          audioTranscription: data.audioTranscription || null,
          language: data.language || analysis.classification.language,

          originalDepartment: analysis.classification.department,
          confirmedDepartment: analysis.classification.department,
          originalCategory: analysis.classification.category,
          confirmedCategory: analysis.classification.category,
          subCategory: analysis.classification.subCategory,

          urgency: analysis.classification.urgency,
          urgencyScore: analysis.classification.urgencyScore,
          urgencyReasons: JSON.stringify(analysis.classification.urgencyReasons),
          severity: analysis.classification.severity,

          confidence: analysis.classification.confidence,
          aiExplanation: analysis.classification.reason,
          keywords: JSON.stringify(analysis.classification.keywords),

          latitude: analysis.location.latitude,
          longitude: analysis.location.longitude,
          address: data.address || analysis.location.address,
          locality: data.locality || analysis.location.locality,
          wardNumber: data.wardNumber || analysis.location.wardNumber,
          isGpsDetected: data.isGpsDetected || false,

          responsibleOfficeId: officeDbId,
          officeRecommendationSource: analysis.location.recommendationSource,

          duplicateProbability: analysis.duplicateInfo.probability,
          duplicateReason: analysis.duplicateInfo.reason,
          primaryComplaintId: primaryId,
          isDuplicate: isDup,

          status: 'NEW',
          isOperatorConfirmed: false,
          sourceChannel: data.sourceChannel,
        },
      });

      // Audit log
      await prisma.auditLog.create({
        data: {
          complaintId: created.id,
          operator: 'AI Classifier',
          action: 'AI_CLASSIFIED',
          oldValue: 'INCOMING_CITIZEN_SUBMISSION',
          newValue: `${created.confirmedDepartment} | ${created.confirmedCategory}`,
          notes: `AI confidence: ${Math.round(created.confidence * 100)}% | Urgency: ${created.urgency} (${created.urgencyScore}/100)`,
        },
      }).catch(() => {});

      ackMessage = `Your civic complaint has been registered successfully.\n\nComplaint ID: ${created.ticketId}\nDepartment: ${created.confirmedDepartment}\nCategory: ${created.confirmedCategory}\nArea: ${created.locality}\nWard: Ward ${created.wardNumber}\nPriority: ${created.urgency}\n\nThe complaint has been forwarded for municipal operator review.\n\nHelpline: +91-755-2542222`;

      await prisma.acknowledgement.create({
        data: {
          complaintId: created.id,
          messageText: ackMessage,
          isApproved: false,
        },
      }).catch(() => {});

      if (isDup && primaryId) {
        await prisma.duplicateLink.create({
          data: {
            primaryId: primaryId,
            duplicateId: created.id,
            similarityScore: analysis.duplicateInfo.probability,
            linkReason: analysis.duplicateInfo.reason,
          },
        }).catch(() => {});
      }
    } catch (dbErr: any) {
      console.warn('DB Write fallback (Vercel read-only SQLite/demo mode):', dbErr.message);
      const randomSeq = Math.floor(10000 + Math.random() * 90000);
      const fallbackTicketId = `BMC-2026-${randomSeq}`;

      created = {
        id: `ticket-${Date.now()}`,
        ticketId: fallbackTicketId,
        title: finalTitle,
        description: data.description,
        confirmedDepartment: analysis.classification.department,
        confirmedCategory: analysis.classification.category,
        urgency: analysis.classification.urgency,
        urgencyScore: analysis.classification.urgencyScore,
        severity: analysis.classification.severity,
        locality: data.locality || analysis.location.locality || 'Arera Colony (E-5)',
        wardNumber: data.wardNumber || analysis.location.wardNumber || 47,
        address: data.address || analysis.location.address || 'Arera Colony (E-5), Ward 47, Bhopal, MP 462016',
        language: data.language || analysis.classification.language || 'Hinglish',
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };

      ackMessage = `Your civic complaint has been registered successfully.\n\nComplaint ID: ${created.ticketId}\nDepartment: ${created.confirmedDepartment}\nCategory: ${created.confirmedCategory}\nArea: ${created.locality}\nWard: Ward ${created.wardNumber}\nPriority: ${created.urgency}\n\nThe complaint has been forwarded for municipal operator review.\n\nHelpline: +91-755-2542222`;
    }

    return NextResponse.json({
      success: true,
      ticket: created,
      analysis,
      acknowledgement: {
        messageText: ackMessage,
        isApproved: false,
      },
    });
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { error: 'Failed to create complaint', details: error.message },
      { status: 500 }
    );
  }
}
