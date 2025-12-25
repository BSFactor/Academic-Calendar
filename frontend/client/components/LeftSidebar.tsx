import React, { useState } from "react";
import { getLocalProfile } from "@/lib/profileService";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Bell, ChevronLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LeftSidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="hidden md:block">
      <aside className={`bg-white border-r border-gray-200 sticky top-0 h-screen p-3 flex flex-col transition-all duration-300 ease-in-out transform ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <button
              aria-label={sidebarCollapsed ? 'Open sidebar' : 'Logo'}
              onClick={() => sidebarCollapsed && setSidebarCollapsed(false)}
              className="p-1 rounded-md hover:bg-gray-100"
            >
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </button>
            <div className={`font-bold text-xl tracking-tight transition-all duration-300 transform ${sidebarCollapsed ? 'opacity-0 -translate-x-2 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
              CalendarApp
            </div>
          </div>
          {!sidebarCollapsed && (
            <button
              aria-label="Collapse sidebar"
              onClick={() => setSidebarCollapsed(true)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>

        <div className={`mt-4 flex-1 flex flex-col gap-4 transition-all duration-300 transform ${sidebarCollapsed ? 'opacity-0 -translate-x-2 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
          <nav className="flex flex-col gap-1 px-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Schedule
            </h3>
              {(() => {
                const profile = getLocalProfile();
                const role = profile?.role;
                const showCreate = role === "academic_assistant" || role === "administrator";
                const showApprove = role === "department_assistant" || role === "administrator";
                const showBulkUpload = role === "department_assistant" || role === "administrator";
                return (
                  <>
                    <Button variant="ghost" className="justify-start font-medium transition-colors duration-200 rounded-md hover:bg-black hover:text-white" onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" /> Profile
                    </Button>
                    <Button variant="ghost" className="justify-start font-medium transition-colors duration-200 rounded-md hover:bg-black hover:text-white" onClick={() => navigate('/calendar')}>
                      <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
                    </Button>
                    {showCreate && (
                      <Button variant="ghost" className="justify-start font-medium transition-colors duration-200 rounded-md hover:bg-black hover:text-white" onClick={() => navigate('/create')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Event
                      </Button>
                    )}
                    {showApprove && (
                      <Button variant="ghost" className="justify-start font-medium transition-colors duration-200 rounded-md hover:bg-black hover:text-white" onClick={() => navigate('/approve')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Approve Events
                      </Button>
                    )}
                    {showBulkUpload && (
                      <Button variant="ghost" className="justify-start font-medium transition-colors duration-200 rounded-md hover:bg-black hover:text-white" onClick={() => navigate('/bulk-upload-students')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7M8 3v4M16 3v4M3 11h18" />
                        </svg>
                        Bulk Upload Students
                      </Button>
                    )}
                  </>
                );
              })()}
            <Button variant="ghost" className="justify-start font-medium transition-colors duration-200 rounded-md hover:bg-black hover:text-white">
              <Bell className="mr-2 h-4 w-4" /> Reminders
            </Button>
          </nav>

          <div className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-100 px-1">
            <div className="flex justify-between items-center mb-4 font-semibold text-sm">
              <span>November</span>
              <span className="text-gray-500">2025</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
              <div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-700">
              <div className="p-1"></div><div className="p-1"></div><div className="p-1">1</div>
              <div className="p-1">2</div><div className="p-1 bg-black text-white rounded-full">3</div><div className="p-1">4</div><div className="p-1">5</div>
              <div className="p-1">6</div><div className="p-1">7</div><div className="p-1">8</div><div className="p-1">9</div>
              <div className="p-1">10</div><div className="p-1">11</div><div className="p-1">12</div><div className="p-1">13</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
