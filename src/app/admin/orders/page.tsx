"use client";
import AdminShell from "@/components/admin/admin-shell";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Eye,
  Package,
  ChevronDown,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Printer,
  X,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { insforge } from "@/lib/insforge";


// Order type definition
interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  order_date: string;
  status: string;
  payment_status: string;
  total_items: number;
  total_amount: number;
  branch_name: string;
  shipping_address?: string;
  phone?: string;
  items?: any[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "bg-yellow-50 text-warning", icon: Clock },
  processing: { label: "Processing", color: "bg-blue-50 text-blue", icon: Package },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue", icon: CheckCircle2 },
  packed: { label: "Packed", color: "bg-indigo-50 text-indigo-600", icon: Package },
  dispatched: { label: "Dispatched", color: "bg-blue-50 text-blue", icon: Truck },
  "in-transit": { label: "In Transit", color: "bg-blue-50 text-blue", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-50 text-success", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-green-50 text-success", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red", icon: XCircle },
  "on-hold": { label: "On Hold", color: "bg-yellow-50 text-warning", icon: AlertCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Load orders from database
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const { data, error } = await insforge
          .from("orders")
          .select(`
            id,
            customer_name,
            customer_email,
            order_date,
            status,
            payment_status,
            total_items,
            total_amount,
            branch_name,
            shipping_address,
            phone
          `)
          .order("order_date", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Failed to load orders:", error);
        // Fallback to demo data if database fails
        setOrders([
          { id: "RSH-2026-001234", customer_name: "John Doe", customer_email: "john@example.com", order_date: "2026-04-02", status: "in-transit", payment_status: "paid", total_items: 3, total_amount: 340000, branch_name: "Port Harcourt" },
          { id: "RSH-2026-001233", customer_name: "Amina Bello", customer_email: "amina@example.com", order_date: "2026-04-02", status: "processing", payment_status: "paid", total_items: 1, total_amount: 195000, branch_name: "Lagos" },
          { id: "RSH-2026-001232", customer_name: "Chidi Okafor", customer_email: "chidi@example.com", order_date: "2026-04-01", status: "pending", payment_status: "pending", total_items: 2, total_amount: 89000, branch_name: "Port Harcourt" },
          { id: "RSH-2026-001231", customer_name: "Fatima Hassan", customer_email: "fatima@example.com", order_date: "2026-04-01", status: "delivered", payment_status: "paid", total_items: 5, total_amount: 4500000, branch_name: "Bayelsa" },
          { id: "RSH-2026-001230", customer_name: "Emeka Eze", customer_email: "emeka@example.com", order_date: "2026-03-31", status: "completed", payment_status: "paid", total_items: 1, total_amount: 72500, branch_name: "Lagos" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (searchQuery && !o.id.toLowerCase().includes(searchQuery.toLowerCase()) && !o.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((a, b) => a + b.total_amount, 0);

  // View order modal handler
  const handleViewOrder = async (order: Order) => {
    try {
      // Load order items
      const { data: items, error } = await insforge
        .from("order_items")
        .select(`
          quantity,
          unit_price,
          products (
            name,
            sku,
            images
          )
        `)
        .eq("order_id", order.id);

      if (error) throw error;

      setSelectedOrder({ ...order, items: items || [] });
      setShowOrderModal(true);
    } catch (error) {
      console.error("Failed to load order details:", error);
      setSelectedOrder(order);
      setShowOrderModal(true);
    }
  };

  // Print order handler
  const handlePrintOrder = (order: Order) => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Order ${order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #0C1A36; padding-bottom: 10px; margin-bottom: 20px; }
              .details { margin-bottom: 20px; }
              .items { border-collapse: collapse; width: 100%; }
              .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              .items th { background-color: #f2f2f2; }
              .total { text-align: right; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Roshanal Global - Order ${order.id}</h1>
              <p>Date: ${new Date(order.order_date).toLocaleDateString()}</p>
            </div>
            <div class="details">
              <p><strong>Customer:</strong> ${order.customer_name}</p>
              <p><strong>Email:</strong> ${order.customer_email}</p>
              <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              <p><strong>Payment:</strong> ${order.payment_status}</p>
              <p><strong>Branch:</strong> ${order.branch_name}</p>
            </div>
            <h3>Order Items</h3>
            <table class="items">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${(order.items || []).map((item: any) => `
                  <tr>
                    <td>${item.products?.name || 'Unknown Product'}</td>
                    <td>${item.quantity}</td>
                    <td>₦${item.unit_price?.toLocaleString()}</td>
                    <td>₦${((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              <p>Total: ₦${order.total_amount.toLocaleString()}</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Export orders handler
  const handleExportOrders = () => {
    const csvContent = [
      ["Order ID", "Customer", "Email", "Date", "Status", "Payment", "Items", "Total", "Branch"],
      ...filtered.map(order => [
        order.id,
        order.customer_name,
        order.customer_email,
        order.order_date,
        order.status,
        order.payment_status,
        order.total_items,
        order.total_amount,
        order.branch_name
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminShell title="Orders" subtitle="Manage customer orders">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-3 border-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-text-3">Loading orders...</p>
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Orders" subtitle="Manage customer orders">
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-syne font-700 text-2xl text-text-1">Orders</h1>
          <p className="text-sm text-text-3 mt-1">{orders.length} total orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportOrders}>
          <Download className="w-3 h-3 mr-1" /> Export Orders
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: "Total Orders", value: orders.length, color: "text-blue" },
          { label: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "text-warning" },
          { label: "Processing", value: orders.filter((o) => ["processing", "confirmed", "packed"].includes(o.status)).length, color: "text-blue" },
          { label: "Delivered", value: orders.filter((o) => ["delivered", "completed"].includes(o.status)).length, color: "text-success" },
          { label: "Revenue", value: `₦${(totalRevenue / 1000000).toFixed(1)}M`, color: "text-success" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-border p-4">
            <p className={`font-syne font-700 text-xl ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-text-3 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 mb-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or customer name..."
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue/20"
            />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-border rounded-lg text-sm bg-white appearance-none pr-8 focus:outline-none">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-text-4 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-off-white border-b border-border">
              <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Order</th>
              <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Customer</th>
              <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Date</th>
              <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Status</th>
              <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Payment</th>
              <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Items</th>
              <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Total</th>
              <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Branch</th>
              <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <tr key={order.id} className="border-b border-border hover:bg-off-white/50">
                  <td className="p-3">
                    <span className="font-mono text-sm font-medium text-text-1">{order.id}</span>
                  </td>
                  <td className="p-3">
                    <p className="text-sm text-text-1">{order.customer_name}</p>
                    <p className="text-xs text-text-4">{order.customer_email}</p>
                  </td>
                  <td className="p-3 text-sm text-text-3">{new Date(order.order_date).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      <StatusIcon className="w-3 h-3" /> {status.label}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-xs font-medium ${order.payment_status === "paid" ? "text-success" : order.payment_status === "refunded" ? "text-text-4" : "text-warning"}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm text-text-2">{order.total_items}</td>
                  <td className="p-3 text-right font-syne font-600 text-sm text-text-1">₦{order.total_amount.toLocaleString()}</td>
                  <td className="p-3 text-sm text-text-3">{order.branch_name}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleViewOrder(order)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handlePrintOrder(order)} className="p-1.5 rounded-lg hover:bg-off-white text-text-4 hover:text-blue"><Printer className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-syne font-700 text-xl text-text-1">Order {selectedOrder.id}</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-2 hover:bg-off-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold">Customer</p>
                  <p className="text-sm text-text-1 mt-1">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold">Email</p>
                  <p className="text-sm text-text-1 mt-1">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold">Phone</p>
                  <p className="text-sm text-text-1 mt-1">{selectedOrder.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold">Order Date</p>
                  <p className="text-sm text-text-1 mt-1">{new Date(selectedOrder.order_date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status & Payment */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold">Status</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${statusConfig[selectedOrder.status]?.color || statusConfig.pending.color}`}>
                    {statusConfig[selectedOrder.status]?.icon && <statusConfig[selectedOrder.status].icon className="w-3 h-3" />}
                    {statusConfig[selectedOrder.status]?.label || 'Unknown'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold">Payment</p>
                  <span className={`text-xs font-medium mt-1 ${selectedOrder.payment_status === "paid" ? "text-success" : selectedOrder.payment_status === "refunded" ? "text-text-4" : "text-warning"}`}>
                    {selectedOrder.payment_status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold">Items</p>
                  <p className="text-sm text-text-1 mt-1">{selectedOrder.total_items}</p>
                </div>
                <div>
                  <p className="text-xs text-text-4 uppercase font-semibold">Branch</p>
                  <p className="text-sm text-text-1 mt-1">{selectedOrder.branch_name}</p>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div className="mb-6">
                  <p className="text-xs text-text-4 uppercase font-semibold mb-2">Shipping Address</p>
                  <div className="bg-off-white p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-text-4 mt-0.5" />
                      <p className="text-sm text-text-1">{selectedOrder.shipping_address}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <p className="text-xs text-text-4 uppercase font-semibold mb-3">Order Items</p>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-off-white">
                      <tr>
                        <th className="p-3 text-left text-xs font-syne font-600 text-text-3 uppercase">Product</th>
                        <th className="p-3 text-center text-xs font-syne font-600 text-text-3 uppercase">Qty</th>
                        <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Unit Price</th>
                        <th className="p-3 text-right text-xs font-syne font-600 text-text-3 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((item: any, index: number) => (
                        <tr key={index} className="border-t border-border">
                          <td className="p-3">
                            <p className="text-sm text-text-1">{item.products?.name || 'Unknown Product'}</p>
                            <p className="text-xs text-text-4">{item.products?.sku || ''}</p>
                          </td>
                          <td className="p-3 text-center text-sm text-text-2">{item.quantity}</td>
                          <td className="p-3 text-right text-sm text-text-1">₦{(item.unit_price || 0).toLocaleString()}</td>
                          <td className="p-3 text-right font-syne font-600 text-sm text-text-1">₦{((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-off-white border-t border-border">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-syne font-600 text-sm text-text-1">Total</td>
                        <td className="p-3 text-right font-syne font-700 text-base text-text-1">₦{selectedOrder.total_amount.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border">
                <Button variant="outline" onClick={() => handlePrintOrder(selectedOrder)}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print Order
                </Button>
                <Button variant="outline" onClick={() => setShowOrderModal(false)}>
                  Close
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
