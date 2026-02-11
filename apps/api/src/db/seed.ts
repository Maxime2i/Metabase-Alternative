import "dotenv/config";
import { db } from "./index";
import {
  organizations,
  facilities,
  doctors,
  patients,
  insurances,
  visits,
} from "./schema";

async function seed() {
  console.log("Seeding database...");

  const [org1, org2] = await db
    .insert(organizations)
    .values([
      {
        name: "Pacific Coast Health System",
        address: "1200 Ocean Ave, Suite 400, San Francisco, CA 94112",
        phone: "(415) 555-0100",
      },
      {
        name: "MetroCare Medical Group",
        address: "3500 Peachtree Rd NE, Atlanta, GA 30326",
        phone: "(404) 555-0200",
      },
    ])
    .returning({ id: organizations.id });

  const [fac1, fac2, fac3] = await db
    .insert(facilities)
    .values([
      {
        organizationId: org1.id,
        name: "SF Downtown Clinic",
        address: "450 Market St, San Francisco, CA 94111",
        phone: "(415) 555-0110",
      },
      {
        organizationId: org1.id,
        name: "Oakland Medical Center",
        address: "1800 Webster St, Oakland, CA 94612",
        phone: "(510) 555-0120",
      },
      {
        organizationId: org2.id,
        name: "Atlanta Midtown Practice",
        address: "999 Peachtree St, Atlanta, GA 30309",
        phone: "(404) 555-0210",
      },
    ])
    .returning({ id: facilities.id });

  const [doc1, doc2, doc3, doc4] = await db
    .insert(doctors)
    .values([
      {
        facilityId: fac1.id,
        firstName: "Sarah",
        lastName: "Mitchell",
        email: "sarah.mitchell@pacifichealth.org",
        phone: "(415) 555-1001",
        specialty: "Internal Medicine",
      },
      {
        facilityId: fac1.id,
        firstName: "James",
        lastName: "Chen",
        email: "james.chen@pacifichealth.org",
        phone: "(415) 555-1002",
        specialty: "Cardiology",
      },
      {
        facilityId: fac2.id,
        firstName: "Emily",
        lastName: "Rodriguez",
        email: "emily.rodriguez@pacifichealth.org",
        phone: "(510) 555-1003",
        specialty: "Pediatrics",
      },
      {
        facilityId: fac3.id,
        firstName: "Michael",
        lastName: "Thompson",
        email: "michael.thompson@metrocare.org",
        phone: "(404) 555-2001",
        specialty: "Dermatology",
      },
    ])
    .returning({ id: doctors.id });

  const [pat1, pat2, pat3, pat4, pat5] = await db
    .insert(patients)
    .values([
      {
        facilityId: fac1.id,
        firstName: "Jennifer",
        lastName: "Williams",
        email: "jennifer.williams@email.com",
        phone: "(415) 555-3001",
        dateOfBirth: "1985-03-15",
        address: "100 California St, San Francisco, CA 94111",
      },
      {
        facilityId: fac1.id,
        firstName: "Robert",
        lastName: "Davis",
        email: "robert.davis@email.com",
        phone: "(415) 555-3002",
        dateOfBirth: "1972-07-22",
        address: "2500 Van Ness Ave, San Francisco, CA 94109",
      },
      {
        facilityId: fac2.id,
        firstName: "Amanda",
        lastName: "Martinez",
        email: "amanda.martinez@email.com",
        phone: "(510) 555-3003",
        dateOfBirth: "1990-11-08",
        address: "3400 Broadway, Oakland, CA 94611",
      },
      {
        facilityId: fac2.id,
        firstName: "David",
        lastName: "Johnson",
        email: "david.johnson@email.com",
        dateOfBirth: "1965-01-30",
        address: "5555 Claremont Ave, Oakland, CA 94618",
      },
      {
        facilityId: fac3.id,
        firstName: "Jessica",
        lastName: "Brown",
        email: "jessica.brown@email.com",
        phone: "(404) 555-4001",
        dateOfBirth: "1998-09-12",
        address: "1234 Piedmont Ave NE, Atlanta, GA 30309",
      },
    ])
    .returning({ id: patients.id });

  await db.insert(insurances).values([
    {
      patientId: pat1.id,
      providerName: "Blue Cross Blue Shield of California",
      policyNumber: "BCBS-CA-789012",
      groupNumber: "GRP-1001",
      effectiveDate: "2020-01-01",
      expirationDate: "2025-12-31",
    },
    {
      patientId: pat1.id,
      providerName: "Aetna",
      policyNumber: "AET-SUP-456789",
      groupNumber: "GRP-2001",
      effectiveDate: "2022-06-01",
      expirationDate: "2026-05-31",
    },
    {
      patientId: pat2.id,
      providerName: "Medicare",
      policyNumber: "1EG4-TE5-MK72",
      effectiveDate: "2018-01-01",
    },
    {
      patientId: pat3.id,
      providerName: "UnitedHealthcare",
      policyNumber: "UHC-IND-334455",
      groupNumber: "GRP-3001",
      effectiveDate: "2023-01-01",
      expirationDate: "2025-12-31",
    },
    {
      patientId: pat4.id,
      providerName: "Medicaid",
      policyNumber: "CA-MCD-112233",
      effectiveDate: "2000-01-01",
    },
    {
      patientId: pat5.id,
      providerName: "Cigna",
      policyNumber: "CIG-EMP-778899",
      groupNumber: "GRP-4001",
      effectiveDate: "2024-01-01",
      expirationDate: "2025-12-31",
    },
  ]);

  const baseDate = new Date("2025-01-15T09:00:00-08:00");
  await db.insert(visits).values([
    {
      doctorId: doc1.id,
      patientId: pat1.id,
      visitDate: new Date(baseDate),
      reason: "Annual physical",
      diagnosis: "Routine checkup, within normal limits",
      notes: "BP 118/76, labs ordered",
    },
    {
      doctorId: doc1.id,
      patientId: pat2.id,
      visitDate: new Date(baseDate.getTime() + 86400000),
      reason: "Chest discomfort",
      diagnosis: "Anxiety, musculoskeletal",
      notes: "EKG normal, recommend stress management",
    },
    {
      doctorId: doc2.id,
      patientId: pat2.id,
      visitDate: new Date(baseDate.getTime() + 2 * 86400000),
      reason: "Cardiology follow-up",
      diagnosis: "Hypertension, controlled",
      notes: "Continue current regimen",
    },
    {
      doctorId: doc2.id,
      patientId: pat1.id,
      visitDate: new Date(baseDate.getTime() + 3 * 86400000),
      reason: "Palpitations",
      diagnosis: "Benign PVCs",
      notes: "Monitor, reduce caffeine",
    },
    {
      doctorId: doc3.id,
      patientId: pat3.id,
      visitDate: new Date(baseDate.getTime() + 4 * 86400000),
      reason: "Child fever",
      diagnosis: "Viral pharyngitis",
      notes: "Acetaminophen, fluids, rest",
    },
    {
      doctorId: doc3.id,
      patientId: pat4.id,
      visitDate: new Date(baseDate.getTime() + 5 * 86400000),
      reason: "Immunization",
      diagnosis: "Well child",
      notes: "Tdap booster administered",
    },
    {
      doctorId: doc4.id,
      patientId: pat5.id,
      visitDate: new Date(baseDate.getTime() + 6 * 86400000),
      reason: "Skin exam",
      diagnosis: "Mild contact dermatitis",
      notes: "Topical steroid prescribed",
    },
    {
      doctorId: doc1.id,
      patientId: pat3.id,
      visitDate: new Date(baseDate.getTime() + 7 * 86400000),
      reason: "Sports physical",
      diagnosis: "Cleared for athletics",
      notes: "Form completed",
    },
  ]);

  console.log("Seed completed successfully.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
