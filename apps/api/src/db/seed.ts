import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  organizations,
  facilities,
  doctors,
  patients,
  insurances,
  visits,
} from "./schema";

const FIRST_NAMES = [
  "James",
  "Mary",
  "John",
  "Patricia",
  "Robert",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Barbara",
  "Richard",
  "Susan",
  "Joseph",
  "Jessica",
  "Thomas",
  "Sarah",
  "Charles",
  "Karen",
  "Christopher",
  "Lisa",
  "Daniel",
  "Nancy",
  "Matthew",
  "Betty",
  "Anthony",
  "Margaret",
  "Mark",
  "Sandra",
  "Donald",
  "Ashley",
  "Steven",
  "Kimberly",
  "Paul",
  "Emily",
  "Andrew",
  "Donna",
  "Joshua",
  "Michelle",
  "Kenneth",
  "Dorothy",
  "Kevin",
  "Carol",
  "Brian",
  "Amanda",
  "George",
  "Melissa",
  "Timothy",
  "Deborah",
  "Ronald",
  "Stephanie",
  "Edward",
  "Rebecca",
  "Jason",
  "Sharon",
  "Ryan",
  "Laura",
  "Jacob",
  "Cynthia",
  "Gary",
  "Kathleen",
  "Nicholas",
  "Amy",
  "Eric",
  "Angela",
  "Jonathan",
  "Shirley",
  "Stephen",
  "Anna",
  "Larry",
  "Brenda",
];

const LAST_NAMES = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Ramirez",
  "Lewis",
  "Robinson",
  "Walker",
  "Young",
  "Allen",
  "King",
  "Wright",
  "Scott",
  "Torres",
  "Nguyen",
  "Hill",
  "Flores",
  "Green",
  "Adams",
  "Nelson",
  "Baker",
  "Hall",
  "Rivera",
  "Campbell",
  "Mitchell",
  "Carter",
  "Roberts",
  "Chen",
  "Phillips",
  "Evans",
  "Turner",
  "Parker",
];

const SPECIALTIES = [
  "Internal Medicine",
  "Cardiology",
  "Pediatrics",
  "Dermatology",
  "Orthopedics",
  "Neurology",
  "Psychiatry",
  "Radiology",
  "Emergency Medicine",
  "Family Medicine",
  "Obstetrics and Gynecology",
  "Ophthalmology",
  "Pulmonology",
  "Gastroenterology",
];

const REASONS = [
  "Annual physical",
  "Chest discomfort",
  "Follow-up",
  "Fever",
  "Immunization",
  "Skin exam",
  "Sports physical",
  "Headache",
  "Back pain",
  "Routine checkup",
  "Blood pressure check",
  "Diabetes management",
  "Allergy symptoms",
  "Cold symptoms",
  "Vaccination",
  "Lab results review",
  "Medication refill",
  "Pre-op clearance",
  "Joint pain",
  "Rash",
  "Anxiety",
  "Sleep issues",
  "Digestive issues",
  "Eye exam",
  "Well child visit",
  "Chronic condition follow-up",
  "Injury",
  "Infection",
];

const DIAGNOSES = [
  "Routine checkup, within normal limits",
  "Anxiety, musculoskeletal",
  "Hypertension, controlled",
  "Benign PVCs",
  "Viral pharyngitis",
  "Well child",
  "Mild contact dermatitis",
  "Cleared for athletics",
  "Upper respiratory infection",
  "Type 2 diabetes, stable",
  "GERD",
  "Seasonal allergies",
  "Migraine",
  "Low back strain",
  "Anemia, mild",
  "Hypothyroidism, on levothyroxine",
  "No acute findings",
  "Otitis media",
  "Strain, rest and NSAIDs",
  "Acne vulgaris",
  "Insomnia, behavioral measures",
];

