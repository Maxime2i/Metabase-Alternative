CREATE TABLE IF NOT EXISTS "organizations" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" varchar(255) NOT NULL,
  "address" text,
  "phone" varchar(20),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "facilities" (
  "id" serial PRIMARY KEY NOT NULL,
  "organization_id" integer NOT NULL,
  "name" varchar(255) NOT NULL,
  "address" text,
  "phone" varchar(20),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "doctors" (
  "id" serial PRIMARY KEY NOT NULL,
  "facility_id" integer NOT NULL,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "phone" varchar(20),
  "specialty" varchar(100),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "patients" (
  "id" serial PRIMARY KEY NOT NULL,
  "facility_id" integer NOT NULL,
  "first_name" varchar(100) NOT NULL,
  "last_name" varchar(100) NOT NULL,
  "email" varchar(255) UNIQUE,
  "phone" varchar(20),
  "date_of_birth" date,
  "address" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "insurances" (
  "id" serial PRIMARY KEY NOT NULL,
  "patient_id" integer NOT NULL,
  "provider_name" varchar(255) NOT NULL,
  "policy_number" varchar(100) NOT NULL,
  "group_number" varchar(100),
  "effective_date" date,
  "expiration_date" date,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "visits" (
  "id" serial PRIMARY KEY NOT NULL,
  "doctor_id" integer NOT NULL,
  "patient_id" integer NOT NULL,
  "visit_date" timestamp NOT NULL,
  "reason" text,
  "diagnosis" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "facilities" ADD CONSTRAINT "facilities_organization_id_organizations_id_fk" 
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id");

ALTER TABLE "doctors" ADD CONSTRAINT "doctors_facility_id_facilities_id_fk" 
  FOREIGN KEY ("facility_id") REFERENCES "facilities"("id");

ALTER TABLE "patients" ADD CONSTRAINT "patients_facility_id_facilities_id_fk" 
  FOREIGN KEY ("facility_id") REFERENCES "facilities"("id");

ALTER TABLE "insurances" ADD CONSTRAINT "insurances_patient_id_patients_id_fk" 
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id");

ALTER TABLE "visits" ADD CONSTRAINT "visits_doctor_id_doctors_id_fk" 
  FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id");

ALTER TABLE "visits" ADD CONSTRAINT "visits_patient_id_patients_id_fk" 
  FOREIGN KEY ("patient_id") REFERENCES "patients"("id");
