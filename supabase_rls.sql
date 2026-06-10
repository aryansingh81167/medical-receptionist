-- SECURITY AUDIT: ROW LEVEL SECURITY (RLS) POLICIES
-- Run this script in the Supabase SQL Editor to enforce production-level security.

-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

-- 2. Profiles Table Policies
-- Users can only see and update their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = auth_user_id);

-- 3. Appointments Table Policies
-- Patients can only see, create, and update their own appointments
-- We verify ownership by joining profiles table to get the patient_id
CREATE POLICY "Patients can view own appointments" 
ON appointments FOR SELECT 
USING (
  patient_id IN (
    SELECT id FROM profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Patients can insert own appointments" 
ON appointments FOR INSERT 
WITH CHECK (
  patient_id IN (
    SELECT id FROM profiles WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Patients can update own appointments" 
ON appointments FOR UPDATE 
USING (
  patient_id IN (
    SELECT id FROM profiles WHERE auth_user_id = auth.uid()
  )
);

-- 4. Slots Table Policies
-- Anyone authenticated can view available slots
CREATE POLICY "Anyone can view slots" 
ON slots FOR SELECT 
USING (auth.role() = 'authenticated');

-- Only authenticated users can update a slot (e.g. to book it)
-- Note: In a stricter environment, you might only allow your backend service_role to update slots.
-- However, since our backend uses the user's session (SSR), we must allow authenticated users to update slots.
CREATE POLICY "Users can update slots to book/free them" 
ON slots FOR UPDATE 
USING (auth.role() = 'authenticated');

-- 5. Doctors Table Policies
-- Anyone authenticated can view doctors
CREATE POLICY "Anyone can view doctors" 
ON doctors FOR SELECT 
USING (auth.role() = 'authenticated');

-- Note: No INSERT/UPDATE/DELETE policies for doctors and slots are given for patients.
-- Only Admins (via Supabase dashboard or a separate admin app) can manage doctors and create new slots.
