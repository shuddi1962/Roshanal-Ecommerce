"use client";
import AdminShell from "@/components/admin/admin-shell";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";

import {
  Calendar, Clock, User, DollarSign,
  Check, X, ChevronLeft, ChevronRight, Filter, Plus, Eye,
  Wrench, Ship, Shield, ChefHat, Download, Printer
} from "lucide-react";

const serviceTypes = [
  { id: "cctv-install", label: "CCTV Installation", icon: Shield, color: "bg-blue/10 text-blue", duration: "2-4 hrs" },
  { id: "fire-alarm", label: "Fire Alarm Setup", icon: Shield, color: "bg-red/10 text-red", duration: "3-5 hrs" },
  { id: "marine-service", label: "Marine Service", icon: Ship, color: "bg-cyan-50 text-cyan-600", duration: "4-8 hrs" },
  { id: "kitchen-install", label: "Kitchen Installation", icon: ChefHat, color: "bg-orange-50 text-orange-600", duration: "6-12 hrs" },
  { id: "maintenance", label: "Maintenance Visit", icon: Wrench, color: "bg-purple-50 text-purple-600", duration: "1-3 hrs" },
  { id: "consultation", label: "Consultation", icon: User, color: "bg-green-50 text-green-600", duration: "1 hr" },
];

interface Booking {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  service_type: string;
  booking_date: string;
  booking_time: string;
  location: string;
  deposit_kobo: number;
  total_kobo: number;
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
}

