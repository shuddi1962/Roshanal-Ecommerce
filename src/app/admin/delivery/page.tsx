"use client";
import AdminShell from "@/components/admin/admin-shell";

import { useState, useEffect } from "react";
import { insforge } from "@/lib/insforge";

import {
  Truck, MapPin, Star, CheckCircle2,
  Eye, Plus, AlertTriangle, Users,
  Download, Printer, Edit, Trash2
} from "lucide-react";

interface Rider {
  id: number;
  name: string;
  phone: string;
  zone: string;
  status: "available" | "on_delivery" | "offline";
  deliveries: number;
  rating: number;
  vehicle: string;
  current_order: string | null;
  is_active: boolean;
  created_at: string;
}

interface Delivery {
  id: string;
  order_id: string;
  customer_name: string;
  address: string;
  rider_id: number | null;
  rider_name: string | null;
  status: "pending" | "assigned" | "in_transit" | "delivered" | "cancelled";
  eta: string;
  created_at: string;
}

interface DeliveryZone {
  id: number;
  name: string;
  delivery_fee_kobo: number;
  rider_count: number;
  total_deliveries: number;
  is_active: boolean;
}

const seedRiders: Rider[] = [
  { id: 1, name: "Adamu Suleiman", phone: "+234 801 111 2222", zone: "Port Harcourt", status: "available", deliveries: 342, rating: 4.8, vehicle: "Motorcycle", current_order: null, is_active: true, created_at: "2024-03-01" },
  { id: 2, name: "Kunle Ajayi", phone: "+234 802 222 3333", zone: "Lagos Mainland", status: "on_delivery", deliveries: 289, rating: 4.6, vehicle: "Van", current_order: "ORD-1234", is_active: true, created_at: "2024-03-02" },
  { id: 3, name: "Musa Abdullahi", phone: "+234 803 333 4444", zone: "Lagos Island", status: "available", deliveries: 198, rating: 4.9, vehicle: "Motorcycle", current_order: null, is_active: true, created_at: "2024-03-05" },
  { id: 4, name: "Chika Obi", phone: "+234 804 444 5555", zone: "Abuja", status: "on_delivery", deliveries: 156, rating: 4.4, vehicle: "Van", current_order: "ORD-1235", is_active: true, created_at: "2024-03-10" },
  { id: 5, name: "Yusuf Hassan", phone: "+234 805 555 6666", zone: "Warri", status: "offline", deliveries: 87, rating: 4.2, vehicle: "Motorcycle", current_order: null, is_active: true, created_at: "2024-03-12" },
  { id: 6, name: "Emeka Igwe", phone: "+234 806 666 7777", zone: "Port Harcourt", status: "available", deliveries: 445, rating: 4.7, vehicle: "Truck", current_order: null, is_active: true, created_at: "2024-03-15" },
];

const seedDeliveries: Delivery[] = [
  { id: "DEL-001", order_id: "ORD-1234", customer_name: "Chidi Okafor", address: "12 Aba Rd, Port Harcourt", rider_id: 2, rider_name: "Kunle Ajayi", status: "in_transit", eta: "30 mins", created_at: "2024-03-15" },
  { id: "DEL-002", order_id: "ORD-1235", customer_name: "Amina Bello", address: "45 Lekki Phase 1, Lagos", rider_id: 4, rider_name: "Chika Obi", status: "in_transit", eta: "45 mins", created_at: "2024-03-15" },
  { id: "DEL-003", order_id: "ORD-1236", customer_name: "Tunde Ade", address: "Plot 8 Wuse 2, Abuja", rider_id: null, rider_name: null, status: "pending", eta: "-", created_at: "2024-03-15" },
  { id: "DEL-004", order_id: "ORD-1237", customer_name: "Grace Eze", address: "7 Stadium Rd, PH", rider_id: 1, rider_name: "Adamu Suleiman", status: "delivered", eta: "Delivered", created_at: "2024-03-14" },
];

