// frontend/client/pages/EditEvents.tsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// NOTE: Assuming your alias configuration works for these components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Define the Event structure (Should be consistent across files)
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
    status: 'pending' | 'approved' | 'rejected' | undefined;
    createdBy?: string;
}

// Function to fetch all events from localStorage (Placeholder for API call)
const fetchEventsFromStorage = (): Event[] => {
    const raw = localStorage.getItem("events");
    return raw ? JSON.parse(raw) : [];
};

export default function EditEvent() {
    // 1. Get the 'id' parameter from the URL
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    // 2. State to hold the event data we are currently editing
    const [eventData, setEventData] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            // Handle case where ID is missing (shouldn't happen with correct routing)
            navigate('/list'); 
            return;
        }

        // 3. Load all events and find the specific one by ID
        const allEvents = fetchEventsFromStorage();
        // NOTE: parseInt is needed because URL params are strings
        const eventToEdit = allEvents.find(e => e.id === parseInt(id));

        if (eventToEdit) {
            setEventData(eventToEdit);
        } else {
            // Event not found, redirect to list
            navigate('/list');
        }
        setLoading(false);
    }, [id, navigate]);

    // Handler for form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!eventData) return;

        // Logic to save the updated event data
        let allEvents = fetchEventsFromStorage();
        allEvents = allEvents.map(e => 
            e.id === eventData.id ? eventData : e
        );
        localStorage.setItem('events', JSON.stringify(allEvents));

        // Trigger event change (optional, for other components listening)
        try { window.dispatchEvent(new Event("events:changed")); } catch (err) { /* ignore */ }

        alert('Event updated successfully!'); // Simple confirmation
        navigate('/list');
    };

    // Handler for input changes (update local state)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventData(prev => prev ? { ...prev, [name]: value } : null);
    };

    if (loading) {
        return <div className="p-6">Loading event details...</div>;
    }
    
    // If eventData is null at this point, it means the event wasn't found (handled in useEffect)
    if (!eventData) return null;


    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Event: {eventData.title}</CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        
                        <div>
                            <Label htmlFor="title">Event Title</Label>
                            <Input 
                                id="title" 
                                name="title" 
                                value={eventData.title} 
                                onChange={handleChange} 
                                required 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input 
                                    id="date" 
                                    name="date" 
                                    type="date" 
                                    value={eventData.date} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                            <div>
                                <Label htmlFor="location">Location</Label>
                                <Input 
                                    id="location" 
                                    name="location" 
                                    value={eventData.location} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>
                        </div>

                        {/* Add more fields for startHour, endHour, course, tutor, etc. */}
                        {/* Example for notes: */}
                        <div>
                            <Label htmlFor="notes">Notes</Label>
                            <textarea 
                                id="notes" 
                                name="notes" 
                                value={eventData.notes || ''} 
                                onChange={handleChange} 
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                            />
                        </div>
                        
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => navigate('/list')}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            Save Changes
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}