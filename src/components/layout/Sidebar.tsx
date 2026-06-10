"use client";

import { createClient } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [showEmergency, setShowEmergency] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: 'dashboard' },
    { name: 'Appointments', path: '/appointments', icon: 'calendar_today' },
    { name: 'Medical Records', path: '/records', icon: 'clinical_notes' },
  ];

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
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={onClose}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${isActive ? 'text-primary font-bold bg-primary-container/10' : 'text-on-secondary-container font-medium hover:bg-secondary-container/50'}`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span className="font-label-md text-label-md">{link.name}</span>
              </Link>
            );
          })}
        </div>
        <div className="pt-6 border-t border-outline-variant/30 space-y-2">
          <button onClick={() => setShowEmergency(true)} className="w-full bg-error text-on-primary font-label-md text-label-md py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 hover:bg-error/90 active:scale-95 transition-all shadow-sm">
            <span className="material-symbols-outlined">emergency</span>
            Emergency Support
          </button>
          
          <Link 
            href="/settings" 
            onClick={onClose}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${pathname === '/settings' ? 'text-primary font-bold bg-primary-container/10' : 'text-on-secondary-container font-medium hover:bg-secondary-container/50'}`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </Link>
          
          <button onClick={handleSignOut} className="w-full flex items-center gap-4 px-4 py-3 text-on-secondary-container font-medium hover:bg-secondary-container/50 rounded-lg transition-all text-left">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Emergency Modal */}
      {showEmergency && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl p-8 max-w-md w-full card-shadow border border-error/20 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-error text-[32px]">warning</span>
            </div>
            <h3 className="text-center font-headline-md text-headline-md text-on-surface mb-2">Emergency Contacts</h3>
            <p className="text-center text-body-md font-body-md text-on-surface-variant mb-8">
              If you are experiencing a life-threatening medical emergency, please immediately call your local emergency services.
            </p>
            <div className="space-y-3 mb-8">
              <a href="tel:911" className="flex items-center gap-4 p-4 rounded-2xl bg-error text-white hover:bg-error/90 transition-colors shadow-sm">
                <div className="bg-white/20 p-2 rounded-full"><span className="material-symbols-outlined">call</span></div>
                <div>
                  <div className="font-bold font-label-lg">Call 911</div>
                  <div className="text-sm opacity-90">Medical Emergency</div>
                </div>
              </a>
              <a href="tel:1-800-273-8255" className="flex items-center gap-4 p-4 rounded-2xl border border-error/30 text-error hover:bg-error/5 transition-colors">
                <div className="bg-error/10 p-2 rounded-full"><span className="material-symbols-outlined">support_agent</span></div>
                <div>
                  <div className="font-bold font-label-lg">24/7 Nurse Hotline</div>
                  <div className="text-sm opacity-80">1-800-CAREFLOW</div>
                </div>
              </a>
            </div>
            <button 
              onClick={() => setShowEmergency(false)}
              className="w-full py-3 bg-surface-container-high text-on-surface hover:bg-surface-container-highest rounded-xl font-bold transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </>
  );
}
