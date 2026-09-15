import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Bhopal Civic Complaint Intelligence & Triage System Seeding...');

  // 1. Clear existing records safely
  await prisma.duplicateLink.deleteMany();
  await prisma.acknowledgement.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.locality.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.municipalOffice.deleteMany();
  await prisma.department.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.weeklyReport.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  // 2. Load and insert Departments
  const deptJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config', 'departments.json'), 'utf-8'));
  for (const dept of deptJson.departments) {
    await prisma.department.create({
      data: {
        code: dept.code,
        name: dept.name,
        nameHindi: dept.nameHindi,
        bmcDivision: dept.bmcDivision,
        slaDays: dept.slaDays,
        contactEmail: dept.contactEmail,
      },
    });
  }
  console.log(`✅ Seeded ${deptJson.departments.length} civic departments.`);

  // 3. Load and insert Gazetteer (Wards, Localities, Municipal Offices)
  const gazetteerJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'config', 'bhopal-gazetteer.json'), 'utf-8'));

  const wardMap: Record<string, string> = {};
  for (const w of gazetteerJson.wards) {
    const created = await prisma.ward.create({
      data: {
        wardNumber: w.ward_number,
        wardName: w.ward_name,
        zoneId: w.zone_id,
        zoneName: w.zone_name,
        centerLat: w.center_lat,
        centerLng: w.center_lng,
        aliases: w.aliases.join(', '),
      },
    });
    wardMap[w.ward_id] = created.id;
  }
  console.log(`✅ Seeded ${gazetteerJson.wards.length} municipal wards.`);

  for (const loc of gazetteerJson.localities) {
    const wardDbId = wardMap[loc.ward_id] || Object.values(wardMap)[0];
    await prisma.locality.create({
      data: {
        name: loc.locality_name,
        wardId: wardDbId,
        pincode: loc.pincode,
        centerLat: loc.center_lat,
        centerLng: loc.center_lng,
        aliases: loc.aliases.join(', '),
      },
    });
  }
  console.log(`✅ Seeded ${gazetteerJson.localities.length} localities.`);

  const officeDbMap: Record<string, string> = {};
  for (const off of gazetteerJson.municipal_offices) {
    const created = await prisma.municipalOffice.create({
      data: {
        officeId: off.office_id,
        officeName: off.office_name,
        department: off.department,
        zoneId: off.zone_id,
        address: off.address,
        latitude: off.latitude,
        longitude: off.longitude,
        phone: off.phone,
        email: off.email,
        workingHours: off.working_hours,
        isHeadOffice: off.is_head_office || false,
      },
    });
    officeDbMap[off.office_id] = created.id;
  }
  console.log(`✅ Seeded ${gazetteerJson.municipal_offices.length} municipal offices.`);

  // 4. Seed Operators
  const defaultOperators = [
    { name: 'Rajesh Sharma', role: 'Chief Triage Operator', email: 'rajesh.sharma@bmc.mp.gov.in', department: 'General Triage' },
    { name: 'Priya Verma', role: 'Senior Electrical Supervisor', email: 'priya.verma@bmc.mp.gov.in', department: 'Street Lighting / Electrical' },
    { name: 'Anil Saxena', role: 'Assistant Engineer Water Works', email: 'anil.saxena@bmc.mp.gov.in', department: 'Water Supply' },
  ];
  for (const op of defaultOperators) {
    await prisma.operator.create({ data: op });
  }

  // 5. Generate 105+ Realistic Synthetic Bhopal Complaints
  const channels = ['Citizen Portal', 'CM Helpline Export', 'Municipal App Export', 'Social Media Export', 'Representative Office Export'];
  const statuses = ['NEW', 'UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

  const syntheticRaw = [
    {
      title: 'Street light not working for 5 days in Arera E-5',
      desc: 'Hamare area me 5 din se street light band hai aur raat ko road bilkul dark rehta hai.',
      lang: 'Hinglish',
      dept: 'Street Lighting / Electrical',
      cat: 'Street Light Failure',
      urgency: 'High',
      score: 75,
      loc: 'Arera Colony (E-5)',
      ward: 47,
      lat: 23.2105,
      lng: 77.4312,
      officeId: 'bmc-zone-10',
    },
    {
      title: 'Dangling live electric wire near children park',
      desc: 'Open electric wire hanging near children park, huge sparking seen yesterday. Immediate action needed.',
      lang: 'English',
      dept: 'Street Lighting / Electrical',
      cat: 'Exposed / Dangling Electric Wire',
      urgency: 'Critical',
      score: 95,
      loc: 'Shivaji Nagar (6 No Stop)',
      ward: 50,
      lat: 23.2301,
      lng: 77.4178,
      officeId: 'bmc-electrical-depot',
    },
    {
      title: 'पेयजल प्रदाय पिछले 3 दिनों से पूरी तरह ठप',
      desc: 'पिछले तीन दिनों से हमारे नल में पीने का पानी बिल्कुल नहीं आ रहा है, टैंकर भिजवाएं। पूरा मोहल्ला परेशान है।',
      lang: 'Hindi',
      dept: 'Water Supply',
      cat: 'No Water Supply / Interruption',
      urgency: 'High',
      score: 78,
      loc: 'Kotra Sultanabad',
      ward: 35,
      lat: 23.2289,
      lng: 77.3984,
      officeId: 'bmc-water-works',
    },
    {
      title: 'Drinking water pipeline burst near Parihar chouraha',
      desc: 'Main water pipeline burst near Parihar chouraha, thousands of liters clean water wasting on road.',
      lang: 'English',
      dept: 'Water Supply',
      cat: 'Pipe Burst / Water Leakage',
      urgency: 'Medium',
      score: 55,
      loc: 'Arera Colony (E-5)',
      ward: 47,
      lat: 23.2112,
      lng: 77.4325,
      officeId: 'bmc-water-works',
    },
    {
      title: 'Ganda peela pani tap me aa raha hai',
      desc: 'Ganda aur badboodar peele rang ka pani tap me aa raha hai, peene layak nahi hai. Bachhe bimar ho rahe hain.',
      lang: 'Hinglish',
      dept: 'Water Supply',
      cat: 'Contaminated / Dirty Water',
      urgency: 'Critical',
      score: 88,
      loc: 'Chowk Bazaar (Old City)',
      ward: 20,
      lat: 23.2625,
      lng: 77.4011,
      officeId: 'bmc-zone-3',
    },
    {
      title: 'Sewer chamber overflowing in New Market',
      desc: 'Sewer chamber is overflowing on the main street with terrible foul smell, shopkeepers and customers facing severe problem.',
      lang: 'English',
      dept: 'Sewerage / Drainage',
      cat: 'Sewer Overflow / Choked Line',
      urgency: 'High',
      score: 72,
      loc: 'New Market (TT Nagar)',
      ward: 32,
      lat: 23.2384,
      lng: 77.4022,
      officeId: 'bmc-zone-5',
    },
    {
      title: 'सड़क पर खुला मैनहोल भारी दुर्घटना का खतरा',
      desc: 'गटर का ढक्कन खुला पड़ा है, रात में अंधेरे में किसी का भी पैर या गाड़ी गिर सकती है। तुरंत ढक्कन लगवाएं।',
      lang: 'Hindi',
      dept: 'Sewerage / Drainage',
      cat: 'Open / Broken Manhole',
      urgency: 'Critical',
      score: 92,
      loc: 'MP Nagar Zone 1',
      ward: 58,
      lat: 23.2341,
      lng: 77.4321,
      officeId: 'bmc-zone-8',
    },
    {
      title: 'Huge garbage heap lying for one week in Indrapuri',
      desc: 'Huge garbage heap lying for one week at street corner, stray animals scattering it and foul smell spread everywhere.',
      lang: 'English',
      dept: 'Solid Waste Management',
      cat: 'Garbage Heap / Unattended Dump',
      urgency: 'Medium',
      score: 50,
      loc: 'Indrapuri Sector A/B',
      ward: 60,
      lat: 23.2541,
      lng: 77.4612,
      officeId: 'bmc-zone-14',
    },
    {
      title: 'Kachra gaadi 4 din se nahi aayi Kolar me',
      desc: 'Kachra gaadi hamare mohalle me 4 din se nahi aayi hai, ghar me kachra ikattha ho gaya. Door to door service failed.',
      lang: 'Hinglish',
      dept: 'Solid Waste Management',
      cat: 'Door-to-Door Vehicle Not Arriving',
      urgency: 'Medium',
      score: 48,
      loc: 'Kolar Road (Sarvdharm)',
      ward: 80,
      lat: 23.1684,
      lng: 77.4198,
      officeId: 'bmc-zone-12',
    },
    {
      title: 'Gehra gaddha sadak par bike accident ka karan bana',
      desc: 'Bada aur gehra gaddha hai sadak par, kal raat ek bike rider gir gaya tha. Barish me dikhai nahi deta.',
      lang: 'Hinglish',
      dept: 'Roads / Potholes',
      cat: 'Potholes / Damaged Road Surface',
      urgency: 'High',
      score: 76,
      loc: 'Shahpura Sector A/B',
      ward: 52,
      lat: 23.1952,
      lng: 77.4289,
      officeId: 'bmc-pwd-roads',
    },
    {
      title: 'Deep pipeline trench left open without barricade',
      desc: 'Deep pipeline excavation left open without any barricade or red warning ribbon on main road near MP Nagar.',
      lang: 'English',
      dept: 'Roads / Potholes',
      cat: 'Road Cave-in / Trench Left Open',
      urgency: 'Critical',
      score: 90,
      loc: 'MP Nagar Zone 2',
      ward: 58,
      lat: 23.2312,
      lng: 77.4356,
      officeId: 'bmc-pwd-roads',
    },
    {
      title: 'मोहल्ले में झाड़ू नहीं लगी, सड़क पर गंदगी',
      desc: 'हमारे वार्ड में पिछले एक हफ्ते से झाड़ू नहीं लगी है, सड़क पर धूल और सूखे पत्ते पड़े हैं। सफाईकर्मी नदारद हैं।',
      lang: 'Hindi',
      dept: 'Sanitation',
      cat: 'Street Sweeping / Cleaning Not Done',
      urgency: 'Low',
      score: 28,
      loc: 'Shivaji Nagar (6 No Stop)',
      ward: 50,
      lat: 23.2301,
      lng: 77.4178,
      officeId: 'bmc-zone-5',
    },
    {
      title: 'Mosquito menace and dengue threat in Chunabhatti',
      desc: 'Dengue cases reported in colony, lots of mosquitoes due to stagnant water, need fogging machine immediately.',
      lang: 'English',
      dept: 'Public Health',
      cat: 'Mosquito Breeding / Fogging Required',
      urgency: 'High',
      score: 74,
      loc: 'Chunabhatti Square',
      ward: 52,
      lat: 23.1895,
      lng: 77.4215,
      officeId: 'bmc-zone-12',
    },
    {
      title: 'Park maintenance required in Arera E-3',
      desc: 'Colony park me jhadia bahut badi ho gayi hain aur bachho ke jhoole toote huye hain. Grass cutting needed.',
      lang: 'Hinglish',
      dept: 'Parks / Gardens',
      cat: 'Park Maintenance & Grass Cutting',
      urgency: 'Low',
      score: 25,
      loc: 'Arera Colony (E-3)',
      ward: 45,
      lat: 23.2201,
      lng: 77.4225,
      officeId: 'bmc-zone-10',
    },
    {
      title: 'Illegal stalls encroaching pedestrian walkway',
      desc: 'Illegal stalls and thela vendors have encroached the entire pedestrian footpath, pedestrians forced to walk on heavy traffic road.',
      lang: 'English',
      dept: 'Encroachment',
      cat: 'Illegal Shop / Footpath Encroachment',
      urgency: 'Medium',
      score: 52,
      loc: 'New Market (TT Nagar)',
      ward: 32,
      lat: 23.2384,
      lng: 77.4022,
      officeId: 'bmc-zone-5',
    },
    {
      title: 'Aggressive stray dogs chasing vehicles at night',
      desc: 'Pack of aggressive stray dogs chasing two-wheelers and children in evening near Minal Residency gate.',
      lang: 'English',
      dept: 'Stray Animals',
      cat: 'Stray Dogs Aggression / Cattle on Road',
      urgency: 'High',
      score: 72,
      loc: 'Minal Residency (Ayodhya Bypass)',
      ward: 65,
      lat: 23.2712,
      lng: 77.4812,
      officeId: 'bmc-zone-14',
    },
    {
      title: 'Traffic signal red light stuck at Jyoti Talkies',
      desc: 'Traffic light at Jyoti Talkies chouraha is completely broken, causing massive chaos and near-miss collisions.',
      lang: 'English',
      dept: 'Traffic-related civic infrastructure',
      cat: 'Traffic Signal Malfunction / Missing Signage',
      urgency: 'High',
      score: 75,
      loc: 'MP Nagar Zone 1',
      ward: 58,
      lat: 23.2329,
      lng: 77.4334,
      officeId: 'bmc-zone-8',
    },
    {
      title: 'Severe waterlogging during rain in Karond',
      desc: 'Heavy rain water logging, nallah overflowing and entering inside ground floor houses. Water level reaching knees.',
      lang: 'English',
      dept: 'Storm Water Drainage',
      cat: 'Severe Water Logging / Nallah Overflow',
      urgency: 'Critical',
      score: 92,
      loc: 'Karond Square',
      ward: 15,
      lat: 23.3051,
      lng: 77.4082,
      officeId: 'bmc-flood-control',
    },
    {
      title: 'Public toilet near bus stand is choked and unusable',
      desc: 'Public toilet near bus stand is totally filthy, choked flush and no running water. Severe odor in public area.',
      lang: 'English',
      dept: 'Public Toilets',
      cat: 'Public Toilet Filthy / No Water Supply',
      urgency: 'Medium',
      score: 55,
      loc: 'Sant Hirdaram Nagar (Bairagarh)',
      ward: 1,
      lat: 23.2754,
      lng: 77.3512,
      officeId: 'bmc-zone-3',
    },
    {
      title: 'Heavy tree branch fallen on Shyamla Hills road',
      desc: 'A large Gulmohar tree branch broke down and is blocking the residential lane, vehicles cannot pass.',
      lang: 'English',
      dept: 'Tree / Horticulture',
      cat: 'Fallen Tree / Dangerous Overhanging Branch',
      urgency: 'High',
      score: 70,
      loc: 'Shyamla Hills & VIP Road',
      ward: 28,
      lat: 23.2421,
      lng: 77.3912,
      officeId: 'bmc-zone-5',
    },
  ];

  // Variations to scale realistically to 108 complaints
  const localities = gazetteerJson.localities;
  const departments = deptJson.departments;

  const complaintsToCreate = [];

  for (let i = 1; i <= 108; i++) {
    const padded = String(i).padStart(5, '0');
    const ticketId = `BMC-2026-${padded}`;

    let base: any;
    if (i <= syntheticRaw.length) {
      base = syntheticRaw[i - 1];
    } else {
      // Procedurally generate realistic variants
      const template = syntheticRaw[(i - 1) % syntheticRaw.length];
      const locObj = localities[i % localities.length];
      const deptObj = departments.find((d: any) => d.name === template.dept) || departments[0];

      base = {
        title: `${template.cat} reported in ${locObj.locality_name}`,
        desc: `${template.desc.replace(/Arera|Shivaji|Kotra|New Market|MP Nagar|Indrapuri|Kolar/g, locObj.locality_name.split(' ')[0])}`,
        lang: template.lang,
        dept: deptObj.name,
        cat: template.cat,
        urgency: template.urgency,
        score: template.score,
        loc: locObj.locality_name,
        ward: parseInt(locObj.ward_id.replace('ward-', ''), 10) || 45,
        lat: locObj.center_lat + (Math.random() - 0.5) * 0.005,
        lng: locObj.center_lng + (Math.random() - 0.5) * 0.005,
        officeId: template.officeId,
      };
    }

    const createdDaysAgo = Math.floor(Math.random() * 12);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - createdDaysAgo);
    createdAt.setHours(8 + (i % 12), (i * 7) % 60, 0);

    const statusIndex = i % statuses.length;
    const status = i <= 5 ? (i === 1 ? 'ASSIGNED' : 'UNDER_REVIEW') : statuses[statusIndex];
    const isOperatorConfirmed = status !== 'NEW' && status !== 'UNDER_REVIEW';

    const officeDbId = officeDbMap[base.officeId] || Object.values(officeDbMap)[0];
    const channel = channels[i % channels.length];

    complaintsToCreate.push({
      ticketId,
      title: base.title,
      description: base.desc,
      photoCaption: i % 3 === 0 ? `Captured street issue photograph: ${base.cat} on public road.` : null,
      imageUrl: i % 3 === 0 ? '/demo/pothole-sample.webp' : null,
      audioTranscription: base.lang === 'Hinglish' && i % 4 === 0 ? base.desc : null,
      language: base.lang,
      originalDepartment: base.dept,
      confirmedDepartment: base.dept,
      originalCategory: base.cat,
      confirmedCategory: base.cat,
      subCategory: 'General Issue',
      urgency: base.urgency,
      urgencyScore: base.score,
      urgencyReasons: JSON.stringify([
        `Civic SLA criteria matched for ${base.cat}`,
        `Reported location: ${base.loc}`,
        `Severity index computed based on citizen grievance impact`,
      ]),
      severity: base.score >= 80 ? 5 : base.score >= 60 ? 4 : base.score >= 30 ? 3 : 2,
      confidence: Number((0.82 + (i % 16) * 0.01).toFixed(2)),
      aiExplanation: `Text mentions key civic terms. Rule-based classifier mapped complaint to ${base.dept} (${base.cat}).`,
      keywords: JSON.stringify([base.dept.toLowerCase(), base.cat.toLowerCase(), base.loc.toLowerCase()]),
      latitude: base.lat,
      longitude: base.lng,
      address: `${base.loc}, Ward ${base.ward}, Bhopal, MP`,
      locality: base.loc,
      wardNumber: base.ward,
      isGpsDetected: i % 2 === 0,
      responsibleOfficeId: officeDbId,
      officeRecommendationSource: 'Spatial Proximity & Ward Mapping',
      duplicateProbability: i === 22 ? 88.0 : 0.0,
      duplicateReason: i === 22 ? '88% match with BMC-2026-00001 (Same street light issue in Arera Colony)' : null,
      isDuplicate: i === 22,
      status,
      isOperatorConfirmed,
      confirmedBy: isOperatorConfirmed ? 'Rajesh Sharma (Operator #41)' : null,
      confirmedAt: isOperatorConfirmed ? new Date(createdAt.getTime() + 1000 * 60 * 25) : null,
      sourceChannel: channel,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + 1000 * 60 * 45),
    });
  }

  let createdCount = 0;
  const createdComplaintsMap: Record<string, string> = {};

  for (const c of complaintsToCreate) {
    const created = await prisma.complaint.create({ data: c });
    createdComplaintsMap[c.ticketId] = created.id;
    createdCount++;

    // Add Audit Log
    await prisma.auditLog.create({
      data: {
        complaintId: created.id,
        operator: 'AI Classifier',
        action: 'AI_CLASSIFIED',
        oldValue: 'INCOMING_RAW_TEXT',
        newValue: `${created.confirmedDepartment} | ${created.confirmedCategory}`,
        notes: `Initial triage confidence: ${Math.round(created.confidence * 100)}%`,
        timestamp: created.createdAt,
      },
    });

    if (created.isOperatorConfirmed) {
      await prisma.auditLog.create({
        data: {
          complaintId: created.id,
          operator: created.confirmedBy || 'Operator',
          action: 'ROUTING_APPROVED',
          oldValue: 'UNDER_REVIEW',
          newValue: 'CONFIRMED',
          notes: 'Operator verified AI classification and dispatched ticket to zonal office.',
          timestamp: created.confirmedAt || created.updatedAt,
        },
      });
    }

    // Add Acknowledgement
    await prisma.acknowledgement.create({
      data: {
        complaintId: created.id,
        messageText: `Your civic complaint has been registered successfully.\n\nComplaint ID: ${created.ticketId}\nDepartment: ${created.confirmedDepartment}\nArea: ${created.locality}\nWard: Ward ${created.wardNumber}\nPriority: ${created.urgency}\n\nThe complaint has been forwarded for municipal review.`,
        isApproved: created.isOperatorConfirmed,
        approvedBy: created.confirmedBy,
        approvedAt: created.confirmedAt,
      },
    });
  }

  // Link Ticket 22 as duplicate of Ticket 1
  if (createdComplaintsMap['BMC-2026-00001'] && createdComplaintsMap['BMC-2026-00022']) {
    await prisma.duplicateLink.create({
      data: {
        primaryId: createdComplaintsMap['BMC-2026-00001'],
        duplicateId: createdComplaintsMap['BMC-2026-00022'],
        similarityScore: 88.0,
        linkReason: 'Identical street light outage reported in same locality (Arera Colony E-5) within 48h.',
      },
    });
  }

  console.log(`✅ Seeded ${createdCount} realistic Bhopal civic complaints with audit logs and acknowledgements!`);
  console.log('🎉 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
