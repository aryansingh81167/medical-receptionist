export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      <nav className={`fixed left-0 top-0 h-full z-50 w-72 flex flex-col bg-surface-container-lowest border-r border-outline-variant pt-20 pb-8 px-6 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <button onClick={onClose} className="absolute top-4 right-4 material-symbols-outlined p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer active:opacity-80 text-on-surface-variant md:hidden">close</button>
        <div className="mb-10 mt-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary-container/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>medical_services</span>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-primary leading-tight">CareFlow</h2>
              <p className="text-on-secondary-container font-label-md text-label-md opacity-70">Clinical Integrity System</p>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <a className="flex items-center gap-4 px-4 py-3 text-primary font-bold bg-primary-container/10 rounded-lg transition-all" href="#">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-4 px-4 py-3 text-on-secondary-container font-medium hover:bg-secondary-container/50 rounded-lg transition-all" href="#">
            <span className="material-symbols-outlined">calendar_today</span>
            <span className="font-label-md text-label-md">Appointments</span>
          </a>
          <a className="flex items-center gap-4 px-4 py-3 text-on-secondary-container font-medium hover:bg-secondary-container/50 rounded-lg transition-all" href="#">
            <span className="material-symbols-outlined">clinical_notes</span>
            <span className="font-label-md text-label-md">Medical Records</span>
          </a>
        </div>
        <div className="pt-6 border-t border-outline-variant/30 space-y-2">
          <button className="w-full bg-error text-on-primary font-label-md text-label-md py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 active:scale-95 transition-transform">
            <span className="material-symbols-outlined">emergency</span>
            Emergency Support
          </button>
          <a className="flex items-center gap-4 px-4 py-3 text-on-secondary-container font-medium hover:bg-secondary-container/50 rounded-lg transition-all" href="#">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </a>
        </div>
      </nav>
    </>
  );
}
