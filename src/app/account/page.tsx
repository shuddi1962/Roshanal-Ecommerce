"use client";

export default function AccountDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">24</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-2">Wishlist Items</h3>
          <p className="text-3xl font-bold text-red-600">8</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-lg mb-2">Wallet Balance</h3>
          <p className="text-3xl font-bold text-green-600">₦45,000</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <p className="font-medium">RSH-2026-001234</p>
              <p className="text-sm text-gray-600">Mar 28, 2026</p>
            </div>
            <div className="text-right">
              <p className="font-medium">₦285,000</p>
              <span className="text-sm text-green-600">Delivered</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">RSH-2026-001198</p>
              <p className="text-sm text-gray-600">Mar 20, 2026</p>
            </div>
            <div className="text-right">
              <p className="font-medium">₦195,000</p>
              <span className="text-sm text-blue-600">In Transit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