const seedZones: DeliveryZone[] = [
  { id: 1, name: "Port Harcourt", delivery_fee_kobo: 150000, rider_count: 2, total_deliveries: 1240, is_active: true },
  { id: 2, name: "Lagos Mainland", delivery_fee_kobo: 200000, rider_count: 1, total_deliveries: 890, is_active: true },
  { id: 3, name: "Lagos Island", delivery_fee_kobo: 250000, rider_count: 1, total_deliveries: 650, is_active: true },
  { id: 4, name: "Abuja", delivery_fee_kobo: 300000, rider_count: 1, total_deliveries: 420, is_active: true },
  { id: 5, name: "Warri", delivery_fee_kobo: 200000, rider_count: 1, total_deliveries: 230, is_active: true },
  { id: 6, name: "Calabar", delivery_fee_kobo: 350000, rider_count: 0, total_deliveries: 0, is_active: false },
];

export default function AdminDeliveryPage() {
  const [tab, setTab] = useState<"riders" | "active" | "zones">("riders");
  const [riders, setRiders] = useState<Rider[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [riderModal, setRiderModal] = useState(false);
  const [editRider, setEditRider] = useState<Rider | null>(null);
  const [riderForm, setRiderForm] = useState({ name: "", phone: "", zone: "", vehicle: "Motorcycle" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const { data: ridersData } = await insforge.from("delivery_riders").select("*");
      const { data: deliveriesData } = await insforge.from("deliveries").select("*").order("created_at", { ascending: false });
      const { data: zonesData } = await insforge.from("delivery_zones").select("*");

      if (!ridersData || ridersData.length === 0) await insforge.from("delivery_riders").upsert(seedRiders);
      if (!deliveriesData || deliveriesData.length === 0) await insforge.from("deliveries").upsert(seedDeliveries);
      if (!zonesData || zonesData.length === 0) await insforge.from("delivery_zones").upsert(seedZones);

      setRiders(ridersData || seedRiders);
      setDeliveries(deliveriesData || seedDeliveries);
      setZones(zonesData || seedZones);
    } catch (e) {
      setRiders(seedRiders);
      setDeliveries(seedDeliveries);
      setZones(seedZones);
    }
    setLoading(false);
  }

  async function assignRider(deliveryId: string, riderId: number) {
    const rider = riders.find(r => r.id === riderId);
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, rider_id: riderId, rider_name: rider?.name || null, status: "assigned" } : d));
    await insforge.from("deliveries").update({ rider_id: riderId, rider_name: rider?.name, status: "assigned" }).eq("id", deliveryId);
  }

  async function updateDeliveryStatus(deliveryId: string, status: Delivery["status"]) {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status } : d));
    await insforge.from("deliveries").update({ status }).eq("id", deliveryId);
  }

  async function saveRider() {
    if (editRider) {
      await insforge.from("delivery_riders").update(riderForm).eq("id", editRider.id);
      setRiders(prev => prev.map(r => r.id === editRider.id ? { ...r, ...riderForm } : r));
    } else {
      const { data } = await insforge.from("delivery_riders").insert({ ...riderForm, status: "offline", deliveries: 0, rating: 5.0 }).select().single();
      if (data) setRiders(prev => [...prev, data]);
    }
    setRiderModal(false);
    setEditRider(null);
    setRiderForm({ name: "", phone: "", zone: "", vehicle: "Motorcycle" });
  }

  async function deleteRider(id: number) {
    if (confirm("Delete this rider?")) {
      await insforge.from("delivery_riders").delete().eq("id", id);
      setRiders(prev => prev.filter(r => r.id !== id));
    }
  }

  function exportDeliveries() {
    const csv = [
      ["ID", "Order", "Customer", "Address", "Rider", "Status", "ETA"].join(","),
      ...deliveries.map(d => [
        d.id, d.order_id, `"${d.customer_name}"`, `"${d.address}"`, d.rider_name || "Unassigned", d.status, d.eta
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deliveries-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printDeliveries() {
    const printContent = window.open("", "_blank");
    printContent?.document.write(`
      <html><head><title>Deliveries Export</title>
      <style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}</style></head>
      <body><h1>Deliveries</h1>
      <table><thead><tr><th>ID</th><th>Order</th><th>Customer</th><th>Rider</th><th>Status</th></tr></thead>
      <tbody>${deliveries.map(d => `<tr><td>${d.id}</td><td>${d.order_id}</td><td>${d.customer_name}</td><td>${d.rider_name || "Unassigned"}</td><td>${d.status}</td></tr>`).join("")}</tbody>
      </table></body></html>
    `);
    printContent?.document.close();
    printContent?.print();
  }

  return (
    <AdminShell title="Delivery Management" subtitle="Manage delivery riders and track shipments">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Riders", value: riders.length, icon: Users, color: "text-blue" },
            { label: "Available Now", value: riders.filter((r) => r.status === "available").length, icon: CheckCircle2, color: "text-green-600" },
            { label: "Active Deliveries", value: demoDeliveries.filter((d) => d.status === "in_transit").length, icon: Truck, color: "text-yellow-600" },
            { label: "Pending Assignment", value: demoDeliveries.filter((d) => d.status === "pending").length, icon: AlertTriangle, color: "text-red" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2"><s.icon size={16} className={s.color} /><span className="text-xs text-text-4">{s.label}</span></div>
              <p className="text-xl font-bold text-text-1">{s.value}</p>
            </div>
          ))}
        </div>

         <div className="flex justify-between items-center flex-wrap gap-3">
           <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
             {(["riders", "active", "zones"] as const).map((t) => (
               <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-md capitalize transition-colors ${tab === t ? "bg-white text-text-1 font-medium shadow-sm" : "text-text-4 hover:text-text-2"}`}>
                 {t === "active" ? "Active Deliveries" : t === "zones" ? "Delivery Zones" : "Riders"}
               </button>
             ))}
           </div>
           <div className="flex items-center gap-2">
             <button onClick={exportDeliveries} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
               <Download size={14} /> Export
             </button>
             <button onClick={printDeliveries} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
               <Printer size={14} /> Print
             </button>
           </div>
         </div>

        {tab === "riders" && (
          <div className="space-y-3">
            {riders.map((rider) => (
              <div key={rider.id} className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    rider.status === "available" ? "bg-green-500" : rider.status === "on_delivery" ? "bg-yellow-500" : "bg-gray-400"
                  }`}>{rider.name.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{rider.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        rider.status === "available" ? "bg-green-100 text-green-700" :
                        rider.status === "on_delivery" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"
                      }`}>{rider.status.replace("_", " ")}</span>
                    </div>
                    <p className="text-xs text-text-4">{rider.phone} · {rider.zone} · {rider.vehicle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center"><p className="text-xs text-text-4">Deliveries</p><p className="font-semibold text-sm">{rider.deliveries}</p></div>
                  <div className="text-center"><p className="text-xs text-text-4">Rating</p><p className="font-semibold text-sm flex items-center gap-1">{rider.rating} <Star size={12} className="text-yellow-400 fill-yellow-400" /></p></div>
                  {rider.currentOrder && <span className="text-xs bg-blue/10 text-blue px-2 py-1 rounded">{rider.currentOrder}</span>}
                   <button onClick={() => { setEditRider(rider); setRiderForm({ name: rider.name, phone: rider.phone, zone: rider.zone, vehicle: rider.vehicle }); setRiderModal(true); }} className="p-1.5 hover:bg-blue-50 rounded-lg"><Edit size={16} className="text-blue" /></button>
                   <button onClick={() => deleteRider(rider.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red" /></button>
                </div>
              </div>
            ))}
             <button onClick={() => { setEditRider(null); setRiderForm({ name: "", phone: "", zone: "", vehicle: "Motorcycle" }); setRiderModal(true); }} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-text-4 hover:border-blue hover:text-blue transition-colors flex items-center justify-center gap-2">
               <Plus size={16} /> Add New Rider
             </button>
          </div>
        )}

        {tab === "active" && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-gray-100">
                {["Delivery ID", "Order", "Customer", "Address", "Rider", "Status", "ETA"].map((h) => (
                  <th key={h} className="text-left p-4 text-xs text-text-4 font-medium">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {demoDeliveries.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4 font-mono text-xs">{d.id}</td>
                    <td className="p-4 text-blue font-medium">{d.order}</td>
                    <td className="p-4">{d.customer}</td>
                    <td className="p-4 text-text-3 text-xs max-w-[200px] truncate">{d.address}</td>
                     <td className="p-4">{d.rider_name || <select onChange={(e) => assignRider(d.id, parseInt(e.target.value))} className="text-xs border border-gray-200 rounded px-2 py-1" defaultValue="">
                       <option value="">Assign Rider</option>
                       {riders.filter(r => r.status === "available").map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                     </select>}</td>
                    <td className="p-4"><span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                      d.status === "in_transit" ? "bg-yellow-100 text-yellow-700" :
                      d.status === "delivered" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>{d.status.replace("_", " ")}</span></td>
                    <td className="p-4 text-text-3">{d.eta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "zones" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { zone: "Port Harcourt", riders: 2, fee: 1500, deliveries: 1240, active: true },
              { zone: "Lagos Mainland", riders: 1, fee: 2000, deliveries: 890, active: true },
              { zone: "Lagos Island", riders: 1, fee: 2500, deliveries: 650, active: true },
              { zone: "Abuja", riders: 1, fee: 3000, deliveries: 420, active: true },
              { zone: "Warri", riders: 1, fee: 2000, deliveries: 230, active: true },
              { zone: "Calabar", riders: 0, fee: 3500, deliveries: 0, active: false },
            ].map((z) => (
              <div key={z.zone} className={`bg-white rounded-xl p-4 border ${z.active ? "border-gray-100" : "border-gray-200 opacity-60"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2"><MapPin size={14} className="text-blue" />{z.zone}</h4>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${z.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{z.active ? "Active" : "Inactive"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-[10px] text-text-4">Riders</p><p className="font-semibold text-sm">{z.riders}</p></div>
                  <div><p className="text-[10px] text-text-4">Delivery Fee</p><p className="font-semibold text-sm">₦{z.fee.toLocaleString()}</p></div>
                  <div><p className="text-[10px] text-text-4">Total</p><p className="font-semibold text-sm">{z.deliveries}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
       </div>

       {/* Rider Modal */}
       {riderModal && (
         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setRiderModal(false)}>
           <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
             <h3 className="font-semibold text-lg mb-4">{editRider ? "Edit Rider" : "Add New Rider"}</h3>
             <div className="space-y-3">
               <input
                 type="text"
                 placeholder="Full Name"
                 className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
                 value={riderForm.name}
                 onChange={e => setRiderForm({ ...riderForm, name: e.target.value })}
               />
               <input
                 type="text"
                 placeholder="Phone Number"
                 className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
                 value={riderForm.phone}
                 onChange={e => setRiderForm({ ...riderForm, phone: e.target.value })}
               />
               <input
                 type="text"
                 placeholder="Zone"
                 className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
                 value={riderForm.zone}
                 onChange={e => setRiderForm({ ...riderForm, zone: e.target.value })}
               />
               <select
                 className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm"
                 value={riderForm.vehicle}
                 onChange={e => setRiderForm({ ...riderForm, vehicle: e.target.value })}
               >
                 <option value="Motorcycle">Motorcycle</option>
                 <option value="Van">Van</option>
                 <option value="Truck">Truck</option>
                 <option value="Bicycle">Bicycle</option>
               </select>
             </div>
             <div className="flex justify-end gap-2 mt-4">
               <button onClick={() => setRiderModal(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-lg">Cancel</button>
               <button onClick={saveRider} className="px-4 py-2 text-sm bg-blue text-white rounded-lg">{editRider ? "Update Rider" : "Add Rider"}</button>
             </div>
           </div>
         </div>
       )}

     </AdminShell>
   );
 }
