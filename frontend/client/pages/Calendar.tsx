import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
// Assuming you have formatDateLocal in @/lib/utils
import { formatDateLocal } from "@/lib/utils"; 
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, CalendarIcon, Plus, Clock, MapPin, Users, BookOpen, Clock4, CalendarDays, BarChart4 } from "lucide-react";

// Define the expected structure for an Event
interface Event {
    id: number;
    title: string;
    date: string;
    startHour: string;
    endHour: string;
    location: string;
    course: string;
    tutor: string;
    notes?: string;
    status: 'pending' | 'approved' | 'rejected';
}

type ViewMode = 'day' | 'week' | 'month' | 'year';

// Helper to get status colors and styles
const getStatusClasses = (status: Event['status']) => {
    switch (status) {
        case 'approved':
            return {
                badge: "bg-green-500 hover:bg-green-600",
                dot: "bg-green-500",
                text: "text-green-700",
            };
        case 'pending':
            return {
                badge: "bg-yellow-500 hover:bg-yellow-600",
                dot: "bg-yellow-500",
                text: "text-yellow-700",
            };
        case 'rejected':
            return {
                badge: "bg-red-500 hover:bg-red-600",
                dot: "bg-red-500",
                text: "text-red-700",
            };
        default:
            return {
                badge: "bg-gray-500 hover:bg-gray-600",
                dot: "bg-gray-500",
                text: "text-gray-700",
            };
    }
};

// --- Calendar Logic Functions ---

/**
 * Generates a 6x7 matrix of Date objects for a given month's view.
 * This is used for both the main month view and the mini-calendars in year view.
 */
const getMonthMatrix = (date: Date): Date[][] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    
    // Start on the Sunday before the 1st of the month
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

// --- Event Dialog Component (Unchanged) ---
interface DayEventsDialogProps {
    date: Date | null;
    events: Event[];
    onClose: () => void;
    onCreate: () => void;
}

