"use client";

import { useChat, type Message } from "ai/react";
import { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { InfoPanel } from "@/components/dashboard/InfoPanel";

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser doesn't support voice input.");
      return;
    }
    
    setIsListening(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange({ target: { value: transcript } } as any);
      setIsListening(false);
    };
    
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  }, [handleInputChange]);

  return (
    <div className="bg-background overflow-hidden font-body-md">
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Canvas */}
      <main className={`${isSidebarOpen ? 'md:pl-72' : ''} pt-16 h-screen flex flex-col md:flex-row transition-all duration-300 ease-in-out`}>
        
        {/* Left: Digital Receptionist Center Stage */}
        <div className="flex-1 flex flex-col p-margin-mobile md:p-margin-desktop overflow-hidden">
          


          {/* Chat Interface */}
          <div className="flex-1 flex flex-col bg-surface-container-lowest card-shadow rounded-[2rem] overflow-hidden relative">
            
            {/* Chat Header */}
            <div className="px-8 py-6 flex items-center justify-between border-b border-outline-variant/20 bg-surface/50 glass-effect">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
                </div>
                <div>
                  <h1 className="font-headline-md text-headline-md text-on-surface">Digital Receptionist</h1>
                  <p className="text-label-sm font-label-sm text-primary flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    AI Assistant Online
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px]">
              
              {messages.length === 0 && (
                <>
                  {/* Default Receptionist Message */}
                  <div className="flex items-start gap-4 max-w-2xl">
                    <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary">support_agent</span>
                    </div>
                    <div className="bg-surface-container-low p-5 rounded-2xl rounded-tl-none shadow-sm">
                      <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                        Good morning! How can I assist with your healthcare needs today? 
                        <br/><br/>
                        I can help you book new appointments, find test results, or connect you with your care team.
                      </p>
                    </div>
                  </div>

                  {/* Suggested Replies */}
                  <div className="flex flex-wrap gap-3 ml-14">
                    <button onClick={() => handleInputChange({ target: { value: 'Schedule physical exam' } } as any)} className="px-4 py-2 border border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary hover:text-white transition-colors">Schedule physical exam</button>
                    <button onClick={() => handleInputChange({ target: { value: 'See lab results' } } as any)} className="px-4 py-2 border border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary hover:text-white transition-colors">See lab results</button>
                    <button onClick={() => handleInputChange({ target: { value: 'Medication refill' } } as any)} className="px-4 py-2 border border-primary text-primary rounded-full font-label-md text-label-md hover:bg-primary hover:text-white transition-colors">Medication refill</button>
                  </div>
                </>
              )}

              {/* Dynamic Messages */}
              {messages.map((message: Message) => (
                <div key={message.id} className={`flex gap-4 max-w-2xl ${message.role === 'user' ? 'ml-auto flex-row-reverse' : 'items-start'}`}>
                  <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-primary-container text-on-primary' 
                      : 'bg-surface-container-high'
                  }`}>
                    <span className="material-symbols-outlined text-primary">
                      {message.role === 'user' ? 'person' : 'support_agent'}
                    </span>
                  </div>
                  
                  <div className={`p-5 rounded-2xl shadow-sm leading-relaxed text-[16px] ${
                    message.role === 'user' 
                      ? 'bg-primary text-on-primary rounded-tr-none' 
                      : 'bg-surface-container-low text-on-surface rounded-tl-none'
                  }`}>
                    {message.content && <div>{message.content}</div>}
                    
                    {message.toolInvocations?.map(tool => (
                      <div key={tool.toolCallId} className="mt-3">
                        {tool.state !== 'result' ? (
                          <span className="italic text-on-surface-variant flex items-center gap-2">
                            <span className="material-symbols-outlined animate-spin text-[16px]">sync</span> 
                            {tool.toolName === 'checkAvailability' ? 'Checking schedule...' : 'Processing request...'}
                          </span>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {/* Book Appointment Result UI */}
                            {tool.toolName === 'bookAppointment' && tool.result.success && (
                              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-start gap-3">
                                <span className="material-symbols-outlined text-primary text-[28px]">check_circle</span>
                                <div>
                                  <p className="font-bold text-on-surface">Appointment Confirmed</p>
                                  <p className="text-sm text-on-surface-variant mt-1">ID: <span className="font-mono text-primary bg-primary/10 px-1 py-0.5 rounded">{tool.result.appointmentId}</span></p>
                                  <p className="text-sm text-on-surface-variant mt-1">{tool.result.message}</p>
                                </div>
                              </div>
                            )}

                            {/* Check Availability Result UI */}
                            {tool.toolName === 'checkAvailability' && (
                               <div className="bg-surface p-4 rounded-xl border border-outline-variant/30">
                                 <p className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-tertiary">calendar_today</span> Available Slots</p>
                                 <div className="flex flex-wrap gap-2 mt-3">
                                    {tool.result.availableSlots?.map((slot: any) => (
                                      <button key={slot.slotId} onClick={() => { handleInputChange({ target: { value: `Book slot ${slot.slotId} with ${slot.doctor} at ${slot.time}` } } as any); setTimeout(() => handleSubmit(new Event('submit') as any), 100); }} className="px-3 py-1.5 bg-surface-container-low hover:bg-primary hover:text-white text-on-surface rounded-lg text-sm border border-outline-variant/20 transition-all active:scale-95 text-left flex flex-col items-start gap-0.5">
                                        <span className="font-semibold">{slot.time}</span>
                                        <span className="text-xs opacity-90">{slot.doctor}</span>
                                        <span className="text-[10px] opacity-75 uppercase tracking-wider">{slot.specialty}</span>
                                      </button>
                                    ))}
                                   {tool.result.availableSlots?.length === 0 && <span className="text-sm text-error">No slots available for this date.</span>}
                                 </div>
                               </div>
                            )}

                            {/* Get Appointments Result UI */}
                            {tool.toolName === 'getAppointments' && tool.result.success && (
                              <div className="bg-surface p-4 rounded-xl border border-outline-variant/30">
                                 <p className="font-bold text-on-surface flex items-center gap-2"><span className="material-symbols-outlined text-primary">list_alt</span> Your Appointments</p>
                                 <div className="flex flex-col gap-2 mt-3">
                                   {tool.result.appointments?.length > 0 ? tool.result.appointments.map((appt: any) => (
                                     <div key={appt.id} className="p-3 bg-surface-container-lowest rounded-lg border border-outline-variant/20 flex justify-between items-center">
                                       <div>
                                         <p className="font-medium text-sm">{appt.date} at {appt.time}</p>
                                         <p className="text-xs text-on-surface-variant">ID: <span className="font-mono">{appt.id.split('-')[0]}</span></p>
                                       </div>
                                       <button onClick={() => { handleInputChange({ target: { value: `Cancel appointment ${appt.id}` } } as any); setTimeout(() => handleSubmit(new Event('submit') as any), 100); }} className="text-error text-xs hover:underline">Cancel</button>
                                     </div>
                                   )) : (
                                     <p className="text-sm text-on-surface-variant">No upcoming appointments found.</p>
                                   )}
                                 </div>
                              </div>
                            )}

                            {/* Reschedule/Cancel UI */}
                            {(tool.toolName === 'rescheduleAppointment' || tool.toolName === 'cancelAppointment') && tool.result.success && (
                              <div className="bg-secondary-container/20 border border-secondary/30 p-3 rounded-xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-secondary">update</span>
                                <span className="text-sm font-medium text-on-surface">{tool.result.message}</span>
                              </div>
                            )}

                            {/* Error State */}
                            {tool.result && tool.result.success === false && (
                              <div className="bg-error/10 border border-error/30 p-3 rounded-xl flex items-center gap-3">
                                <span className="material-symbols-outlined text-error">error</span>
                                <span className="text-sm font-medium text-error">{tool.result.message}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-4 max-w-2xl">
                  <div className="w-10 h-10 bg-surface-container-high rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">support_agent</span>
                  </div>
                  <div className="bg-surface-container-low p-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </div>
                </div>
              )}
              
              {error && (
                <div className="bg-error/10 border border-error/30 p-4 rounded-xl flex items-center gap-3 max-w-2xl mx-auto my-4 text-error">
                  <span className="material-symbols-outlined">error</span>
                  <span><strong>System Error:</strong> {error.message || "Failed to connect to the AI provider."} Please check your API keys.</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Area */}
            <div className="p-6 bg-surface-container-low border-t border-outline-variant/20">
              <form onSubmit={handleSubmit} className="relative flex items-center focus-within:scale-[1.01] transition-transform">
                <input 
                  className="w-full bg-surface-container-lowest border-none rounded-2xl py-4 pl-6 pr-24 font-body-md text-body-md card-shadow focus:ring-2 focus:ring-primary focus:outline-none transition-all" 
                  placeholder="Type your request here..." 
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <div className="absolute right-3 flex items-center gap-2">
                  <button type="button" onClick={handleVoiceInput} className={`material-symbols-outlined p-2 rounded-lg transition-colors ${isListening ? 'text-error bg-error/10 animate-pulse' : 'text-outline hover:bg-surface-container-high'}`}>mic</button>
                  <button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="bg-primary text-on-primary p-2 rounded-xl shadow-md active:scale-95 transition-transform disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>

        <InfoPanel onAction={(val) => handleInputChange({ target: { value: val } } as any)} refreshTrigger={messages.length} />
      </main>

      {/* Bottom Navigation Bar (Mobile) */}
      <footer className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 px-4 bg-surface shadow-[0_-4px_20px_rgba(0,0,0,0.04)] md:hidden">
        <Link href="/" className="flex flex-col items-center justify-center text-primary font-bold active:scale-95 transition-all">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="font-label-sm text-label-sm">Home</span>
        </Link>
        <Link href="/appointments" className="flex flex-col items-center justify-center text-secondary active:scale-95 transition-all">
          <span className="material-symbols-outlined">calendar_today</span>
          <span className="font-label-sm text-label-sm">Schedule</span>
        </Link>
      </footer>
    </div>
  );
}