const INSURANCE_PROVIDERS = [
  "Blue Cross Blue Shield",
  "Aetna",
  "UnitedHealthcare",
  "Cigna",
  "Medicare",
  "Medicaid",
  "Kaiser Permanente",
  "Humana",
  "Anthem",
  "Molina Healthcare",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

async function seed() {
  console.log("Seeding database...");

  await db.execute(
    sql`TRUNCATE visits, insurances, patients, doctors, facilities, organizations RESTART IDENTITY CASCADE`
  );

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

  const facilityIds = [fac1.id, fac2.id, fac3.id];
  const doctorValues = [
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
      facilityId: fac1.id,
      firstName: "Emily",
      lastName: "Rodriguez",
      email: "emily.rodriguez@pacifichealth.org",
      phone: "(415) 555-1003",
      specialty: "Pediatrics",
    },
    {
      facilityId: fac1.id,
      firstName: "Michael",
      lastName: "Thompson",
      email: "michael.thompson@pacifichealth.org",
      phone: "(415) 555-1004",
      specialty: "Dermatology",
    },
    {
      facilityId: fac2.id,
      firstName: "David",
      lastName: "Kim",
      email: "david.kim@pacifichealth.org",
      phone: "(510) 555-2001",
      specialty: "Family Medicine",
    },
    {
      facilityId: fac2.id,
      firstName: "Lisa",
      lastName: "Anderson",
      email: "lisa.anderson@pacifichealth.org",
      phone: "(510) 555-2002",
      specialty: "Internal Medicine",
    },
    {
      facilityId: fac2.id,
      firstName: "Robert",
      lastName: "Wilson",
      email: "robert.wilson@pacifichealth.org",
      phone: "(510) 555-2003",
      specialty: "Orthopedics",
    },
    {
      facilityId: fac2.id,
      firstName: "Jennifer",
      lastName: "Brown",
      email: "jennifer.brown@pacifichealth.org",
      phone: "(510) 555-2004",
      specialty: "Pediatrics",
    },
    {
      facilityId: fac3.id,
      firstName: "Christopher",
      lastName: "Davis",
      email: "christopher.davis@metrocare.org",
      phone: "(404) 555-3001",
      specialty: "Dermatology",
    },
    {
      facilityId: fac3.id,
      firstName: "Amanda",
      lastName: "Garcia",
      email: "amanda.garcia@metrocare.org",
      phone: "(404) 555-3002",
      specialty: "Cardiology",
    },
    {
      facilityId: fac3.id,
      firstName: "Kevin",
      lastName: "Martinez",
      email: "kevin.martinez@metrocare.org",
      phone: "(404) 555-3003",
      specialty: "Emergency Medicine",
    },
    {
      facilityId: fac3.id,
      firstName: "Rachel",
      lastName: "Taylor",
      email: "rachel.taylor@metrocare.org",
      phone: "(404) 555-3004",
      specialty: "Family Medicine",
    },
  ];
  const insertedDoctors = await db
    .insert(doctors)
    .values(doctorValues)
    .returning({ id: doctors.id });

  const patientCount = 180;
  const patientValues: Array<{
    facilityId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    dateOfBirth: string;
    address?: string;
  }> = [];
  const usedEmails = new Set<string>();
  for (let i = 0; i < patientCount; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    let email = `${first.toLowerCase()}.${last.toLowerCase()}.${i}@example.com`;
    while (usedEmails.has(email)) {
      email = `${first.toLowerCase()}.${last.toLowerCase()}.${i}.${Math.random()
        .toString(36)
        .slice(2, 6)}@example.com`;
    }
    usedEmails.add(email);
    const year = 1940 + Math.floor(Math.random() * 75);
    const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
    const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
    patientValues.push({
      facilityId: pick(facilityIds),
      firstName: first,
      lastName: last,
      email,
      phone:
        Math.random() > 0.2
          ? `(555) 555-${String(1000 + i).slice(-4)}`
          : undefined,
      dateOfBirth: `${year}-${month}-${day}`,
      address:
        Math.random() > 0.15
          ? `${100 + i * 10} Main St, City, ST 00000`
          : undefined,
    });
  }
  const insertedPatients = await db
    .insert(patients)
    .values(patientValues)
    .returning({ id: patients.id });

  const insuranceValues: Array<{
    patientId: number;
    providerName: string;
    policyNumber: string;
    groupNumber?: string;
    effectiveDate: string;
    expirationDate?: string;
  }> = [];
  for (let i = 0; i < insertedPatients.length; i++) {
    if (Math.random() > 0.35) {
      const provider = pick(INSURANCE_PROVIDERS);
      const suffix = String(100000 + i * 1111).slice(-6);
      insuranceValues.push({
        patientId: insertedPatients[i].id,
        providerName: provider,
        policyNumber: `${provider.slice(0, 3).toUpperCase()}-${suffix}`,
        groupNumber:
          Math.random() > 0.4 ? `GRP-${1000 + (i % 100)}` : undefined,
        effectiveDate: `${2020 + (i % 4)}-01-01`,
        expirationDate:
          Math.random() > 0.3 ? `${2025 + (i % 2)}-12-31` : undefined,
      });
    }
    if (Math.random() > 0.85) {
      const provider = pick(INSURANCE_PROVIDERS);
      const suffix = String(200000 + i * 777).slice(-6);
      insuranceValues.push({
        patientId: insertedPatients[i].id,
        providerName: provider,
        policyNumber: `SEC-${suffix}`,
        groupNumber: `GRP-${2000 + (i % 50)}`,
        effectiveDate: `${2022 + (i % 2)}-06-01`,
        expirationDate: `${2026}-05-31`,
      });
    }
  }
  await db.insert(insurances).values(insuranceValues);

  const visitCount = 1200;
  const visitStart = new Date("2024-01-01T08:00:00");
  const visitEnd = new Date("2025-02-01T18:00:00");
  const visitValues: Array<{
    doctorId: number;
    patientId: number;
    visitDate: Date;
    reason: string;
    diagnosis: string;
    notes: string;
  }> = [];
  for (let i = 0; i < visitCount; i++) {
    const doc =
      insertedDoctors[Math.floor(Math.random() * insertedDoctors.length)];
    const pat =
      insertedPatients[Math.floor(Math.random() * insertedPatients.length)];
    const d = randomDate(visitStart, visitEnd);
    d.setHours(
      8 + Math.floor(Math.random() * 9),
      Math.random() > 0.5 ? 0 : 30,
      0,
      0
    );
    visitValues.push({
      doctorId: doc.id,
      patientId: pat.id,
      visitDate: d,
      reason: pick(REASONS),
      diagnosis: pick(DIAGNOSES),
      notes: "Chart note.",
    });
  }
  await db.insert(visits).values(visitValues);

  console.log(
    `Seed completed: 2 orgs, 3 facilities, ${insertedDoctors.length} doctors, ${insertedPatients.length} patients, ${insuranceValues.length} insurances, ${visitValues.length} visits.`
  );
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