const DayEventsDialog: React.FC<DayEventsDialogProps> = ({ date, events, onClose, onCreate }) => {
    if (!date) return null;

    const dayStr = formatDateLocal(date);
    const dayEvents = events.filter((e) => e.date === dayStr);

    return (
        <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-6">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        Events on {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} found.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end pt-2">
                    <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event for this Day
                    </Button>
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto space-y-4 pt-4">
                    {dayEvents.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 border border-dashed rounded-lg bg-gray-50">
                            No events scheduled for this date.
                        </div>
                    ) : (
                        dayEvents.map((e) => {
                            const status = getStatusClasses(e.status);
                            return (
                                <div key={e.id} className="p-4 rounded-lg border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-lg text-gray-800 mb-1">{e.title || "Untitled Event"}</div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                                <span>{e.startHour} - {e.endHour}</span>
                                                <Badge className={`ml-4 text-xs font-semibold ${status.badge}`}>
                                                    {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                                                </Badge>
                                            </div>
                                            <div className="mt-2 text-sm text-gray-700 space-y-1">
                                                <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-500" /> {e.location}</div>
                                                <div className="flex items-center"><BookOpen className="w-4 h-4 mr-2 text-gray-500" /> Course: {e.course}</div>
                                                <div className="flex items-center"><Users className="w-4 h-4 mr-2 text-gray-500" /> Tutor: {e.tutor}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

// --- View Component Helpers ---

// Placeholder for Day View
const DayView: React.FC = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-[50px_minmax(0,1fr)] min-w-[600px] border-t border-gray-200">
                {hours.map((hour, index) => (
                    <React.Fragment key={hour}>
                        {/* Time Label */}
                        <div className="h-16 text-right pr-2 text-xs text-gray-500 border-r border-gray-200 pt-1">
                            {index > 0 && hour}
                        </div>
                        {/* Event Space */}
                        <div className={`h-16 border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            {/* Placeholder for events */}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// Placeholder for Week View
const WeekView: React.FC<{ currentDate: Date }> = ({ currentDate }) => {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); 

    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
    });
    
    const todayStr = formatDateLocal(new Date());

    return (
        <div className="overflow-x-auto">
            <div className="grid grid-cols-[50px_repeat(7,minmax(0,1fr))] min-w-[900px]">
                {/* Weekday Headers */}
                <div className="col-span-1 border-r border-b border-gray-200 p-2 text-center text-sm font-semibold text-gray-800">Time</div>
                {days.map((day, index) => {
                    const isToday = formatDateLocal(day) === todayStr;
                    return (
                        <div 
                            key={index} 
                            className={`border-r border-b border-gray-200 p-2 text-center text-sm ${isToday ? 'bg-blue-50 border-blue-400' : 'bg-white'}`}
                        >
                            <div className="font-semibold">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                            <div className={`text-xl font-bold ${isToday ? 'text-blue-700' : 'text-gray-800'}`}>{day.getDate()}</div>
                        </div>
                    );
                })}
            </div>
            
            {/* Hour Grid */}
            <div className="grid grid-cols-[50px_repeat(7,minmax(0,1fr))] min-w-[900px] border-r border-gray-200">
                {hours.map((hour, hourIndex) => (
                    <React.Fragment key={hour}>
                        {/* Time Label */}
                        <div className={`h-16 text-right pr-2 text-xs text-gray-500 border-r border-b border-gray-200 pt-1 ${hourIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                            {hourIndex > 0 && hour}
                        </div>
                        {/* 7 Day Columns */}
                        {days.map((_, dayIndex) => (
                            <div 
                                key={dayIndex} 
                                className={`h-16 border-b border-gray-200 border-r ${dayIndex === 6 ? 'border-r-0' : ''} ${hourIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                            >
                                {/* Event Placeholder */}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

// Helper component for YearView: Renders a single month mini-calendar
const MiniMonthCalendar: React.FC<{ monthDate: Date, eventsByDate: Record<string, { approved: number, pending: number, rejected: number }> }> = ({ monthDate, eventsByDate }) => {
    const matrix = getMonthMatrix(monthDate);
    const currentMonth = monthDate.getMonth();
    const todayStr = formatDateLocal(new Date());

    return (
        <div className="p-2 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
            <h4 className="text-sm font-semibold text-center mb-2 text-gray-800">
                {monthDate.toLocaleDateString('en-US', { month: 'long' })}
            </h4>
            {/* Weekday Labels (Tiny) */}
            <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day}>{day}</div>
                ))}
            </div>

            {/* Calendar Grid (Mini) */}
            <div className="grid grid-cols-7 gap-px">
                {matrix.flat().map((date, index) => {
                    const dateStr = formatDateLocal(date);
                    const eventsOnDay = eventsByDate[dateStr];
                    const isCurrentMonth = date.getMonth() === currentMonth;
                    const isToday = dateStr === todayStr;
                    const hasEvents = !!eventsOnDay && (eventsOnDay.approved > 0 || eventsOnDay.pending > 0);

                    return (
                        <div 
                            key={index}
                            className={`h-6 w-6 text-center text-xs flex items-center justify-center 
                                ${isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
                                ${isToday ? 'bg-blue-500 text-white rounded-full' : ''}
                                ${hasEvents && !isToday ? 'font-bold text-blue-600' : ''}
                            `}
                            // NOTE: Day clicking for details is intentionally disabled in the mini-view
                        >
                            {date.getDate()}
                            {hasEvents && !isToday && <span className="absolute w-1 h-1 rounded-full bg-blue-500 mt-5"/>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Year View Component
const YearView: React.FC<{ currentDate: Date, eventsByDate: Record<string, { approved: number, pending: number, rejected: number }> }> = ({ currentDate, eventsByDate }) => {
    const year = currentDate.getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {months.map((monthDate) => (
                <MiniMonthCalendar 
                    key={monthDate.getMonth()}
                    monthDate={monthDate} 
                    eventsByDate={eventsByDate} 
                />
            ))}
        </div>
    );
};


// --- Main CalendarPage Component ---
export default function CalendarPage() {
    const navigate = useNavigate();
    // Using displayDate instead of displayMonth for easier Day/Week navigation
    const [displayDate, setDisplayDate] = useState<Date>(new Date());
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('month'); // Default to month view

    // Load events from localStorage
    const loadEvents = () => {
        const raw = localStorage.getItem("events");
        const arr: Event[] = raw ? JSON.parse(raw) : [];
        setEvents(arr);
    };

    useEffect(() => {
        loadEvents();
        const handler = () => loadEvents();
        window.addEventListener("events:changed", handler);
        return () => window.removeEventListener("events:changed", handler);
    }, []);

    // Memoize event mapping for fast lookup
    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            if (event.status === 'approved' || event.status === 'pending') {
                const dateKey = event.date; 
                if (!acc[dateKey]) {
                    acc[dateKey] = { approved: 0, pending: 0, rejected: 0 };
                }
                acc[dateKey][event.status]++;
            }
            return acc;
        }, {} as Record<string, { approved: number, pending: number, rejected: number }>);
    }, [events]);

    const matrix = useMemo(() => getMonthMatrix(displayDate), [displayDate]);

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
    };

    const handleCreateEvent = () => {
        setSelectedDate(null);
        navigate('/create');
    };

    const navigatePeriod = (offset: number) => {
        setDisplayDate((prev) => {
            const newDate = new Date(prev);
            if (viewMode === 'day') {
                newDate.setDate(prev.getDate() + offset);
            } else if (viewMode === 'week') {
                newDate.setDate(prev.getDate() + offset * 7);
            } else if (viewMode === 'month') {
                newDate.setMonth(prev.getMonth() + offset);
            } else if (viewMode === 'year') {
                // Navigate by a full year
                newDate.setFullYear(prev.getFullYear() + offset);
            }
            return newDate;
        });
    };

    const getNavigationTitle = () => {
        const date = displayDate;
        switch(viewMode) {
            case 'day':
                return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            case 'week':
                // Calculate the start and end of the current week based on displayDate
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);

                const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' });
                const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
                const startDay = startOfWeek.getDate();
                const endDay = endOfWeek.getDate();
                const year = date.getFullYear();

                return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;

            case 'month':
                return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            case 'year':
                return date.getFullYear().toString();
            default:
                return '';
        }
    };

    const currentMonth = displayDate.getMonth();
    const today = new Date();
    const todayStr = formatDateLocal(today);

    return (
        <div className="w-full self-start flex flex-col h-full min-h-screen bg-gray-50 p-6">
            <Card className="flex-1 shadow-2xl border-t-4 border-blue-500 rounded-xl max-w-full w-full mx-auto">
                <CardHeader className="p-4 sm:p-6 border-b">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                            <CalendarIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-500" />
                            Academic Calendar
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <Button onClick={() => navigate('/create')} className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Event
                            </Button>
                        </div>
                    </div>

                    {/* View Switcher and Navigation */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4 gap-4">
                        
                        {/* 1. View Tabs */}
                        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
                            <TabsList className="grid grid-cols-4 h-9 bg-gray-100">
                                <TabsTrigger value="day" className="text-sm px-3 py-1 flex items-center gap-1">
                                    <Clock4 className="w-4 h-4 hidden sm:block" /> Day
                                </TabsTrigger>
                                <TabsTrigger value="week" className="text-sm px-3 py-1 flex items-center gap-1">
                                    <CalendarDays className="w-4 h-4 hidden sm:block" /> Week
                                </TabsTrigger>
                                <TabsTrigger value="month" className="text-sm px-3 py-1 flex items-center gap-1">
                                    <CalendarIcon className="w-4 h-4 hidden sm:block" /> Month
                                </TabsTrigger>
                                <TabsTrigger value="year" className="text-sm px-3 py-1 flex items-center gap-1">
                                    <BarChart4 className="w-4 h-4 hidden sm:block" /> Year
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {/* 2. Navigation Controls */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" onClick={() => navigatePeriod(-1)} aria-label="Previous Period">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <h3 className="text-lg font-semibold text-gray-800 w-auto text-center px-4 min-w-[150px]">
                                {getNavigationTitle()}
                            </h3>
                            <Button variant="outline" size="icon" onClick={() => navigatePeriod(1)} aria-label="Next Period">
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setDisplayDate(new Date())}>Today</Button>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="p-2 sm:p-6 min-h-[600px] overflow-auto">
                    {/* --- View Content Selector --- */}

                    {/* Month View (The main functional view) */}
                    {viewMode === 'month' && (
                        <>
                            {/* Weekday Labels */}
                            <div className="grid grid-cols-7 text-center font-medium text-gray-600 border-b border-gray-200 pb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-sm">{day}</div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-px pt-2 border-l border-gray-200">
                                {matrix.flat().map((date, index) => {
                                    const dateStr = formatDateLocal(date);
                                    const eventsOnDay = eventsByDate[dateStr];
                                    const isCurrentMonth = date.getMonth() === currentMonth;
                                    const isToday = dateStr === todayStr;
                                    const hasEvents = !!eventsOnDay;

                                    return (
                                        <div 
                                            key={index}
                                            className={`
                                                h-20 sm:h-28 border-r border-b border-gray-200 p-1 sm:p-2 text-right cursor-pointer 
                                                transition-all duration-200 ease-in-out overflow-hidden
                                                ${isCurrentMonth ? 'bg-white hover:bg-blue-50' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}
                                            `}
                                            onClick={() => handleDayClick(date)}
                                        >
                                            <span 
                                                className={`
                                                    inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 text-sm sm:text-lg font-semibold rounded-full
                                                    ${isToday ? 'bg-blue-500 text-white' : ''}
                                                    ${!isCurrentMonth && !isToday ? 'text-gray-400' : ''}
                                                `}
                                            >
                                                {date.getDate()}
                                            </span>
                                            
                                            {/* Event Labels / Dots */}
                                            {hasEvents && (
                                                <div className="flex justify-end gap-1 mt-1">
                                                    {eventsOnDay.approved > 0 && (
                                                        <span 
                                                            title={`${eventsOnDay.approved} Approved Event${eventsOnDay.approved > 1 ? 's' : ''}`}
                                                            className="w-2 h-2 rounded-full bg-green-500"
                                                        />
                                                    )}
                                                    {eventsOnDay.pending > 0 && (
                                                        <span 
                                                            title={`${eventsOnDay.pending} Pending Event${eventsOnDay.pending > 1 ? 's' : ''}`}
                                                            className="w-2 h-2 rounded-full bg-yellow-500"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                    
                    {/* Day View Structure */}
                    {viewMode === 'day' && <DayView />}
                    
                    {/* Week View Structure */}
                    {viewMode === 'week' && <WeekView currentDate={displayDate} />}

                    {/* Year View Structure - NEW */}
                    {viewMode === 'year' && <YearView currentDate={displayDate} eventsByDate={eventsByDate} />}

                </CardContent>
            </Card>

            {/* Event Details Dialog (Pop-up) */}
            <DayEventsDialog 
                date={selectedDate} 
                events={events} 
                onClose={() => setSelectedDate(null)} 
                onCreate={handleCreateEvent}
            />
        </div>
    );
}