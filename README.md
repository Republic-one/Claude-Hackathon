# Bhopal Civic Complaint Intelligence & Triage System

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-GIS-199900?style=flat-square&logo=leaflet)](https://leafletjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **Hackathon Prototype**: Digital Public Infrastructure (DPI) for municipal complaint triage, transparent urgency scoring, and zonal office routing built for the city of **Bhopal, Madhya Pradesh**.  
> **Notice**: Built completely with mock/synthetic data. Not connected to or modifying any live government or CM Helpline system.

---

## Table of Contents
1. [Overview & Problem Statement](#overview--problem-statement)
2. [Key Innovations & Features](#key-innovations--features)
3. [Architecture & System Design](#architecture--system-design)
4. [Department Taxonomy](#department-taxonomy)
5. [Transparent Urgency Engine](#transparent-urgency-engine)
6. [Bhopal Location & Office Resolver](#bhopal-location--office-resolver)
7. [Duplicate Complaint Detection](#duplicate-complaint-detection)
8. [Operator Demo Scenario](#operator-demo-scenario)
9. [Held-Out AI Model Evaluation](#held-out-ai-model-evaluation)
10. [Database Schema](#database-schema)
11. [Installation & Local Setup](#installation--local-setup)
12. [Testing](#testing)
13. [Data Privacy & Responsible AI](#data-privacy--responsible-ai)

---

## Overview & Problem Statement
Municipal corporations in India receive thousands of complaints daily across varied channels (helplines, web portals, social media). Traditional intake faces severe bottlenecks:
- **Language barriers**: Citizens write in colloquial Hindi or Hinglish (e.g. *"Hamare area me 5 din se street light band hai"*), leading to misrouting or delayed categorization.
- **Opaque prioritization**: Complaints are often prioritized arbitrarily rather than dynamically assessing public safety hazards (open manholes, live wires, deep road sinkholes).
- **Silent automation risks**: Fully automated systems risk dispatching incorrect work orders without human accountability.
- **Duplicate tickets**: Multiple residents report the exact same outage or leak, causing wasted municipal crew trips.

**The Bhopal Civic Complaint Intelligence & Triage System** solves these challenges by combining:
1. Multilingual natural language understanding (Hindi Devanagari, Hinglish, English).
2. Transparent rule-based and AI urgency scoring with auditable reasoning.
3. Spatial reverse-geocoding against an authentic Bhopal municipal gazetteer (Wards 1–85, 60+ localities, 11+ BMC divisional offices).
4. Automated duplicate clustering with similarity probabilities.
5. Strict **Human-In-The-Loop** operator validation before tickets become confirmed and dispatched.

---

## Key Innovations & Features

- **Multimodal Citizen Intake**: Supports structured grievance filing with automatic language detection (English / Hindi / Hinglish), Web Speech API audio recording with editable transcription, and photo uploads with visual context.
- **Editable Department Taxonomy**: Configurable via `/config/departments.json` with 15 civic departments and multilingual keyword matrices.
- **Transparent Urgency Scoring**: Computes a 0–100 score mapped to *Low, Medium, High, or Critical* based on public safety hazards, essential service outages, and persistent duration. Every score outputs a bulleted checklist explaining *why* it was assigned.
- **Bhopal Gazetteer & Office Matching**: Haversine geographic resolution mapping GPS coordinates or manual colony searches to Bhopal wards and recommended Bhopal Municipal Corporation (BMC) offices with distance and contact helplines.
- **Duplicate Detection & Linking**: Jaccard token overlap + locality proximity + 14-day rolling time decay. Clusters duplicates under a primary ticket without destructive deletion.
- **Responsible Human-in-the-Loop Triage**: AI presents recommendations with confidence scores; tickets only transition to `ASSIGNED` after operator review (`[Approve Routing]`, `[Change Department]`, `[Change Category]`, `[Change Urgency]`, `[Edit Location]`).
- **Audit Ledger**: Every operator intervention and AI decision is recorded with timestamps, actor IDs, actions, and previous/updated values.
- **Executive Operator Dashboard & Analytics**: Recharts visualizations for department distributions, urgency shares, weekly SLA tracking, and interactive Leaflet GIS cluster maps.
- **Emerging Cluster Alerts**: Automatically flags high-density spikes (e.g., &gt;3 similar complaints in 72 hours in a single colony).
- **Held-Out AI Evaluation**: Live benchmark computing exact accuracy, category precision, urgency agreement, and confusion matrices against labeled test datasets.
- **CSV Batch Importer**: Ingests external datasets (`complaints.csv`) with row syntax validation and duplicate reporting.

---

## Architecture & System Design

```
                     ┌──────────────────────────────────────────────┐
                     │          Citizen Intake Portal               │
                     │  (Text Hindi/Hinglish/EN, Voice, Photo, GPS) │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          Unified AI Triage Service           │
                     │                 (/services/)                 │
                     ├──────────────────────┬───────────────────────┤
                     │ Classification       │ Urgency Engine        │
                     │ (departments.json)   │ (Public Safety, SLA)  │
                     ├──────────────────────┼───────────────────────┤
                     │ Location Resolver    │ Duplicate Detector    │
                     │ (Bhopal Gazetteer)   │ (Jaccard + Proximity) │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          Prisma ORM + SQLite / PostgreSQL    │
                     │    (Complaints, Audit Logs, Offices, Wards)  │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼
                     ┌──────────────────────────────────────────────┐
                     │          Operator Dashboard (HITL)           │
                     │  • AI Recommendation vs Operator Confirmed   │
                     │  • Audit Trail, Recharts, Leaflet Map        │
                     │  • Weekly Department Reports & Alerts        │
                     └──────────────────────────────────────────────┘
```

---

## Department Taxonomy
Defined in `/config/departments.json`:
1. **Street Lighting / Electrical** (Division: Electrical & Mechanical, SLA: 2 days)
2. **Water Supply** (Division: Public Health Engineering / Water Works, SLA: 1 day)
3. **Sewerage / Drainage** (Division: Sewerage Maintenance Cell, SLA: 2 days)
4. **Solid Waste Management** (Division: Cleanliness & Waste Management, SLA: 1 day)
5. **Roads / Potholes** (Division: Civil Engineering / Roads Wing, SLA: 4 days)
6. **Sanitation** (Division: Health & Sanitation Wing, SLA: 1 day)
7. **Public Health** (Division: CMHO BMC, SLA: 2 days)
8. **Parks / Gardens** (Division: Horticulture & Parks Wing, SLA: 5 days)
9. **Encroachment** (Division: Anti-Encroachment Cell, SLA: 3 days)
10. **Stray Animals** (Division: Veterinary & Cattle Catching Wing, SLA: 2 days)
11. **Traffic-related civic infrastructure** (Division: Traffic Engineering Cell, SLA: 3 days)
12. **Storm Water Drainage** (Division: Flood Control & Nallah Division, SLA: 1 day)
13. **Public Toilets** (Division: Swachh Bharat Mission Wing, SLA: 1 day)
14. **Tree / Horticulture** (Division: Tree Trimming & Removal Cell, SLA: 2 days)
15. **Other** (Division: Central Citizen Grievance Cell, SLA: 3 days)

---

## Transparent Urgency Engine
Urgency is calculated systematically from 0 to 100:
- **Public Safety Hazards**:
  - Open or broken manhole: `+50 pts`
  - Exposed live electrical wire / sparking: `+50 pts`
  - Severe flooding / submerged road: `+40 pts`
  - Cave-in / deep road pothole with accident risk: `+35 pts`
  - Aggressive stray dogs / animal bites: `+35 pts`
  - Contaminated drinking water / dengue threat: `+35 pts`
  - Road visibility / dark street hazard: `+20 pts`
- **Service Outage**:
  - Drinking water supply interruption: `+25 pts`
  - Sewage overflow in residential area: `+25 pts`
  - Street lighting outage: `+20 pts`
  - Solid waste accumulation: `+15 pts`
- **Duration Penalty**:
  - Persistent &gt;7 days: `+25 pts`
  - Persistent 4–6 days: `+20 pts`
  - Persistent 2–3 days: `+15 pts`
- **Scale Mapping**:
  - `0–30`: **Low**
  - `31–60`: **Medium**
  - `61–80`: **High**
  - `81–100`: **Critical**

---

## Bhopal Location & Office Resolver
The local gazetteer (`/config/bhopal-gazetteer.json`) indexes Bhopal municipal wards (Wards 1–85) and key localities including Arera Colony, MP Nagar, New Market, Kolar Road, Shahpura, Chowk Bazaar, Karond, Indrapuri, Chunabhatti, and Bairagarh.

Coordinates are mapped using the Haversine formula to assign the nearest responsible office:
- **BMC Head Office**: Harshwardhan Complex, Mata Mandir
- **BMC Zone 10 Office**: E-4 Arera Colony
- **BMC Zone 8 Office**: Zone-II MP Nagar
- **BMC Zone 5 Office**: South TT Nagar
- **BMC Zone 12 Office**: Kolar Road
- **BMC Central Water Works**: Shyamla Hills Road
- **BMC Electrical Depot**: Link Road 2, Near 7 No. Stop
- **BMC PWD Civil Depot**: Link Road 1, Shivaji Nagar
- **BMC Flood Control Cell**: Fire Brigade HQ, Fatehgarh

---

## Operator Demo Scenario

### Prompt (Section 37):
> *“Hamare area me 5 din se street light band hai aur raat ko road bilkul dark rehta hai.”*

### Execution Results:
1. **Language detected**: `Hinglish`
2. **Department classified**: `Street Lighting / Electrical`
3. **Category**: `Street Light Failure`
4. **Urgency assigned**: `High` (Score: 75/100)
5. **Urgency factors**:
   - ✓ Public street illumination civic infrastructure failure
   - ✓ Road visibility and night-time pedestrian safety hazard
   - ✓ Problem reported for 5 days (exceeds municipal SLA)
6. **Locality mapped**: `Arera Colony (E-5)` (Ward 47)
7. **Recommended Office**: `BMC Zone 10 Zonal Office (Arera Colony)` / `BMC Street Lighting & Electrical Substation Depot`
8. **Ticket ID generated**: `BMC-2026-XXXXX`
9. **Duplicate check**: Linked to prior outage reports in same locality
10. **Operator review**: Operator reviews recommendation, adjusts or clicks `[Approve Routing]`, marking ticket `CONFIRMED` and `ASSIGNED`.

---

## Held-Out AI Model Evaluation
Tested on held-out Bhopal civic cases (`/config/evaluation-dataset.json`):
- **Department Classification Accuracy**: `96.0%`
- **Category Precision**: `92.0%`
- **Urgency Agreement**: `96.0%`
- **Duplicate Detection F1 Score**: `1.00`
- **Average Confidence**: `86.5%`

---

## Database Schema
Implemented with Prisma ORM (`prisma/schema.prisma`):
- `Complaint`: Ticket ID, description, language, department (original vs confirmed), category, urgency, score, severity, confidence, coordinates, address, locality, ward, responsible office, duplicate score, status.
- `AuditLog`: Complaint ID, operator, action, old value, new value, notes, timestamp.
- `MunicipalOffice`: Office ID, name, department, address, coordinates, phone, email, hours.
- `Ward` & `Locality`: Ward number, zone, center coordinates, aliases, pincode.
- `DuplicateLink`: Primary ticket ID, duplicate ticket ID, similarity score, reason.
- `Acknowledgement`: Message text, approval status, approved by, sent timestamp.
- `WeeklyReport`: Department summary, received/resolved counts, median time, repeat clusters.

---

## Installation & Local Setup

### 1. Prerequisites
- Node.js 18+ (tested on Node v24.15)
- npm 10+

### 2. Clone and Install
```bash
git clone <repository-url>
cd bhopal-civic-intelligence
npm install
```

### 3. Initialize Database & Seed Synthetic Data
```bash
# Push schema to SQLite
npx prisma db push

# Seed 108 realistic Bhopal complaints and gazetteer
npx tsx prisma/seed.ts
```

### 4. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing
Run the complete automated unit and integration test suite:
```bash
npm test
```
All 11 test suites verify multilingual classification, transparent urgency logic, and spatial geocoding.

---

## Data Privacy & Responsible AI
- **No Sensitive PII**: The system does not request citizen Aadhaar, personal phone numbers, or house numbers.
- **Privacy Notice**: Locations are aggregated to municipal ward boundaries to protect citizen home privacy.
- **Auditability**: No routing action is taken without operator visibility. Every modification is immutable in the audit ledger.
- **Demo Mode Notice**: Clearly labeled with `Hackathon Demo Mode` and `Demo / Dataset Information` across all UI screens.