const seedBookings: Booking[] = [
  { id: "BK-001", customer_name: "Emeka Obi", phone: "+234 801 234 5678", email: "emeka@email.com", service_type: "cctv-install", booking_date: "2026-04-10", booking_time: "09:00", location: "Victoria Island, Lagos", deposit_kobo: 5000000, total_kobo: 25000000, status: "confirmed", notes: null, created_at: "2026-04-08" },
  { id: "BK-002", customer_name: "Aisha Mohammed", phone: "+234 803 456 7890", email: "aisha@email.com", service_type: "fire-alarm", booking_date: "2026-04-11", booking_time: "10:00", location: "Lekki Phase 1, Lagos", deposit_kobo: 3000000, total_kobo: 18000000, status: "pending", notes: null, created_at: "2026-04-09" },
  { id: "BK-003", customer_name: "Chidi Nwosu", phone: "+234 805 678 9012", email: "chidi@email.com", service_type: "marine-service", booking_date: "2026-04-12", booking_time: "08:00", location: "Port Harcourt Marina", deposit_kobo: 10000000, total_kobo: 50000000, status: "in-progress", notes: null, created_at: "2026-04-10" },
  { id: "BK-004", customer_name: "Funke Adeyemi", phone: "+234 807 890 1234", email: "funke@email.com", service_type: "kitchen-install", booking_date: "2026-04-09", booking_time: "07:30", location: "Abuja, FCT", deposit_kobo: 8000000, total_kobo: 45000000, status: "completed", notes: null, created_at: "2026-04-07" },
  { id: "BK-005", customer_name: "Olumide Balogun", phone: "+234 809 012 3456", email: "olumide@email.com", service_type: "consultation", booking_date: "2026-04-13", booking_time: "14:00", location: "Ikeja, Lagos", deposit_kobo: 0, total_kobo: 2500000, status: "pending", notes: null, created_at: "2026-04-11" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue/10 text-blue",
  "in-progress": "bg-purple-50 text-purple-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red/10 text-red",
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"calendar" | "list" | "new">("list");
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3)); // April 2026
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBooking, setNewBooking] = useState({
    customer_name: "", phone: "", email: "", service_type: "", booking_date: "", booking_time: "",
    location: "", deposit_kobo: 0, total_kobo: 0, notes: ""
  });

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const { data, error } = await insforge.from("bookings").select("*").order("booking_date", { ascending: false });
      if (error || !data || data.length === 0) {
        await insforge.from("bookings").upsert(seedBookings);
        setBookings(seedBookings);
      } else {
        setBookings(data);
      }
    } catch (e) {
      setBookings(seedBookings);
    }
    setLoading(false);
  }

  async function updateBookingStatus(id: string, status: Booking["status"]) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    await insforge.from("bookings").update({ status }).eq("id", id);
  }

  async function createBooking() {
    const id = `BK-${Date.now()}`;
    const booking: Booking = {
      id,
      ...newBooking,
      status: "pending",
      created_at: new Date().toISOString().split("T")[0]
    };
    await insforge.from("bookings").insert(booking);
    setBookings(prev => [booking, ...prev]);
    setNewBooking({
      customer_name: "", phone: "", email: "", service_type: "", booking_date: "", booking_time: "",
      location: "", deposit_kobo: 0, total_kobo: 0, notes: ""
    });
    setActiveTab("list");
  }

  function exportBookings() {
    const csv = [
      ["ID", "Customer", "Phone", "Service", "Date", "Time", "Location", "Deposit", "Total", "Status"].join(","),
      ...bookings.map(b => [
        b.id, `"${b.customer_name}"`, b.phone, b.service_type, b.booking_date, b.booking_time,
        `"${b.location}"`, b.deposit_kobo / 100, b.total_kobo / 100, b.status
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

   const getBookingsForDate = (day: number) => {
     const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
     return bookings.filter((b) => b.booking_date === dateStr);
   };

   const filteredBookings = filterStatus === "all"
     ? bookings
     : bookings.filter((b) => b.status === filterStatus);

   const stats = {
     total: bookings.length,
     pending: bookings.filter((b) => b.status === "pending").length,
     confirmed: bookings.filter((b) => b.status === "confirmed").length,
     revenue: bookings.filter((b) => b.status !== "cancelled").reduce((sum, b) => sum + (b.total_kobo / 100), 0),
   };

  return (
    <AdminShell title="Bookings" subtitle="Service booking calendar & management">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total Bookings", value: stats.total, icon: Calendar, color: "text-blue" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600" },
          { label: "Confirmed", value: stats.confirmed, icon: Check, color: "text-green-600" },
          { label: "Revenue", value: `₦${(stats.revenue / 1000).toFixed(0)}K`, icon: DollarSign, color: "text-purple-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-text-4 uppercase tracking-wider font-semibold">{stat.label}</p>
                <p className="text-xl font-bold text-text-1 mt-1">{stat.value}</p>
              </div>
              <stat.icon size={20} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

       <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
         <div className="flex gap-1 bg-white rounded-xl p-1 w-fit border border-gray-200">
        {[
          { id: "list" as const, label: "Bookings", icon: Filter },
          { id: "calendar" as const, label: "Calendar", icon: Calendar },
          { id: "new" as const, label: "New Booking", icon: Plus },
        ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
               activeTab === tab.id ? "bg-blue text-white" : "text-text-3 hover:bg-gray-50"
             }`}
           >
             <tab.icon size={16} />
             {tab.label}
           </button>
         ))}
         </div>
         <div className="flex items-center gap-2">
           <button onClick={exportBookings} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
             <Download size={14} /> Export
           </button>
         </div>
       </div>

      {activeTab === "calendar" && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 hover:bg-gray-50 rounded-lg">
              <ChevronLeft size={18} />
            </button>
            <h3 className="font-bold text-text-1">{months[month]} {year}</h3>
            <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 hover:bg-gray-50 rounded-lg">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => (
              <div key={d} className="text-center text-[10px] text-text-4 font-semibold py-2">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} />;
              const bookings = getBookingsForDate(day);
              const isToday = day === 8 && month === 3 && year === 2026;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`)}
                  className={`min-h-[72px] p-1.5 rounded-lg border text-left transition-colors ${
                    isToday ? "border-blue bg-blue/5" : "border-gray-100 hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-xs font-medium ${isToday ? "text-blue" : "text-text-2"}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                     {bookings.slice(0, 2).map((b) => {
                       const svc = serviceTypes.find((s) => s.id === b.service_type);
                       return (
                         <div key={b.id} className={`text-[8px] px-1 py-0.5 rounded ${svc?.color || "bg-gray-100 text-gray-600"} truncate`}>
                           {b.booking_time} {b.customer_name.split(" ")[0]}
                         </div>
                       );
                     })}
                    {bookings.length > 2 && (
                      <span className="text-[8px] text-text-4">+{bookings.length - 2} more</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "list" && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-text-1">All Bookings</h3>
            <div className="flex gap-1.5">
              {["all", "pending", "confirmed", "in-progress", "completed"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    filterStatus === s ? "bg-blue text-white" : "bg-gray-50 text-text-3 hover:bg-gray-100"
                  }`}
                >
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 text-text-4 font-medium">Booking</th>
                  <th className="text-left p-3 text-text-4 font-medium">Customer</th>
                  <th className="text-left p-3 text-text-4 font-medium">Service</th>
                  <th className="text-left p-3 text-text-4 font-medium">Date & Time</th>
                  <th className="text-left p-3 text-text-4 font-medium">Location</th>
                  <th className="text-left p-3 text-text-4 font-medium">Deposit</th>
                  <th className="text-left p-3 text-text-4 font-medium">Total</th>
                  <th className="text-left p-3 text-text-4 font-medium">Status</th>
                  <th className="text-left p-3 text-text-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                 {filteredBookings.map((booking) => {
                   const svc = serviceTypes.find((s) => s.id === booking.service_type);
                   return (
                     <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                       <td className="p-3 font-mono text-xs font-semibold text-blue">{booking.id}</td>
                       <td className="p-3">
                         <p className="font-medium text-text-1 text-xs">{booking.customer_name}</p>
                         <p className="text-[10px] text-text-4">{booking.phone}</p>
                       </td>
                       <td className="p-3">
                         <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${svc?.color}`}>
                           {svc?.label}
                         </span>
                       </td>
                       <td className="p-3 text-xs text-text-2">
                         <div>{booking.booking_date}</div>
                         <div className="text-text-4">{booking.booking_time}</div>
                       </td>
                       <td className="p-3 text-xs text-text-3">{booking.location}</td>
                       <td className="p-3 text-xs">₦{(booking.deposit_kobo / 100).toLocaleString()}</td>
                       <td className="p-3 text-xs font-semibold">₦{(booking.total_kobo / 100).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColors[booking.status]}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="View">
                            <Eye size={14} className="text-text-4" />
                          </button>
                           {booking.status === "pending" && (
                             <>
                               <button onClick={() => updateBookingStatus(booking.id, "confirmed")} className="p-1.5 hover:bg-green-50 rounded-lg" title="Confirm">
                                 <Check size={14} className="text-green-600" />
                               </button>
                               <button onClick={() => updateBookingStatus(booking.id, "cancelled")} className="p-1.5 hover:bg-red/10 rounded-lg" title="Cancel">
                                 <X size={14} className="text-red" />
                               </button>
                             </>
                           )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

       {activeTab === "new" && (
         <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
           <h3 className="font-bold text-text-1 mb-4">Create New Booking</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-text-3 font-medium mb-1 block">Customer Name</label>
               <input type="text" placeholder="Full name" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
               value={newBooking.customer_name} onChange={e => setNewBooking({ ...newBooking, customer_name: e.target.value })} />
             </div>
             <div>
               <label className="text-xs text-text-3 font-medium mb-1 block">Phone Number</label>
               <input type="tel" placeholder="+234..." className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
               value={newBooking.phone} onChange={e => setNewBooking({ ...newBooking, phone: e.target.value })} />
             </div>
             <div>
               <label className="text-xs text-text-3 font-medium mb-1 block">Email</label>
               <input type="email" placeholder="email@example.com" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
               value={newBooking.email} onChange={e => setNewBooking({ ...newBooking, email: e.target.value })} />
             </div>
             <div>
               <label className="text-xs text-text-3 font-medium mb-1 block">Service Type</label>
               <select className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue bg-white"
               value={newBooking.service_type} onChange={e => setNewBooking({ ...newBooking, service_type: e.target.value })}>
                 <option value="">Select service...</option>
                 {serviceTypes.map((s) => (
                   <option key={s.id} value={s.id}>{s.label} ({s.duration})</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="text-xs text-text-3 font-medium mb-1 block">Date</label>
               <input type="date" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
               value={newBooking.booking_date} onChange={e => setNewBooking({ ...newBooking, booking_date: e.target.value })} />
             </div>
             <div>
               <label className="text-xs text-text-3 font-medium mb-1 block">Time</label>
               <input type="time" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
               value={newBooking.booking_time} onChange={e => setNewBooking({ ...newBooking, booking_time: e.target.value })} />
             </div>
             <div className="md:col-span-2">
               <label className="text-xs text-text-3 font-medium mb-1 block">Location / Address</label>
               <input type="text" placeholder="Service location address" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
               value={newBooking.location} onChange={e => setNewBooking({ ...newBooking, location: e.target.value })} />
             </div>
             <div>
               <label className="text-xs text-text-3 font-medium mb-1 block">Deposit Amount (₦)</label>
               <input type="number" placeholder="0" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
               value={newBooking.deposit_kobo / 100} onChange={e => setNewBooking({ ...newBooking, deposit_kobo: +e.target.value * 100 })} />
             </div>
             <div>
               <label className="text-xs text-text-3 font-medium mb-1 block">Total Quote (₦)</label>
               <input type="number" placeholder="0" className="w-full h-10 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue"
               value={newBooking.total_kobo / 100} onChange={e => setNewBooking({ ...newBooking, total_kobo: +e.target.value * 100 })} />
             </div>
             <div className="md:col-span-2">
               <label className="text-xs text-text-3 font-medium mb-1 block">Notes</label>
               <textarea rows={3} placeholder="Additional notes..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue resize-none"
               value={newBooking.notes} onChange={e => setNewBooking({ ...newBooking, notes: e.target.value })} />
             </div>
           </div>
           <div className="flex gap-3 mt-6">
             <button onClick={createBooking} className="h-10 px-6 rounded-lg bg-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
               Create Booking
             </button>
             <button onClick={() => setActiveTab("list")} className="h-10 px-6 rounded-lg border border-gray-200 text-sm font-medium text-text-3 hover:bg-gray-50 transition-colors">
               Cancel
             </button>
           </div>
         </div>
       )}
    </AdminShell>
  );
}
