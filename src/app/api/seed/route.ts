import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 1. Check if we already have doctors
    const { data: existingDoctors, error: docErr } = await supabase.from('doctors').select('id');
    if (docErr) throw docErr;

    if (existingDoctors && existingDoctors.length > 0) {
      return NextResponse.json({ message: 'Database already seeded with doctors.', success: true });
    }

    // 2. Insert Doctors
    const doctorsToInsert = [
      { name: 'Dr. Sarah Chen', specialty: 'General Practice' },
      { name: 'Dr. James Wilson', specialty: 'Cardiology' },
      { name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics' }
    ];

    const { data: insertedDoctors, error: insertDocErr } = await supabase
      .from('doctors')
      .insert(doctorsToInsert)
      .select('id');

    if (insertDocErr || !insertedDoctors) throw insertDocErr;

    // 3. Insert Slots (10 slots for the first doctor, starting from tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // Start at 9 AM tomorrow

    const slotsToInsert = [];
    for (let i = 0; i < 5; i++) {
      slotsToInsert.push({
        doctor_id: insertedDoctors[0].id, // Dr. Sarah Chen
        start_time: new Date(tomorrow.getTime() + i * 60 * 60 * 1000).toISOString(), // 1 hour intervals
        status: 'available'
      });
      slotsToInsert.push({
        doctor_id: insertedDoctors[1].id, // Dr. James Wilson
        start_time: new Date(tomorrow.getTime() + (i + 2) * 60 * 60 * 1000).toISOString(), 
        status: 'available'
      });
    }

    // Also add some slots for today to be safe
    const today = new Date();
    today.setHours(today.getHours() + 2); // 2 hours from now
    
    for (let i = 0; i < 3; i++) {
      slotsToInsert.push({
        doctor_id: insertedDoctors[0].id,
        start_time: new Date(today.getTime() + i * 60 * 60 * 1000).toISOString(),
        status: 'available'
      });
    }

    const { error: insertSlotErr } = await supabase
      .from('slots')
      .insert(slotsToInsert);

    if (insertSlotErr) throw insertSlotErr;

    return NextResponse.json({ message: 'Database successfully seeded!', success: true });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 });
  }
}
