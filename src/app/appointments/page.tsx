"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Header } from "@/components/layout/Header";

type Appointment = {
  id: string;
  symptoms: string;
  status: string;
  slots: {
    start_time: string;
    end_time: string;
  };
  doctors: {
    name: string;
    specialty: string;
  };
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAppointments() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const { data: profile } = await supabase.from('profiles').select('id').eq('auth_user_id', user.id).single();
      if (!profile) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          symptoms,
          status,
          slots (
            start_time,
            end_time
          ),
          doctors (
            name,
            specialty
          )
        `)
        .eq('patient_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAppointments(data as any);
      }
      setIsLoading(false);
    }
    
    fetchAppointments();
  }, []);

  return (
    <div className="bg-background min-h-screen overflow-hidden font-body-md text-on-surface">
      <Header showBack />
      <main className="pt-24 px-8 pb-8 md:pt-28 md:px-12 md:pb-12 max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">My Appointments</h1>
          <p className="text-on-surface-variant">View and manage your upcoming and past appointments.</p>
        </div>

        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low flex justify-between items-center">
            <h2 className="font-headline-md text-headline-md">Your Schedule</h2>
            <span className="bg-primary/10 text-primary font-label-sm px-3 py-1 rounded-full">
              {appointments.length} Total
            </span>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center p-12">
                <span className="material-symbols-outlined text-outline-variant text-5xl mb-4">event_busy</span>
                <h3 className="font-headline-md text-on-surface">No appointments</h3>
                <p className="text-on-surface-variant mt-2">You don't have any appointments booked.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => {
                  const startTime = new Date(apt.slots?.start_time || new Date());
                  const formattedDate = startTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
                  const formattedTime = startTime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                  
                  return (
                    <div key={apt.id} className="p-5 rounded-2xl border border-outline-variant/30 hover:border-primary/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined">calendar_month</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-on-surface text-lg">{formattedDate}</h3>
                          <p className="text-primary font-medium">{formattedTime}</p>
                          <p className="text-on-surface-variant text-sm mt-1">Dr. {apt.doctors?.name || "Unassigned"} • {apt.doctors?.specialty || "General"}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:items-end gap-2">
                        <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-label-sm border border-[#ceead6] self-start md:self-auto">
                          {apt.status || "Confirmed"}
                        </span>
                        <p className="text-sm text-on-surface-variant line-clamp-1 max-w-[200px]" title={apt.symptoms}>
                          {apt.symptoms}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
