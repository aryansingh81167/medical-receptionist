export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-primary text-3xl animate-spin">sync</span>
        </div>
        <p className="font-label-md text-primary animate-pulse">Loading CareFlow...</p>
      </div>
    </div>
  );
}
