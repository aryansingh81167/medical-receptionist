import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Configure OpenAI provider to point to Groq's API
const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      messages,
      system: `You are a helpful, professional, and friendly AI Receptionist for a medical clinic called CareFlow. 
      Your job is to assist patients, answer their questions, and help them book appointments.
      Be concise, empathetic, and clear.
      Assume the patient is already logged in as "John Doe" (patient_id: 11111111-1111-1111-1111-111111111111).
      If they ask to book an appointment, ask them for their symptoms and preferred date. Use checkAvailability to find slots, then use bookAppointment with the slotId.`,
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
          description: 'Book an appointment slot for the patient using a slotId',
          parameters: z.object({
            slotId: z.string().describe('The ID of the slot to book, obtained from checkAvailability'),
            symptoms: z.string(),
          }),
          execute: async ({ slotId, symptoms }: { slotId: string, symptoms: string }) => {
            if (supabase) {
              const patientId = '11111111-1111-1111-1111-111111111111';
              
              // 1. Get slot info
              const { data: slotData, error: slotError } = await supabase
                .from('slots')
                .select('doctor_id')
                .eq('id', slotId)
                .single();
                
              if (slotError) return { success: false, message: 'Invalid slot.' };
              
              // 2. Mark slot as booked
              await supabase.from('slots').update({ status: 'booked' }).eq('id', slotId);
              
              // 3. Create appointment
              const { data, error } = await supabase
                .from('appointments')
                .insert([{ 
                  patient_id: patientId, 
                  doctor_id: slotData.doctor_id, 
                  slot_id: slotId, 
                  symptoms 
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
          parameters: z.object({}),
          execute: async () => {
            if (supabase) {
              const { data, error } = await supabase
                .from('appointments')
                .select('id, symptoms, status, slots(start_time), doctors(name)')
                .eq('patient_id', '11111111-1111-1111-1111-111111111111')
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
          description: 'Reschedule an appointment. You must first use checkAvailability to get a new slotId.',
          parameters: z.object({
            appointmentId: z.string().describe('The ID of the appointment to reschedule'),
            newSlotId: z.string().describe('The ID of the new slot, obtained from checkAvailability'),
          }),
          execute: async ({ appointmentId, newSlotId }: { appointmentId: string, newSlotId: string }) => {
            if (supabase) {
              // Free old slot
              const { data: oldAppt } = await supabase.from('appointments').select('slot_id').eq('id', appointmentId).single();
              if (oldAppt) {
                await supabase.from('slots').update({ status: 'available' }).eq('id', oldAppt.slot_id);
              }
              // Mark new slot as booked
              await supabase.from('slots').update({ status: 'booked' }).eq('id', newSlotId);
              // Update appointment
              const { error } = await supabase.from('appointments').update({ slot_id: newSlotId }).eq('id', appointmentId);
              if (error) return { success: false, message: 'Failed to reschedule.' };
              return { success: true, message: `Successfully rescheduled appointment.` };
            }
            return { success: false, message: 'Supabase not connected.' };
          },
        }),
        cancelAppointment: tool({
          description: 'Cancel an appointment',
          parameters: z.object({
            appointmentId: z.string().describe('The ID of the appointment to cancel'),
          }),
          execute: async ({ appointmentId }: { appointmentId: string }) => {
            if (supabase) {
              // Free slot
              const { data: oldAppt } = await supabase.from('appointments').select('slot_id').eq('id', appointmentId).single();
              if (oldAppt) {
                await supabase.from('slots').update({ status: 'available' }).eq('id', oldAppt.slot_id);
              }
              // Cancel appointment
              const { error } = await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', appointmentId);
                
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
