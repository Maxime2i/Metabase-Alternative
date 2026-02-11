/**
 * Schema description for the clinic database, used as context for the LLM.
 */
export const CLINIC_SCHEMA_CONTEXT = `
PostgreSQL schema (US clinic):

- organizations: id (serial), name, address, phone, created_at, updated_at
- facilities: id (serial), organization_id (FK organizations), name, address, phone, created_at, updated_at
- doctors: id (serial), facility_id (FK facilities), first_name, last_name, email (unique), phone, specialty, created_at, updated_at
- patients: id (serial), facility_id (FK facilities), first_name, last_name, email, phone, date_of_birth, address, created_at, updated_at
- insurances: id (serial), patient_id (FK patients), provider_name, policy_number, group_number, effective_date, expiration_date, created_at, updated_at
- visits: id (serial), doctor_id (FK doctors), patient_id (FK patients), visit_date, reason, diagnosis, notes, created_at, updated_at
`.trim();
