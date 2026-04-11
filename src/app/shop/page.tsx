"use client";

export default function ShopPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop All Products</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-semibold">Sample Product 1</h3>
          <p className="text-gray-600">₦125,000</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-semibold">Sample Product 2</h3>
          <p className="text-gray-600">₦85,000</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-semibold">Sample Product 3</h3>
          <p className="text-gray-600">₦195,000</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
          <h3 className="font-semibold">Sample Product 4</h3>
          <p className="text-gray-600">₦75,000</p>
        </div>
      </div>
    </div>
  );
}
