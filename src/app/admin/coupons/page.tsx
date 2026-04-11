"use client";
import AdminShell from "@/components/admin/admin-shell";

import { useState, useEffect } from "react";
import {
  Ticket, Plus, Search, Edit, Trash2, Copy,
  Percent, DollarSign, TrendingUp, X,
} from "lucide-react";
import { insforge } from "@/lib/insforge";

// Type definitions
interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  discount_value: number;
  usage_count: number;
  usage_limit: number | null;
  status: 'active' | 'expired' | 'disabled';
  expires_at: string;
  created_at: string;
  min_order?: number;
  max_discount?: number;
  per_user_limit?: number;
  applies_to?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"list" | "create">("list");
  const [search, setSearch] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "percentage" as const,
    discount_value: 10,
    min_order: 0,
    max_discount: 0,
    usage_limit: 0,
    per_user_limit: 1,
    expires_at: "",
    applies_to: "all"
  });

  // Load coupons from database
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const { data, error } = await insforge
          .from("coupons")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCoupons(data || []);
      } catch (error) {
        console.error("Failed to load coupons:", error);
        // Fallback to demo data if database fails
        setCoupons([
          { id: "1", code: "WELCOME10", type: "percentage", discount_value: 10, usage_count: 342, usage_limit: 1000, status: "active", expires_at: "2026-12-31", created_at: "2026-01-01", min_order: 5000, max_discount: 2000, per_user_limit: 1, applies_to: "All Products" },
          { id: "2", code: "MARINE20", type: "percentage", discount_value: 20, usage_count: 87, usage_limit: 200, status: "active", expires_at: "2026-06-30", created_at: "2026-03-01", min_order: 50000, max_discount: 15000, per_user_limit: 2, applies_to: "Marine Category" },
          { id: "3", code: "FLAT5K", type: "fixed", discount_value: 5000, usage_count: 500, usage_limit: 500, status: "expired", expires_at: "2026-04-15", created_at: "2026-01-15", min_order: 25000, max_discount: null, per_user_limit: 1, applies_to: "All Products" },
          { id: "4", code: "SECURITY15", type: "percentage", discount_value: 15, usage_count: 45, usage_limit: 300, status: "active", expires_at: "2026-09-30", created_at: "2026-04-01", min_order: 30000, max_discount: 10000, per_user_limit: 3, applies_to: "Security Category" },
          { id: "5", code: "FREESHIP", type: "shipping", discount_value: 0, usage_count: 1250, usage_limit: null, status: "active", expires_at: "2026-12-31", created_at: "2026-01-01", min_order: 15000, max_discount: null, per_user_limit: 5, applies_to: "All Products" },
          { id: "6", code: "FLASH50", type: "percentage", discount_value: 50, usage_count: 12, usage_limit: 50, status: "expired", expires_at: "2026-03-16", created_at: "2026-03-15", min_order: 100000, max_discount: 50000, per_user_limit: 1, applies_to: "Selected Products" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadCoupons();
  }, []);

  // Handlers
  const handleCreateCoupon = async () => {
    try {
      const { data, error } = await insforge
        .from("coupons")
        .insert([{
          code: newCoupon.code,
          type: newCoupon.type,
          discount_value: newCoupon.discount_value,
          usage_limit: newCoupon.usage_limit || null,
          expires_at: newCoupon.expires_at,
          status: "active",
          min_order: newCoupon.min_order || null,
          max_discount: newCoupon.max_discount || null,
          per_user_limit: newCoupon.per_user_limit || null,
          applies_to: newCoupon.applies_to
        }])
        .select();

      if (error) throw error;

      // Reload coupons
      const { data: updatedCoupons } = await insforge
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (updatedCoupons) setCoupons(updatedCoupons);

      // Reset form and go back to list
      setNewCoupon({
        code: "",
        type: "percentage",
        discount_value: 10,
        min_order: 0,
        max_discount: 0,
        usage_limit: 0,
        per_user_limit: 1,
        expires_at: "",
        applies_to: "all"
      });
      setTab("list");
    } catch (error) {
      console.error("Failed to create coupon:", error);
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setNewCoupon({
      code: coupon.code,
      type: coupon.type,
      discount_value: coupon.discount_value,
      min_order: coupon.min_order || 0,
      max_discount: coupon.max_discount || 0,
      usage_limit: coupon.usage_limit || 0,
      per_user_limit: coupon.per_user_limit || 1,
      expires_at: coupon.expires_at.split('T')[0],
      applies_to: coupon.applies_to || "all"
    });
    setTab("create");
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const { error } = await insforge
        .from("coupons")
        .delete()
        .eq("id", couponId);

      if (error) throw error;

      // Remove from local state
      setCoupons(coupons.filter(c => c.id !== couponId));
    } catch (error) {
      console.error("Failed to delete coupon:", error);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could show a toast notification here
  };

  // Calculate stats
  const activeCoupons = coupons.filter(c => c.status === "active").length;
  const totalUsage = coupons.reduce((sum, c) => sum + c.usage_count, 0);
  const avgDiscount = coupons.length > 0
    ? coupons.reduce((sum, c) => {
        if (c.type === "percentage") return sum + c.discount_value;
        if (c.type === "fixed") return sum + (c.discount_value / 100); // Rough estimate
        return sum;
      }, 0) / coupons.length
    : 0;

  const filteredCoupons = coupons.filter(c =>
    !search || c.code.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <AdminShell title="Coupons & Discounts" subtitle="Create and manage promotional coupons">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-text-3">Loading coupons...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Coupons & Discounts" subtitle="Create and manage promotional coupons">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Coupons", value: activeCoupons, icon: Ticket, color: "text-green-600" },
            { label: "Total Uses", value: totalUsage.toLocaleString(), icon: TrendingUp, color: "text-blue" },
            { label: "Avg Discount", value: avgDiscount < 1 ? `${Math.round(avgDiscount * 100)}%` : `₦${Math.round(avgDiscount * 1000)}`, icon: Percent, color: "text-purple-600" },
            { label: "Revenue Impact", value: `₦${(totalUsage * avgDiscount * 1000).toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-xs text-text-4">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-text-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(["list", "create"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm rounded-md capitalize transition-colors ${tab === t ? "bg-white text-text-1 font-medium shadow-sm" : "text-text-4 hover:text-text-2"}`}>
                {t === "list" ? "All Coupons" : "Create New"}
              </button>
            ))}
          </div>
          {tab === "list" && (
            <button onClick={() => setTab("create")} className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
              <Plus size={16} /> New Coupon
            </button>
          )}
        </div>

        {tab === "list" && (
          <>
            <div className="relative max-w-sm">
              <input type="text" placeholder="Search coupons..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-10 pl-10 pr-4 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-blue" />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-4" />
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["Code", "Type", "Value", "Min Order", "Usage", "Applies To", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left p-4 text-xs text-text-4 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-blue/10 text-blue px-2 py-1 rounded font-mono font-medium">{coupon.code}</code>
                          <button onClick={() => handleCopyCode(coupon.code)} className="text-text-4 hover:text-blue"><Copy size={12} /></button>
                        </div>
                      </td>
                      <td className="p-4 capitalize text-text-3">{coupon.type.replace("_", " ")}</td>
                      <td className="p-4 font-medium">
                        {coupon.type === "percentage" ? `${coupon.discount_value}%` :
                         coupon.type === "fixed" ? `₦${coupon.discount_value.toLocaleString()}` :
                         "Free Shipping"}
                      </td>
                      <td className="p-4 text-text-3">₦{(coupon.min_order || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="text-text-3">{coupon.usage_count}{coupon.usage_limit ? `/${coupon.usage_limit}` : ""}</div>
                        {coupon.usage_limit && (
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full mt-1">
                            <div className="h-full bg-blue rounded-full" style={{ width: `${Math.min((coupon.usage_count / coupon.usage_limit) * 100, 100)}%` }} />
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-xs text-text-4">{coupon.applies_to || "All Products"}</td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${
                          coupon.status === "active" ? "bg-green-100 text-green-700" :
                          coupon.status === "expired" ? "bg-red-100 text-red-700" :
                          coupon.status === "disabled" ? "bg-gray-100 text-gray-500" : "bg-yellow-100 text-yellow-700"
                        }`}>{coupon.status}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleEditCoupon(coupon)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit size={14} className="text-text-4" /></button>
                          <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "create" && (
          <div className="bg-white rounded-xl p-6 border border-gray-100 max-w-2xl">
            <h3 className="font-semibold text-base mb-4">{selectedCoupon ? "Edit Coupon" : "Create Coupon"}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-text-3 mb-1 block">Coupon Code</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg font-mono"
                  placeholder="e.g. SUMMER20"
                />
              </div>
              <div>
                <label className="text-sm text-text-3 mb-1 block">Discount Type</label>
                <select
                  value={newCoupon.type}
                  onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value as any })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₦)</option>
                  <option value="shipping">Free Shipping</option>
                </select>
              </div>
              {newCoupon.type !== "shipping" && (
                <div>
                  <label className="text-sm text-text-3 mb-1 block">Discount Value</label>
                  <input
                    type="number"
                    value={newCoupon.discount_value}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: +e.target.value })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-text-3 mb-1 block">Minimum Order (₦)</label>
                <input
                  type="number"
                  value={newCoupon.min_order}
                  onChange={(e) => setNewCoupon({ ...newCoupon, min_order: +e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              {newCoupon.type === "percentage" && (
                <div>
                  <label className="text-sm text-text-3 mb-1 block">Max Discount (₦)</label>
                  <input
                    type="number"
                    value={newCoupon.max_discount || ""}
                    onChange={(e) => setNewCoupon({ ...newCoupon, max_discount: +e.target.value || null })}
                    className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                    placeholder="0 = unlimited"
                  />
                </div>
              )}
              <div>
                <label className="text-sm text-text-3 mb-1 block">Usage Limit</label>
                <input
                  type="number"
                  value={newCoupon.usage_limit || ""}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: +e.target.value || null })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                  placeholder="0 = unlimited"
                />
              </div>
              <div>
                <label className="text-sm text-text-3 mb-1 block">Per User Limit</label>
                <input
                  type="number"
                  value={newCoupon.per_user_limit || ""}
                  onChange={(e) => setNewCoupon({ ...newCoupon, per_user_limit: +e.target.value || null })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-text-3 mb-1 block">Applies To</label>
                <select
                  value={newCoupon.applies_to}
                  onChange={(e) => setNewCoupon({ ...newCoupon, applies_to: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                >
                  <option value="all">All Products</option>
                  <option value="category">Specific Category</option>
                  <option value="products">Selected Products</option>
                  <option value="brands">Specific Brands</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-text-3 mb-1 block">Expires</label>
                <input
                  type="date"
                  value={newCoupon.expires_at}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expires_at: e.target.value })}
                  className="w-full h-10 px-3 text-sm border border-gray-200 rounded-lg"
                />
              </div>
            </div>
            <button
              onClick={handleCreateCoupon}
              className="mt-5 w-full h-11 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Ticket size={16} /> {selectedCoupon ? "Update Coupon" : "Create Coupon"}
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
