import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export function InfoPanel({ onAction, refreshTrigger = 0 }: { onAction?: (action: string) => void, refreshTrigger?: number }) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAppointments() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data: profile } = await supabase.from('profiles').select('id, name').eq('auth_user_id', user.id).single();
      
      if (!profile) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select('id, symptoms, status, slots(start_time), doctors(name)')
        .eq('patient_id', profile.id)
        .eq('status', 'scheduled')
        .limit(3);
        
      if (!error && data) {
        const sortedData = data.sort((a, b) => new Date((a.slots as any)?.start_time).getTime() - new Date((b.slots as any)?.start_time).getTime());

        const formatted = sortedData.map(appt => {
          const startTime = new Date((appt.slots as any)?.start_time);
          return {
            id: appt.id,
            date: startTime.toLocaleDateString(),
            time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            patient_name: profile.name,
            symptoms: appt.symptoms,
            doctor: (appt.doctors as any)?.name
          };
        });
        setAppointments(formatted);
      }
      setLoading(false);
    }
    fetchAppointments();
  }, [refreshTrigger]);

  return (
    <aside className="w-full md:w-[350px] p-margin-mobile md:p-margin-desktop md:pl-0 flex flex-col gap-stack-md overflow-y-auto custom-scrollbar">
      <div className="bg-surface-container-lowest card-shadow rounded-[2rem] p-6 flex flex-col flex-1 h-full max-h-[80vh]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline-md text-headline-md text-on-surface">Upcoming Appointments</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center p-6 mb-6">
            <span className="material-symbols-outlined animate-spin text-primary text-[32px]">sync</span>
          </div>
        ) : appointments.length > 0 ? (
          <div className="flex flex-col gap-3 mb-6">
            {appointments.map((appt) => (
              <div key={appt.id} className="flex items-center gap-4 p-4 border border-outline-variant/30 rounded-2xl bg-surface">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
                </div>
                <div>
                  <p className="font-label-lg text-label-lg text-on-surface font-semibold">{appt.date} at {appt.time}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant capitalize">{appt.patient_name || 'Patient'} • {appt.symptoms || 'General'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-4 p-4 border border-outline-variant/30 rounded-2xl mb-6 bg-surface">
            <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-on-surface-variant text-[24px]">calendar_month</span>
            </div>
            <div>
              <p className="font-label-lg text-label-lg text-on-surface font-semibold">No appointments yet</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Use the receptionist to book.</p>
            </div>
          </div>
        )}

        {/* Quick Actions moved here */}
        <h3 className="font-headline-md text-headline-md text-on-surface mb-4 mt-2">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 flex-1">
          <button onClick={() => onAction?.('Book Appointment')} className="flex flex-col items-center justify-center p-4 bg-surface border border-outline-variant/20 rounded-2xl hover:bg-primary-container/10 transition-all group active:scale-95">
            <span className="material-symbols-outlined text-primary mb-2 text-[28px] group-hover:scale-110 transition-transform">add_circle</span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">Book Appt</span>
          </button>
          <button onClick={() => onAction?.('Check Availability')} className="flex flex-col items-center justify-center p-4 bg-surface border border-outline-variant/20 rounded-2xl hover:bg-primary-container/10 transition-all group active:scale-95">
            <span className="material-symbols-outlined text-tertiary mb-2 text-[28px] group-hover:scale-110 transition-transform">verified</span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">Check Avail</span>
          </button>
          <button onClick={() => onAction?.('Reschedule Appointment')} className="flex flex-col items-center justify-center p-4 bg-surface border border-outline-variant/20 rounded-2xl hover:bg-primary-container/10 transition-all group active:scale-95">
            <span className="material-symbols-outlined text-secondary mb-2 text-[28px] group-hover:scale-110 transition-transform">event_repeat</span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">Reschedule</span>
          </button>
          <button onClick={() => onAction?.('Cancel Appointment')} className="flex flex-col items-center justify-center p-4 bg-surface border border-outline-variant/20 rounded-2xl hover:bg-primary-container/10 transition-all group active:scale-95">
            <span className="material-symbols-outlined text-error mb-2 text-[28px] group-hover:scale-110 transition-transform">cancel</span>
            <span className="font-label-sm text-label-sm text-on-surface font-medium">Cancel</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
