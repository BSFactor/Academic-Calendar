import React, { useEffect, useState } from "react";
import LeftSidebar from "@/components/LeftSidebar";
import { formatDateLocal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CalendarIcon, Bell, User } from "lucide-react";
import DashboardBanner from "@/components/ui/dashboard-banner";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download } from "lucide-react";

type EventItem = {
  id: number;
  status?: string;
  date?: string;
  start_time?: string;
  end_time?: string;
  room?: any;
  room_name?: string | null;
  course?: any;
  course_name?: string | null;
  title?: string;
  event_type?: string;
  location?: string;
  notes?: string;
  tutor_name?: string | null;
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'month'|'week'>('month');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0,0,0,0);
    return d;
  };
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));

  // Export state
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");

  // Set default export dates when opening (start/end of current month)
  useEffect(() => {
    if (exportOpen) {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setExportStart(formatDateLocal(start));
      setExportEnd(formatDateLocal(end));
    }
  }, [exportOpen]);

  const handleExport = async () => {
    if (!exportStart || !exportEnd) {
      alert("Please select start and end dates");
      return;
    }
    const token = localStorage.getItem("accessToken");
    const url = `${API_BASE}/api/calendar/export/?start=${exportStart}&end=${exportEnd}`;

    try {
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Export failed: ${res.status} ${res.statusText} - ${txt}`);
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `calendar_export_${exportStart}_${exportEnd}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setExportOpen(false);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to export calendar");
    }
  };

  const API_BASE = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || "";

  const getMonthMatrix = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() - firstOfMonth.getDay());

    const matrix: Date[][] = [];
    let cur = new Date(start);
    for (let week = 0; week < 6; week++) {
      const row: Date[] = [];
      for (let d = 0; d < 7; d++) {
        row.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
      matrix.push(row);
    }
    return matrix;
  };

  const getWeekDays = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return days;
  };

  const formatDisplayDate = (date: Date) => {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = String(date.getFullYear()).slice(-2);
    return `${d}/${m}/${y}`;
  };

  const matchesSearch = (e: EventItem) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return [e.title, e.course_name, e.tutor_name, e.event_type, e.location]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  };

  const fmtTime = (t: any) => {
    if (!t) return "";
    if (typeof t === "string") return t.length >= 5 ? t.slice(0, 5) : t;
    try { return t.toString().slice(0, 5); } catch { return String(t); }
  };

  useEffect(() => {
    let mounted = true;
    const fetchEvents = async (): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/calendar/scheduledevents/`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        console.log("Fetched events raw:", data);
        if (!mounted) return;
        // normalize to array of events
        const normalized = Array.isArray(data) ? data : (data.results || []);
        setEvents(normalized);
      } catch (err: any) {
        setError(String(err));
        console.warn("Failed to fetch /scheduledevents/, trying /events/:", err);
        // fallback: try a shorter path
        try {
          const res2 = await fetch(`${API_BASE}/api/calendar/events/`);
          if (res2.ok) {
            const d2 = await res2.json();
            console.log("Fetched events fallback:", d2);
            if (mounted) setEvents(Array.isArray(d2) ? d2 : (d2.results || []));
            setError(null);
          }
        } catch { }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchEvents();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      <LeftSidebar />

      <div className="flex-1 p-0 flex flex-col items-stretch min-h-0">

        <div className="flex gap-6 flex-1 min-h-0">
          <div className="w-2/3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (viewMode === 'month') {
                      setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1, 1));
                    } else {
                      setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() - 7); return d; });
                    }
                  }}
                >
                  <ChevronLeft />
                </Button>

                <div className="px-3 text-sm font-medium flex items-center gap-2">
                  <div>
                    {viewMode === 'month'
                      ? `${displayMonth.toLocaleString(undefined, { month: "long" })} ${displayMonth.getFullYear()}`
                      : `${formatDisplayDate(weekStart)} - ${formatDisplayDate(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6))}`
                    }
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    if (viewMode === 'month') {
                      setDisplayMonth(new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1, 1));
                    } else {
                      setWeekStart((w) => { const d = new Date(w); d.setDate(d.getDate() + 7); return d; });
                    }
                  }}>
                    <ChevronRight />
                  </Button>
                </div>

                <div className="inline-flex rounded-md bg-gray-100 p-1">
                  <button
                    onClick={() => setViewMode('month')}
                    className={`px-3 py-1 text-sm ${viewMode === 'month' ? 'bg-white rounded-md shadow' : 'text-gray-600'}`}
                  >Month</button>
                  <button
                    onClick={() => { setViewMode('week'); setWeekStart(startOfWeek(selected ?? displayMonth)); }}
                    className={`px-3 py-1 text-sm ${viewMode === 'week' ? 'bg-white rounded-md shadow' : 'text-gray-600'}`}
                  >Week</button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Dialog open={exportOpen} onOpenChange={setExportOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-2">
                      <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Export Calendar</DialogTitle>
                      <DialogDescription>
                        Select a date range to export events to CSV.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start" className="text-right">
                          Start
                        </Label>
                        <Input
                          id="start"
                          type="date"
                          value={exportStart}
                          onChange={(e) => setExportStart(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end" className="text-right">
                          End
                        </Label>
                        <Input
                          id="end"
                          type="date"
                          value={exportEnd}
                          onChange={(e) => setExportEnd(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleExport}>Download CSV</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

              <div className="bg-white p-6 rounded-2xl shadow flex-1 min-h-0 overflow-auto">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="text-sm text-gray-700">&nbsp;</div>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search events" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>

              {viewMode === 'month' && (() => {
                const weeks = getMonthMatrix(displayMonth);
                const weekdayLetters = ["S", "M", "T", "W", "T", "F", "S"];
                return (
                  <div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
                      {weekdayLetters.map((w, i) => (
                        <div key={`${w}-${i}`} className="py-1">{w}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-sm text-gray-700">
                      {weeks.flat().map((day, idx) => {
                        const isCurrentMonth = day.getMonth() === displayMonth.getMonth();
                        const dayStr = formatDateLocal(day);
                        const eventsForDay = events.filter((ev) => ev && ev.date === dayStr && ev.status !== 'rejected' && matchesSearch(ev));
                        const isSelected = selected && formatDateLocal(selected) === dayStr;
                        return (
                          <button
                            key={dayStr + "-" + idx}
                            onClick={() => setSelected(new Date(day))}
                            className={`relative p-2 h-14 flex flex-col items-start overflow-hidden ${isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"} ${isSelected ? "ring-2 ring-blue-500 rounded-md" : ""}`}
                          >
                            <div className="w-full flex items-start justify-between">
                              <div className="text-sm font-medium">{day.getDate()}</div>
                            </div>
                            {eventsForDay.length > 0 && (
                              <div className="absolute bottom-1 right-1 w-3 h-3 bg-blue-500 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {viewMode === 'week' && (() => {
                const days = getWeekDays(weekStart);
                const DAY_HEIGHT = 720; // px for 24 hours
                const hourLines = Array.from({ length: 24 }, (_, i) => i);
                const minuteToPx = (mins: number) => (mins / 1440) * DAY_HEIGHT;

                return (
                  <div className="flex gap-4">
                    <div className="w-16 text-xs text-gray-500">
                      {hourLines.map((h) => (
                        <div key={h} className="h-8 border-t border-gray-100">{String(h).padStart(2, '0')}:00</div>
                      ))}
                    </div>
                    <div className="flex-1 grid grid-cols-7 gap-2">
                      {days.map((day) => {
                        const dayStr = formatDateLocal(day);
                        const list = events.filter((e) => e.date === dayStr && e.status !== 'rejected' && matchesSearch(e));
                        return (
                          <div key={dayStr} className="relative bg-white rounded-md border border-gray-100" style={{ minHeight: DAY_HEIGHT }}>
                            <div className="absolute top-1 left-2 text-xs text-gray-500">{day.toLocaleDateString(undefined, { weekday: 'short' })} {formatDisplayDate(day)}</div>
                            <div className="relative mt-6">
                              {list.map((ev) => {
                                const startParts = (ev.start_time || '00:00').split(':').map(Number);
                                const endParts = (ev.end_time || '00:00').split(':').map(Number);
                                const startMins = (startParts[0] || 0) * 60 + (startParts[1] || 0);
                                const endMins = (endParts[0] || 0) * 60 + (endParts[1] || 0);
                                const top = minuteToPx(startMins);
                                const height = Math.max(28, minuteToPx(Math.max(1, endMins - startMins)));
                                return (
                                  <div key={ev.id} className="absolute left-2 right-2 bg-sky-500/90 text-white rounded-md p-1 text-xs shadow" style={{ top, height, overflow: 'hidden' }}>
                                    <div className="font-medium">{ev.title || ev.course_name}</div>
                                    <div className="text-[11px]">{fmtTime(ev.start_time)} - {fmtTime(ev.end_time)}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              
            </div>
          </div>

          {viewMode === 'month' && (
            <aside className="w-1/3 flex flex-col min-h-0">
              <div className="bg-white p-6 rounded-2xl shadow flex-1 overflow-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Events</h3>
                  <div className="flex items-center gap-3">
                    {loading && <div className="text-sm text-gray-500">Loading…</div>}
                    {error && <div className="text-sm text-red-500">Error fetching events</div>}
                    <div className="text-sm text-gray-500">{selected ? formatDisplayDate(selected) : ""}</div>
                  </div>
                </div>

                <div>
                  {selected ? (
                    (() => {
                      const dayStr = formatDateLocal(selected as Date);
                      const list = events.filter((e) => e.date === dayStr);
                      if (list.length === 0) return <div className="text-sm text-gray-500">No events for this date.</div>;
                      return (
                        <div className="space-y-3">
                          {list.map((e) => (
                            <div key={e.id} className="p-3 border border-gray-100 rounded-md">
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{e.title || e.course_name || `Event ${e.id}`}</div>
                                <div className="text-xs text-gray-500">{fmtTime(e.start_time)} - {fmtTime(e.end_time)}</div>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {e.course_name && <span>{e.course_name}</span>}
                                {e.room_name && <span className="ml-2">· {e.room_name}</span>}
                                {e.tutor_name && <span className="ml-2">· {e.tutor_name}</span>}
                                {e.status && <span className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100">{e.status}</span>}
                              </div>
                              <div className="text-sm text-gray-700 mt-2">{e.event_type || ''}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-sm text-gray-500">Select a date to see events.</div>
                  )}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
