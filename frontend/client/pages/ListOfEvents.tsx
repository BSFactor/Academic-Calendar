import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Edit3, ArrowRight, Calendar, AlertTriangle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from "sonner";

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
    createdBy?: string;
}

// Helper to get status colors
const getStatusBadge = (status: Event['status']) => {
    switch (status) {
        case 'approved':
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        case 'rejected':
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-100"><AlertTriangle className="w-3 h-3 mr-1" /> Rejected</Badge>;
        default:
            return <Badge variant="secondary">Unknown</Badge>;
    }
};

// --- Component to render the list of events for each tab ---
interface EventTableProps {
    events: Event[];
    navigate: (path: string) => void;
    handleDelete: (id: number, type: 'events' | 'movedEvents') => void;
    listType: 'Approved' | 'Pending' | 'Moved';
    listKey: 'events' | 'movedEvents';
}

const EventTable: React.FC<EventTableProps> = ({ events, navigate, handleDelete, listType, listKey }) => {
    if (events.length === 0) {
        return <div className="p-6 text-center text-gray-500">No {listType.toLowerCase()} events found.</div>;
    }

    // Sort by date (oldest first)
    const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="space-y-4">
            {sortedEvents.map((e) => (
                <div 
                    key={e.id} 
                    className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 transition-shadow hover:shadow-md"
                >
                    <div className="flex items-center justify-between">
                        {/* Event Details */}
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center space-x-3 mb-1">
                                <span className="font-semibold text-lg text-gray-800 truncate">{e.title || "Untitled Event"}</span>
                                {listType !== 'Approved' && getStatusBadge(e.status)}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>{e.date} · {e.startHour} - {e.endHour}</span>
                                <MapPin className="w-4 h-4 text-blue-500 ml-4" />
                                <span>{e.location}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 items-center">
                            {/* Edit Button */}
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-blue-600 border-blue-200 hover:bg-blue-50" 
                                onClick={() => navigate(`/edit/${e.id}`)}
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </Button>

                            {/* Delete Button */}
                            <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => handleDelete(e.id, listKey)} 
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

// --- Main ListOfEvents Component ---
export default function ListOfEvents() {
    const navigate = useNavigate();
    const [events, setEvents] = useState<Event[]>([]);
    const [moved, setMoved] = useState<Event[]>([]);

    // Function to load data from localStorage
    const loadEvents = () => {
        const raw = localStorage.getItem("events");
        setEvents(raw ? JSON.parse(raw) : []);
        
        const rawMoved = localStorage.getItem("movedEvents");
        setMoved(rawMoved ? JSON.parse(rawMoved) : []);
    };

    useEffect(() => {
        loadEvents();
        // Setup listener for updates from other pages (like CreateEvents)
        const handler = () => loadEvents();
        window.addEventListener("events:changed", handler);
        return () => window.removeEventListener("events:changed", handler);
    }, []);

    const approved = events.filter((e) => e.status === "approved" || e.status === 'rejected');
    const pending = events.filter((e) => e.status === undefined || e.status === "pending");

    // Unified Delete Handler
    const handleDelete = (id: number, type: 'events' | 'movedEvents') => {
        const key = type === 'events' ? 'events' : 'movedEvents';
        const currentList = type === 'events' ? events : moved;
        
        const newList = currentList.filter((e) => e.id !== id);
        
        localStorage.setItem(key, JSON.stringify(newList));
        
        // Update state and notify
        if (type === 'events') {
            setEvents(newList);
        } else {
            setMoved(newList);
        }
        
        try { window.dispatchEvent(new Event("events:changed")); } catch (err) { /* ignore */ }
        toast.success("Event successfully deleted.", { description: "The event has been permanently removed from your list." });
    };

    // Handler to move approved/rejected events to the 'moved' list
    const moveAllApprovedToMoved = () => {
        if (approved.length === 0) {
            toast.info("No approved or rejected events to move.");
            return;
        }

        const newMovedList = [...moved, ...approved];
        localStorage.setItem("movedEvents", JSON.stringify(newMovedList));
        
        const remainingEvents = events.filter(e => e.status !== "approved" && e.status !== "rejected");
        localStorage.setItem("events", JSON.stringify(remainingEvents));
        
        loadEvents(); // Reload all data
        toast.success(`Successfully moved ${approved.length} events to Archive.`);
    };

    return (
        <div className="w-full self-start flex flex-col h-full min-h-screen bg-gray-50 p-6">
            <Card className="w-full mx-auto shadow-2xl border-t-4 border-blue-500 rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-3xl font-bold text-gray-800">My Event List</CardTitle>
                    <div className="flex gap-3">
                        <Button 
                            variant="secondary" 
                            onClick={moveAllApprovedToMoved}
                            className="text-sm text-gray-600 hover:bg-gray-200"
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Archive Approved ({approved.length})
                        </Button>
                        <Button onClick={() => navigate('/create')} className="bg-blue-600 hover:bg-blue-700">
                            + Create New Event
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-4">
                    <Tabs defaultValue="pending">
                        <TabsList className="grid w-full grid-cols-3 h-11 bg-gray-100 mb-4">
                            <TabsTrigger value="pending" className="text-md font-medium">
                                <Clock className="w-4 h-4 mr-2" />
                                Pending ({pending.length})
                            </TabsTrigger>
                            <TabsTrigger value="approved" className="text-md font-medium">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approved/Rejected ({approved.length})
                            </TabsTrigger>
                            <TabsTrigger value="moved" className="text-md font-medium">
                                <Calendar className="w-4 h-4 mr-2" />
                                Archive ({moved.length})
                            </TabsTrigger>
                        </TabsList>

                        {/* Pending Tab Content */}
                        <TabsContent value="pending" className="mt-4">
                            <EventTable 
                                events={pending} 
                                navigate={navigate} 
                                handleDelete={handleDelete} 
                                listType="Pending" 
                                listKey="events"
                            />
                        </TabsContent>

                        {/* Approved/Rejected Tab Content */}
                        <TabsContent value="approved" className="mt-4">
                            <EventTable 
                                events={approved} 
                                navigate={navigate} 
                                handleDelete={handleDelete} 
                                listType="Approved" 
                                listKey="events"
                            />
                        </TabsContent>

                        {/* Moved/Archived Tab Content */}
                        <TabsContent value="moved" className="mt-4">
                            <EventTable 
                                events={moved} 
                                navigate={navigate} 
                                handleDelete={handleDelete} 
                                listType="Moved" 
                                listKey="movedEvents"
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}