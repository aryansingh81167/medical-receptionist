"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Header } from "@/components/layout/Header";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('name, email, phone').eq('auth_user_id', user.id).single();
        if (data) {
          setProfile({ 
            name: data.name || user.user_metadata?.full_name || '', 
            email: data.email || user.email || '', 
            phone: data.phone || '' 
          });
        } else {
          setProfile({
            name: user.user_metadata?.full_name || '',
            email: user.email || '',
            phone: ''
          });
        }
      }
      setIsLoading(false);
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').update({ name: profile.name, phone: profile.phone }).eq('auth_user_id', user.id);
      if (error) setMessage("Error saving profile");
      else setMessage("Profile updated successfully!");
    }
    setIsSaving(false);
  };

  return (
    <div className="bg-background overflow-hidden font-body-md text-on-surface">
      <Header showBack />
      <main className="pt-24 px-8 pb-8 md:pt-28 md:px-12 md:pb-12 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">Account Settings</h1>
            <p className="text-on-surface-variant">Manage your personal information and preferences.</p>
          </div>

        <div className="bg-surface-container-lowest rounded-3xl p-8 card-shadow border border-outline-variant/30">
          <h2 className="font-headline-sm text-headline-sm mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">person</span> Personal Information
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center p-6"><span className="material-symbols-outlined animate-spin text-primary">sync</span></div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-md font-bold text-on-surface-variant">Full Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} className="w-full p-3 rounded-xl border border-outline-variant/50 bg-surface focus:outline-primary transition-colors" required />
                </div>
                <div className="space-y-2">
                  <label className="font-label-md font-bold text-on-surface-variant">Email Address</label>
                  <input type="email" value={profile.email} disabled className="w-full p-3 rounded-xl border border-outline-variant/30 bg-surface-container opacity-70 cursor-not-allowed" />
                  <p className="text-xs text-on-surface-variant">Email cannot be changed here.</p>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md font-bold text-on-surface-variant">Phone Number</label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full p-3 rounded-xl border border-outline-variant/50 bg-surface focus:outline-primary transition-colors" placeholder="e.g. 555-0123" />
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-xl font-medium ${message.includes('success') ? 'bg-[#e6f4ea] text-[#137333]' : 'bg-error/10 text-error'}`}>
                  {message}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-outline-variant/20">
                <button type="submit" disabled={isSaving} className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {isSaving ? <span className="material-symbols-outlined animate-spin">sync</span> : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
