import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function MedicalRecordsPage() {
  // Empty state since we don't have records yet
  const records: any[] = [];

  return (
    <div className="bg-background min-h-screen overflow-hidden font-body-md text-on-surface">
      <Header showBack />
      <main className="pt-24 px-8 pb-8 md:pt-28 md:px-12 md:pb-12 max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Medical Records</h1>
          <p className="text-on-surface-variant">Access your lab results, imaging, and prescription history securely.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {records.length > 0 ? records.map((record) => (
            <div key={record.id} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 card-shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/40 transition-colors cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined">
                    {record.type === 'Lab Results' ? 'science' : record.type === 'Imaging' ? 'radiology' : 'prescriptions'}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{record.title}</h3>
                  <p className="text-sm text-on-surface-variant">{record.type} • Ordered by {record.doctor}</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                <span className="text-sm font-medium">{new Date(record.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${record.status === 'Available' ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {record.status}
                </span>
              </div>
            </div>
          )) : (
            <div className="bg-surface-container-lowest p-12 rounded-3xl border border-outline-variant/30 card-shadow text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl text-primary">folder_open</span>
              </div>
              <h3 className="font-bold text-xl mb-2">No Records Found</h3>
              <p className="text-on-surface-variant max-w-md">You do not have any lab results, imaging, or prescriptions in your file yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
