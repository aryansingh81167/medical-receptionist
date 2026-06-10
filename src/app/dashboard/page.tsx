"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: string;
  patient_name: string;
  date: string;
  time: string;
  symptoms: string;
  created_at?: string;
};

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      if (supabase) {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .order('date', { ascending: true })
          .order('time', { ascending: true });
          
        if (!error && data) {
          setAppointments(data);
        }
      } else {
        // Empty state if Supabase isn't connected
        setAppointments([]);
      }
      setIsLoading(false);
    }
    
    fetchAppointments();
  }, []);

  return (
    <div className="bg-surface min-h-screen p-8 md:p-12 font-body-md text-on-surface">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Doctor's Dashboard</h1>
            <p className="text-on-surface-variant">View and manage patient appointments.</p>
          </div>
          <div className="bg-surface-container-low p-4 rounded-xl flex items-center gap-4 border border-outline-variant/30 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[28px]">stethoscope</span>
            </div>
            <div>
              <p className="font-label-md font-bold text-on-surface">Dr. James Wilson</p>
              <p className="text-label-sm text-on-surface-variant">Active</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-[2rem] shadow-sm border border-outline-variant/20 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20 bg-surface-container-low flex justify-between items-center">
            <h2 className="font-headline-md text-headline-md">Upcoming Appointments</h2>
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
                <p className="text-on-surface-variant mt-2">There are no upcoming appointments scheduled yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-on-surface-variant border-b border-outline-variant/20">
                      <th className="pb-4 font-label-md">Patient</th>
                      <th className="pb-4 font-label-md">Date & Time</th>
                      <th className="pb-4 font-label-md">Symptoms / Reason</th>
                      <th className="pb-4 font-label-md">Status</th>
                      <th className="pb-4 font-label-md">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="border-b border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
                              {apt.patient_name.charAt(0)}
                            </div>
                            <span className="font-body-md font-medium text-on-surface">{apt.patient_name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-col">
                            <span className="font-body-md text-on-surface">{apt.date}</span>
                            <span className="text-label-sm text-primary">{apt.time}</span>
                          </div>
                        </td>
                        <td className="py-4 text-on-surface-variant max-w-xs truncate" title={apt.symptoms}>
                          {apt.symptoms}
                        </td>
                        <td className="py-4">
                          <span className="bg-[#e6f4ea] text-[#137333] px-3 py-1 rounded-full font-label-sm border border-[#ceead6]">
                            Confirmed
                          </span>
                        </td>
                        <td className="py-4">
                          <button className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors inline-flex">
                            <span className="material-symbols-outlined text-[20px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
