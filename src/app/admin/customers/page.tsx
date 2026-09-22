"use client";
import AdminShell from "@/components/admin/admin-shell";

import { useState, useEffect } from "react";
import { Search, Download, Eye, Mail, ChevronDown, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";


// Customer type definition
interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders_count: number;
  total_spent: number;
  loyalty_tier: string;
  last_order_date?: string;
  status: string;
  created_at: string;
}

const tierColors: Record<string, string> = {
  Bronze: "bg-amber-50 text-amber-700",
  Silver: "bg-gray-50 text-gray-600",
  Gold: "bg-yellow-50 text-yellow-700",
  Platinum: "bg-purple-50 text-purple-700",
};

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load customers from database
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const { data, error } = await insforge
          .from("customers")
          .select(`
            id,
            name,
            email,
            phone,
            orders_count,
            total_spent,
            loyalty_tier,
            last_order_date,
            status,
            created_at
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.error("Failed to load customers:", error);
        // Fallback to demo data if database fails
        setCustomers([
          { id: "1", name: "John Doe", email: "john@example.com", phone: "+234 801 234 5678", orders_count: 24, total_spent: 4250000, loyalty_tier: "Gold", last_order_date: "2026-04-02", status: "active", created_at: "2026-01-01" },
          { id: "2", name: "Amina Bello", email: "amina@example.com", phone: "+234 802 345 6789", orders_count: 12, total_spent: 1850000, loyalty_tier: "Silver", last_order_date: "2026-04-01", status: "active", created_at: "2026-01-02" },
          { id: "3", name: "Chidi Okafor", email: "chidi@example.com", phone: "+234 803 456 7890", orders_count: 45, total_spent: 12500000, loyalty_tier: "Platinum", last_order_date: "2026-03-30", status: "active", created_at: "2026-01-03" },
          { id: "4", name: "Fatima Hassan", email: "fatima@example.com", phone: "+234 804 567 8901", orders_count: 3, total_spent: 285000, loyalty_tier: "Bronze", last_order_date: "2026-03-28", status: "active", created_at: "2026-01-04" },
          { id: "5", name: "Emeka Eze", email: "emeka@example.com", phone: "+234 805 678 9012", orders_count: 8, total_spent: 920000, loyalty_tier: "Silver", last_order_date: "2026-03-25", status: "active", created_at: "2026-01-05" },
          { id: "6", name: "Grace Nwosu", email: "grace@example.com", phone: "+234 806 789 0123", orders_count: 1, total_spent: 72500, loyalty_tier: "Bronze", last_order_date: "2026-03-20", status: "inactive", created_at: "2026-01-06" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <AdminShell title="Customers" subtitle="Manage customer profiles">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-text-3">Loading customers...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  const filtered = customers.filter((c) => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (tierFilter !== "all" && c.loyalty_tier !== tierFilter) return false;
    return true;
  });

  // View customer modal handler
  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  // Send email handler
  const handleSendEmail = (customer: Customer) => {
    const subject = encodeURIComponent("Message from Roshanal Global");
    const body = encodeURIComponent(`Dear ${customer.name},\n\n`);
    window.open(`mailto:${customer.email}?subject=${subject}&body=${body}`);
  };

  // Export customers handler
  const handleExportCustomers = () => {
    const csvContent = [
      ["Name", "Email", "Phone", "Orders", "Total Spent", "Loyalty Tier", "Last Order", "Status", "Joined"],
      ...filtered.map(customer => [
        customer.name,
        customer.email,
        customer.phone || '',
        customer.orders_count,
        customer.total_spent,
        customer.loyalty_tier,
        customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : '',
        customer.status,
        new Date(customer.created_at).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Add customer handler
  const handleAddCustomer = () => {
    setShowAddModal(true);
  };

  return (
    <AdminShell title="Customers" subtitle="Manage customer profiles">
      <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne font-700 text-2xl text-text-1">Customers</h1>
          <p className="text-sm text-text-3 mt-1">{customers.length} registered customers</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleExportCustomers}><Download className="w-3 h-3 mr-1" /> Export</Button>
          <Button variant="default" size="sm" onClick={handleAddCustomer}><UserPlus className="w-3 h-3 mr-1" /> Add Customer</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="font-syne font-700 text-2xl text-blue">{customers.length}</p>
          <p className="text-xs text-text-3 mt-1">Total Customers</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="font-syne font-700 text-2xl text-success">{customers.filter((c) => c.status === "active").length}</p>
          <p className="text-xs text-text-3 mt-1">Active Customers</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="font-syne font-700 text-2xl text-text-1">₦{(customers.reduce((a, b) => a + b.total_spent, 0) / 1000000).toFixed(1)}M</p>
          <p className="text-xs text-text-3 mt-1">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4">
          <p className="font-syne font-700 text-2xl text-warning">{customers.length > 0 ? Math.round(customers.reduce((a, b) => a + b.orders_count, 0) / customers.length) : 0}</p>
          <p className="text-xs text-text-3 mt-1">Avg Orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or email..." className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20" />
          </div>
          <div className="relative">
            <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg text-sm bg-white appearance-none pr-8">
              <option value="all">All Tiers</option>
              <option value="Bronze">Bronze</option>
              <option value="Silver">Silver</option>
              <option value="Gold">Gold</option>
              <option value="Platinum">Platinum</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-off-white border-b border-border">
              <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Customer</th>
              <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Tier</th>
              <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Orders</th>
              <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Total Spent</th>
              <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Last Order</th>
              <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Status</th>
              <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer) => (
              <tr key={customer.id} className="border-b border-border hover:bg-off-white/50">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-syne font-700 text-xs">
                      {customer.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-1">{customer.name}</p>
                      <p className="text-xs text-text-4">{customer.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierColors[customer.loyalty_tier]}`}>
                    {customer.loyalty_tier}
                  </span>
                </td>
                <td className="p-3 text-center text-sm text-text-2">{customer.orders_count}</td>
                <td className="p-3 text-right font-syne font-600 text-sm text-text-1">₦{customer.total_spent.toLocaleString()}</td>
                <td className="p-3 text-sm text-text-3">{customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString() : 'Never'}</td>
                <td className="p-3 text-center">
                  <span className={`text-xs font-medium ${customer.status === "active" ? "text-success" : "text-text-4"}`}>
                    {customer.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleViewCustomer(customer)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleSendEmail(customer)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Mail className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-syne font-700 text-xl text-text-1">Customer Details</h2>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-2 hover:bg-off-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold mb-2">Basic Information</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-text-4">Name</p>
                      <p className="text-sm text-text-1">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Email</p>
                      <p className="text-sm text-text-1">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Phone</p>
                      <p className="text-sm text-text-1">{selectedCustomer.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold mb-2">Account Statistics</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-text-4">Total Orders</p>
                      <p className="text-sm text-text-1">{selectedCustomer.orders_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Total Spent</p>
                      <p className="text-sm text-text-1">₦{selectedCustomer.total_spent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-4">Loyalty Tier</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierColors[selectedCustomer.loyalty_tier]}`}>
                        {selectedCustomer.loyalty_tier}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div className="border-t border-border pt-6">
                <p className="text-xs text-text-4 uppercase font-semibold mb-3">Account Details</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-text-4">Status</p>
                    <span className={`text-xs font-medium ${selectedCustomer.status === "active" ? "text-success" : "text-text-4"}`}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-text-4">Last Order</p>
                    <p className="text-xs text-text-1">{selectedCustomer.last_order_date ? new Date(selectedCustomer.last_order_date).toLocaleDateString() : 'Never'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-4">Member Since</p>
                    <p className="text-xs text-text-1">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-text-4">Customer ID</p>
                    <p className="text-xs text-text-1 font-mono">{selectedCustomer.id}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => handleSendEmail(selectedCustomer)}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" onClick={() => setShowCustomerModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-syne font-700 text-xl text-text-1">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-off-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-1 mb-1">Phone (Optional)</label>
                  <input
                    type="tel"
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              </form>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowAddModal(false)}>
                  Add Customer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    </AdminShell>
  );
}
