export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 shadow-sm bg-surface">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="material-symbols-outlined p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer active:opacity-80 text-on-surface-variant">menu</button>
        <span className="font-headline-md text-headline-md font-bold text-primary hidden sm:block">CareFlow Portal</span>
      </div>
      <div className="flex items-center gap-unit md:gap-stack-md">
        <button className="material-symbols-outlined p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer active:opacity-80 text-on-surface-variant">notifications</button>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container cursor-pointer active:opacity-80 bg-primary/20">
          <img alt="Patient Profile Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0vzR-ecz9nAmMUHEU5wdbqiMF8g4epCh0YS9lRadv8ey0xLyDLlH0KRsU8p1flxa_xQ6f6zMe8PBSJw0yhW8eo2HracOpVSuqeBaJ6HpWZ5g7BuquEynWKORgZfxe50__ZOknJ2JNFi2gDlFVZ2OZkT4Rw4fAX6BR1WQ8tpbf6Z_a2hOy-mSw4b0DYnrVx8hMYYNpp7d406nph4Ab-nUFhOsjMJNEG_fxkw77uj7yrxrqL6lAKsVo2oSsGCv30gao1DT3KA7O2QI"/>
        </div>
      </div>
    </header>
  );
}
