"use client";

export default function AdminDashboardContent() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">₦12.5M</p>
          <p className="text-sm text-gray-500">+12.5% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold">Orders</h3>
          <p className="text-2xl font-bold text-blue-600">156</p>
          <p className="text-sm text-gray-500">+8.2% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold">Customers</h3>
          <p className="text-2xl font-bold text-purple-600">2,340</p>
          <p className="text-sm text-gray-500">+5.1% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold">Products</h3>
          <p className="text-2xl font-bold text-orange-600">1,247</p>
          <p className="text-sm text-gray-500">Active products</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">New order received</p>
              <p className="text-sm text-gray-500">Order #RSH-2026-001234</p>
            </div>
            <span className="text-sm text-green-600">2 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <div>
              <p className="font-medium">Product stock low</p>
              <p className="text-sm text-gray-500">Hikvision DS-2CD2143G2-I</p>
            </div>
            <span className="text-sm text-orange-600">15 minutes ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium">Customer registered</p>
              <p className="text-sm text-gray-500">John Doe - Port Harcourt</p>
            </div>
            <span className="text-sm text-blue-600">1 hour ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
