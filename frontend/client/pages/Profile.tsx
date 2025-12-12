import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Bell, Mail, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState<{ username: string; email: string; role: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                navigate("/auth/login");
                return;
            }

            try {
                const response = await fetch("/users/my-profile/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    navigate("/auth/login");
                    return;
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                navigate("/auth/login");
            }
        };

        fetchUser();
    }, [navigate]);

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-6 hidden md:flex sticky top-0 h-screen">
                <div className="font-bold text-xl tracking-tight flex items-center gap-2">
                    <CalendarIcon className="w-6 h-6 text-blue-600" />
                    CalendarApp
                </div>

                <nav className="flex flex-col gap-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Schedule
                    </h3>
                    <Button variant="ghost" className="justify-start font-medium">
                        <CalendarIcon className="mr-2 h-4 w-4" /> Calendar
                    </Button>
                    <Button variant="ghost" className="justify-start font-medium">
                        <Bell className="mr-2 h-4 w-4" /> Reminders
                    </Button>
                </nav>

                {/* Mini Calendar Widget Placeholder */}
                <div className="mt-auto bg-gray-50 p-4 rounded-xl border border-gray-100">
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
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 flex items-center justify-center">
                <Card className="w-full max-w-md shadow-xl border-0 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <CardContent className="pt-0 relative px-8 pb-10">
                        <div className="mt-8 text-center space-y-4">
                            {/* Username */}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                                {/* Role */}
                                <div className="mt-2">
                                    <Badge variant="secondary" className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors uppercase">
                                        <Shield className="w-3 h-3 mr-1 inline" />
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center justify-center space-x-2 text-gray-500 bg-gray-50 py-2 px-4 rounded-full mx-auto w-max">
                                <Mail className="w-4 h-4" />
                                <span className="font-medium">{user.email}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
