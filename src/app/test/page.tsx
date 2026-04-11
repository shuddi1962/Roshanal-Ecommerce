export default function TestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-green-600">Test Page Works!</h1>
      <p className="mt-4">This page is rendering correctly.</p>
      <p className="mt-2 text-sm text-gray-600">Current time: {new Date().toLocaleString()}</p>
    </div>
  );
}
