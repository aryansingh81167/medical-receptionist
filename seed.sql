-- SEED DATA: Run this in the Supabase SQL Editor to populate dummy doctors and slots

-- 1. Insert Doctors
INSERT INTO doctors (id, name, specialty) VALUES
  (gen_random_uuid(), 'Dr. Sarah Chen', 'General Practice'),
  (gen_random_uuid(), 'Dr. James Wilson', 'Cardiology'),
  (gen_random_uuid(), 'Dr. Emily Rodriguez', 'Pediatrics');

-- 2. Insert Slots for the next 7 days
DO $$
DECLARE
    doctor_rec RECORD;
    d_date DATE;
    s_time TIME;
BEGIN
    FOR doctor_rec IN SELECT id FROM doctors LOOP
        FOR d_date IN SELECT current_date + i FROM generate_series(1, 7) i LOOP
            FOR s_time IN SELECT * FROM (VALUES ('09:00:00'::TIME), ('10:00:00'::TIME), ('11:00:00'::TIME), ('14:00:00'::TIME), ('15:00:00'::TIME)) AS t(time) LOOP
                INSERT INTO slots (doctor_id, start_time, status)
                VALUES (
                    doctor_rec.id,
                    (d_date + s_time)::timestamp with time zone,
                    'available'
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;
