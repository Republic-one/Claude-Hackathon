import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findResponsibleOffice } from '@/services/location/resolver';

interface CsvRow {
  complaint_id?: string;
  description: string;
  language?: string;
  date?: string;
  latitude?: string | number;
  longitude?: string | number;
  locality?: string;
  ward?: string | number;
  department?: string;
  category?: string;
  urgency?: string;
  source?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: CsvRow[] = body.rows || [];

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No CSV rows provided' }, { status: 400 });
    }

    let rowsDetected = rows.length;
    let validRows = 0;
    let invalidRows = 0;
    let duplicateRows = 0;
    const errors: { row: number; reason: string }[] = [];
    const validDataToInsert: any[] = [];

    // Check existing ticket IDs to avoid conflicts
    const existingTickets = new Set(
      (await prisma.complaint.findMany({ select: { ticketId: true } })).map((c) => c.ticketId)
    );

    let currentIndex = (await prisma.complaint.count()) + 1;

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const rowNum = idx + 1;

      // Validate mandatory field
      if (!row.description || row.description.trim().length < 5) {
        invalidRows++;
        errors.push({ row: rowNum, reason: 'Missing or too short description' });
        continue;
      }

      // Check ticket ID
      let ticketId = row.complaint_id?.trim();
      if (ticketId && existingTickets.has(ticketId)) {
        duplicateRows++;
        errors.push({ row: rowNum, reason: `Ticket ID ${ticketId} already exists in database` });
        continue;
      }

      if (!ticketId) {
        ticketId = `BMC-2026-${String(currentIndex++).padStart(5, '0')}`;
      }

      const lat = row.latitude ? parseFloat(String(row.latitude)) : 23.2345;
      const lng = row.longitude ? parseFloat(String(row.longitude)) : 77.4048;
      const wardNumber = row.ward ? parseInt(String(row.ward), 10) : 45;
      const dept = row.department || 'Solid Waste Management';
      const cat = row.category || 'General Civic Complaint';
      const urg = row.urgency || 'Medium';
      const locality = row.locality || 'Arera Colony';
      const createdDate = row.date ? new Date(row.date) : new Date();

      // Find responsible office
      const officeInfo = findResponsibleOffice(lat, lng, undefined, dept);
      const officeRecord = await prisma.municipalOffice.findFirst({
        where: { officeId: officeInfo.office_id },
      });

      validDataToInsert.push({
        ticketId,
        title: row.description.slice(0, 60),
        description: row.description,
        language: row.language || 'English',
        originalDepartment: dept,
        confirmedDepartment: dept,
        originalCategory: cat,
        confirmedCategory: cat,
        subCategory: 'Imported Record',
        urgency: urg,
        urgencyScore: urg === 'Critical' ? 90 : urg === 'High' ? 75 : urg === 'Medium' ? 50 : 25,
        urgencyReasons: JSON.stringify(['Imported from verified municipal dataset']),
        severity: urg === 'Critical' ? 5 : urg === 'High' ? 4 : 3,
        confidence: 0.90,
        aiExplanation: 'Imported historical dataset ticket.',
        keywords: JSON.stringify([dept.toLowerCase(), cat.toLowerCase()]),
        latitude: lat,
        longitude: lng,
        address: `${locality}, Ward ${wardNumber}, Bhopal, MP`,
        locality,
        wardNumber,
        isGpsDetected: false,
        responsibleOfficeId: officeRecord?.id || null,
        officeRecommendationSource: 'Dataset Coordinates & Ward Mapping',
        status: 'UNDER_REVIEW',
        isOperatorConfirmed: false,
        sourceChannel: row.source || 'Imported Dataset (complaints.csv)',
        createdAt: isNaN(createdDate.getTime()) ? new Date() : createdDate,
      });

      existingTickets.add(ticketId);
      validRows++;
    }

    // Insert valid records in chunks
    for (const item of validDataToInsert) {
      const created = await prisma.complaint.create({ data: item });
      await prisma.auditLog.create({
        data: {
          complaintId: created.id,
          operator: 'CSV Batch Importer',
          action: 'BATCH_IMPORTED',
          oldValue: 'CSV_UPLOAD',
          newValue: 'UNDER_REVIEW',
          notes: `Imported with ID ${created.ticketId}`,
        },
      });
    }

    return NextResponse.json({
      summary: {
        rowsDetected,
        validRows,
        invalidRows,
        duplicateRows,
      },
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Error during CSV import:', error);
    return NextResponse.json({ error: 'Import failed', details: error.message }, { status: 500 });
  }
}
