"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [initials, setInitials] = useState('?');
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('name').eq('auth_user_id', user.id).single();
        const name = profile?.name || user.email || '?';
        setInitials(name.charAt(0).toUpperCase());
      }
    }
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 shadow-sm bg-surface">
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="material-symbols-outlined p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer active:opacity-80 text-on-surface-variant">menu</button>
        <span className="font-headline-md text-headline-md font-bold text-primary hidden sm:block">CareFlow Portal</span>
      </div>
      <div className="flex items-center gap-unit md:gap-stack-md relative">
        <button className="material-symbols-outlined p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer active:opacity-80 text-on-surface-variant">notifications</button>
        
        <div 
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-primary-container cursor-pointer active:opacity-80 bg-primary text-white font-bold"
        >
          {initials}
        </div>

        {showDropdown && (
          <div className="absolute right-0 top-14 w-48 bg-surface-container-lowest border border-outline-variant/30 card-shadow rounded-2xl py-2 flex flex-col z-50">
            <div className="px-4 py-2 border-b border-outline-variant/20 mb-2">
              <p className="font-label-sm text-on-surface-variant">Signed in</p>
            </div>
            <button onClick={() => setShowDropdown(false)} className="px-4 py-2 text-left text-on-surface font-body-md hover:bg-surface-container-low transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">manage_accounts</span> Profile
            </button>
            <button onClick={handleSignOut} className="px-4 py-2 text-left text-error font-body-md hover:bg-error/10 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">logout</span> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
