import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { findResponsibleOffice } from '@/services/location/resolver';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [{ id }, { ticketId: id }],
      },
      include: {
        responsibleOffice: true,
        auditLogs: { orderBy: { timestamp: 'desc' } },
        acknowledgement: true,
        linkedDuplicates: {
          include: { duplicateComplaint: true },
        },
        asDuplicateLink: {
          include: { primaryComplaint: true },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint ticket not found' }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch complaint', details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { action, operatorName = 'Operator (BMC Triage)', notes, ...fields } = body;

    const existing = await prisma.complaint.findFirst({
      where: {
        OR: [{ id }, { ticketId: id }],
      },
      include: { acknowledgement: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Complaint ticket not found' }, { status: 404 });
    }

    const updates: any = {};
    const auditLogsToCreate: any[] = [];

    switch (action) {
      case 'APPROVE_ROUTING': {
        updates.isOperatorConfirmed = true;
        updates.confirmedBy = operatorName;
        updates.confirmedAt = new Date();
        if (existing.status === 'NEW' || existing.status === 'UNDER_REVIEW') {
          updates.status = 'ASSIGNED';
        }

        auditLogsToCreate.push({
          complaintId: existing.id,
          operator: operatorName,
          action: 'ROUTING_APPROVED',
          oldValue: existing.status,
          newValue: updates.status || existing.status,
          notes: notes || 'Operator approved AI routing and dispatched to zonal office.',
        });

        // Also approve acknowledgement
        if (existing.acknowledgement) {
          await prisma.acknowledgement.update({
            where: { id: existing.acknowledgement.id },
            data: { isApproved: true, approvedBy: operatorName, approvedAt: new Date() },
          });
        }
        break;
      }

      case 'CHANGE_DEPARTMENT': {
        const oldDept = existing.confirmedDepartment;
        const newDept = fields.department;
        updates.confirmedDepartment = newDept;
        if (fields.category) {
          updates.confirmedCategory = fields.category;
        }

        // Check if office needs re-routing based on new department
        if (existing.latitude && existing.longitude) {
          const newOffice = findResponsibleOffice(existing.latitude, existing.longitude, undefined, newDept);
          const officeRecord = await prisma.municipalOffice.findFirst({ where: { officeId: newOffice.office_id } });
          if (officeRecord) {
            updates.responsibleOfficeId = officeRecord.id;
          }
        }

        auditLogsToCreate.push({
          complaintId: existing.id,
          operator: operatorName,
          action: 'DEPARTMENT_CHANGED',
          oldValue: oldDept,
          newValue: newDept,
          notes: notes || `Operator reassigned department to ${newDept}.`,
        });
        break;
      }

      case 'CHANGE_CATEGORY': {
        const oldCat = existing.confirmedCategory;
        const newCat = fields.category;
        updates.confirmedCategory = newCat;

        auditLogsToCreate.push({
          complaintId: existing.id,
          operator: operatorName,
          action: 'CATEGORY_CHANGED',
          oldValue: oldCat,
          newValue: newCat,
          notes: notes || `Operator adjusted category to ${newCat}.`,
        });
        break;
      }

      case 'CHANGE_URGENCY': {
        const oldUrg = existing.urgency;
        const newUrg = fields.urgency;
        updates.urgency = newUrg;
        if (fields.urgencyScore !== undefined) {
          updates.urgencyScore = fields.urgencyScore;
        }

        auditLogsToCreate.push({
          complaintId: existing.id,
          operator: operatorName,
          action: 'URGENCY_CHANGED',
          oldValue: `${oldUrg} (${existing.urgencyScore})`,
          newValue: `${newUrg} (${updates.urgencyScore ?? existing.urgencyScore})`,
          notes: notes || `Operator manually overridden urgency to ${newUrg}.`,
        });
        break;
      }

      case 'CHANGE_STATUS': {
        const oldStatus = existing.status;
        const newStatus = fields.status;
        updates.status = newStatus;

        auditLogsToCreate.push({
          complaintId: existing.id,
          operator: operatorName,
          action: 'STATUS_CHANGED',
          oldValue: oldStatus,
          newValue: newStatus,
          notes: notes || `Status transitioned to ${newStatus}.`,
        });
        break;
      }

      case 'EDIT_LOCATION': {
        const oldLoc = `${existing.locality || ''} (Ward ${existing.wardNumber || ''})`;
        const newLoc = `${fields.locality} (Ward ${fields.wardNumber})`;
        updates.locality = fields.locality;
        updates.wardNumber = fields.wardNumber;
        if (fields.address) updates.address = fields.address;

        if (fields.latitude && fields.longitude) {
          updates.latitude = fields.latitude;
          updates.longitude = fields.longitude;
          const newOffice = findResponsibleOffice(fields.latitude, fields.longitude, undefined, existing.confirmedDepartment);
          const officeRecord = await prisma.municipalOffice.findFirst({ where: { officeId: newOffice.office_id } });
          if (officeRecord) updates.responsibleOfficeId = officeRecord.id;
        }

        auditLogsToCreate.push({
          complaintId: existing.id,
          operator: operatorName,
          action: 'LOCATION_CORRECTED',
          oldValue: oldLoc,
          newValue: newLoc,
          notes: notes || 'Operator corrected locality and ward information.',
        });
        break;
      }

      case 'UPDATE_ACK': {
        if (existing.acknowledgement) {
          await prisma.acknowledgement.update({
            where: { id: existing.acknowledgement.id },
            data: {
              messageText: fields.messageText,
              isApproved: fields.isApproved ?? existing.acknowledgement.isApproved,
              approvedBy: fields.isApproved ? operatorName : existing.acknowledgement.approvedBy,
              approvedAt: fields.isApproved ? new Date() : existing.acknowledgement.approvedAt,
            },
          });
        }
        break;
      }

      default:
        return NextResponse.json({ error: 'Unknown operator action' }, { status: 400 });
    }

    const updated = await prisma.complaint.update({
      where: { id: existing.id },
      data: updates,
      include: {
        responsibleOffice: true,
        auditLogs: { orderBy: { timestamp: 'desc' } },
        acknowledgement: true,
      },
    });

    for (const log of auditLogsToCreate) {
      await prisma.auditLog.create({ data: log });
    }

    return NextResponse.json({ success: true, complaint: updated });
  } catch (error: any) {
    console.error('Error updating complaint:', error);
    return NextResponse.json({ error: 'Failed to update complaint', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const existing = await prisma.complaint.findFirst({
      where: {
        OR: [{ id }, { ticketId: id }],
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Complaint ticket not found' }, { status: 404 });
    }

    // Delete associated relations safely
    await prisma.duplicateLink.deleteMany({
      where: { OR: [{ primaryId: existing.id }, { duplicateId: existing.id }] },
    });
    await prisma.auditLog.deleteMany({ where: { complaintId: existing.id } });
    await prisma.statusHistory.deleteMany({ where: { complaintId: existing.id } });
    await prisma.acknowledgement.deleteMany({ where: { complaintId: existing.id } });
    await prisma.complaint.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true, message: `Ticket ${existing.ticketId} deleted successfully.` });
  } catch (error: any) {
    console.error('Error deleting complaint:', error);
    return NextResponse.json({ error: 'Failed to delete complaint', details: error.message }, { status: 500 });
  }
}
