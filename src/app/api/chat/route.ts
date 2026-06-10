import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';

// Configure OpenAI provider to point to Groq's API
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Please log in.' }), { status: 401 });
    }

    let { data: profile } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('auth_user_id', user.id)
      .single();

    if (!profile) {
      // Auto-create profile if it doesn't exist yet
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          auth_user_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient'
        }])
        .select('id, name')
        .single();
        
      if (insertError) {
        console.error('Profile creation error:', insertError);
        return new Response(JSON.stringify({ error: `Failed to create patient profile. Error: ${insertError.message}` }), { status: 500 });
      }
      profile = newProfile;
    }

    const patientId = profile?.id;
    const patientName = profile?.name || 'Patient';

    if (!patientId) {
      return new Response(JSON.stringify({ error: 'Patient profile not found. Please contact support.' }), { status: 400 });
    }

    const { messages } = await req.json();

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages,
      system: `You are a helpful, professional, and friendly AI Receptionist for a medical clinic called CareFlow. 
      Your job is to assist patients, answer their questions, and help them book appointments.
      Be concise, empathetic, and clear.
      Assume the patient is already logged in as "${patientName}" (patient_id: ${patientId}).
      Today's date is ${new Date().toLocaleDateString('en-CA')} (YYYY-MM-DD). Always use this as your reference for "today", "tomorrow", etc.
      If they ask to book an appointment, ask them for their symptoms and preferred date. Use checkAvailability to find slots, then use bookAppointment with the slotId.
      If they ask for medical records or lab results, politely inform them that you do not have access to medical records at this time.
      Only use the tools provided to you. Do not hallucinate tools.`,
      tools: {
        checkAvailability: tool({
          description: 'Check available appointment slots for a given date',
          parameters: z.object({
            date: z.string().describe('The date to check availability for (YYYY-MM-DD)'),
          }),
          execute: async ({ date }: { date: string }) => {
            console.log('Checking availability for', date);
            if (supabase) {
              const { data } = await supabase
                .from('slots')
                .select('id, start_time, doctors(name)')
                .eq('status', 'available')
                .gte('start_time', `${date}T00:00:00.000Z`)
                .lt('start_time', `${date}T23:59:59.999Z`)
                .order('start_time', { ascending: true });
              
              if (!data) return { availableSlots: [], message: `No slots available for ${date}` };
              
              const availableSlots = data.map(slot => ({
                slotId: slot.id,
                time: new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                doctor: (slot.doctors as any)?.name
              }));
              
              return {
                availableSlots,
                message: availableSlots.length > 0 ? `Found available slots for ${date}` : `No slots available for ${date}`,
              };
            }
            return { availableSlots: [], message: 'Supabase not connected' };
          },
        }),
        bookAppointment: tool({
          description: 'Book an appointment slot for the patient using a slotId. You MUST use the exact full slotId UUID.',
          parameters: z.object({
            slotId: z.string().describe('The EXACT full UUID of the slot to book, obtained from checkAvailability'),
            symptoms: z.string(),
          }),
          execute: async ({ slotId, symptoms }: { slotId: string, symptoms: string }) => {
            if (!slotId || slotId.length < 30) return { success: false, message: 'Please provide the exact full slot ID from the availability list.' };
            if (supabase) {
              // 1. Get slot info
              const { data: slotData, error: slotError } = await supabase
                .from('slots')
                .select('doctor_id')
                .eq('id', slotId)
                .single();
                
              if (slotError) return { success: false, message: 'Invalid slot.' };
              
              // 2. Mark slot as booked (Race condition prevention)
              const { data: updatedSlot, error: updateError } = await supabase
                .from('slots')
                .update({ status: 'booked' })
                .eq('id', slotId)
                .eq('status', 'available')
                .select()
                .single();
                
              if (updateError || !updatedSlot) return { success: false, message: 'This slot was just booked by someone else. Please pick another time.' };
              
              // 3. Create appointment
              const { data, error } = await supabase
                .from('appointments')
                .insert([{ 
                  patient_id: patientId, 
                  doctor_id: slotData.doctor_id, 
                  slot_id: slotId, 
                  symptoms,
                  status: 'scheduled'
                }])
                .select();
                
              if (error) return { success: false, message: 'Failed to book appointment.' };
              return { success: true, appointmentId: data?.[0]?.id, message: 'Successfully booked appointment.' };
            }
            return { success: false, message: 'Mock Error' };
          },
        }),
        getAppointments: tool({
          description: 'Get upcoming appointments for the logged-in patient',
          parameters: z.object({
            dummy: z.string().optional().describe('Unused parameter, leave empty'),
          }),
          execute: async () => {
            if (supabase) {
              const { data, error } = await supabase
                .from('appointments')
                .select('id, symptoms, status, slots(start_time), doctors(name)')
                .eq('patient_id', patientId)
                .eq('status', 'scheduled')
                .limit(5);
              
              if (error) return { success: false, message: 'Failed to fetch appointments.' };
              
              // Sort memory because ordering by nested joined column is tricky in Supabase
              const sortedData = data.sort((a, b) => new Date((a.slots as any)?.start_time).getTime() - new Date((b.slots as any)?.start_time).getTime());

              const formatted = sortedData.map(appt => {
                const startTime = new Date((appt.slots as any)?.start_time);
                return {
                  id: appt.id,
                  date: startTime.toLocaleDateString(),
                  time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  doctor: (appt.doctors as any)?.name,
                  symptoms: appt.symptoms
                };
              });
              
              return { success: true, appointments: formatted };
            }
            return { success: false, message: 'Supabase not connected.' };
          },
        }),
        rescheduleAppointment: tool({
          description: 'Reschedule an appointment. You MUST ask the user for both their appointmentId and the newSlotId before calling this.',
          parameters: z.object({
            appointmentId: z.string().describe('The EXACT full UUID of the appointment to reschedule'),
            newSlotId: z.string().describe('The EXACT full UUID of the new slot, obtained from checkAvailability'),
          }),
          execute: async ({ appointmentId, newSlotId }: { appointmentId: string, newSlotId: string }) => {
            if (!appointmentId || appointmentId.length < 30 || !newSlotId || newSlotId.length < 30) return { success: false, message: 'I need both your full exact appointment ID and the exact new slot ID to reschedule.' };
            if (supabase) {
              // Mark new slot as booked first (race condition check)
              const { data: updatedSlot, error: updateError } = await supabase
                .from('slots')
                .update({ status: 'booked' })
                .eq('id', newSlotId)
                .eq('status', 'available')
                .select()
                .single();
                
              if (updateError || !updatedSlot) return { success: false, message: 'The new slot is no longer available.' };
              
              // Now fetch the old appointment
              const { data: oldAppt } = await supabase.from('appointments').select('slot_id').eq('id', appointmentId).eq('patient_id', patientId).single();
              if (!oldAppt) {
                // Revert the new slot since appointment is invalid
                await supabase.from('slots').update({ status: 'available' }).eq('id', newSlotId);
                return { success: false, message: 'Invalid or unauthorized appointment.' };
              }
              
              // Free old slot
              await supabase.from('slots').update({ status: 'available' }).eq('id', oldAppt.slot_id);
              
              // Update appointment
              const { error } = await supabase.from('appointments').update({ slot_id: newSlotId }).eq('id', appointmentId).eq('patient_id', patientId);
              if (error) return { success: false, message: 'Failed to reschedule.' };
              return { success: true, message: `Successfully rescheduled appointment.` };
            }
            return { success: false, message: 'Supabase not connected.' };
          },
        }),
        cancelAppointment: tool({
          description: 'Cancel an appointment. You MUST ask the user for the exact appointmentId before calling this.',
          parameters: z.object({
            appointmentId: z.string().describe('The EXACT full UUID of the appointment to cancel'),
          }),
          execute: async ({ appointmentId }: { appointmentId: string }) => {
            if (!appointmentId || appointmentId.length < 30) return { success: false, message: 'Please provide the exact full appointment ID you wish to cancel.' };
            if (supabase) {
              // Free slot
              const { data: oldAppt } = await supabase.from('appointments').select('slot_id').eq('id', appointmentId).eq('patient_id', patientId).single();
              if (!oldAppt) return { success: false, message: 'Invalid or unauthorized appointment.' };
              
              await supabase.from('slots').update({ status: 'available' }).eq('id', oldAppt.slot_id);
              // Cancel appointment
              const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId).eq('patient_id', patientId);
                
              if (error) return { success: false, message: 'Failed to cancel appointment.' };
              return { success: true, message: 'Successfully canceled appointment.' };
            }
            return { success: false, message: 'Supabase not connected.' };
          },
        }),
      },
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message || error.toString() }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
