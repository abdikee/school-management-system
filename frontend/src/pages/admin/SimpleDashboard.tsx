export function SimpleDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
      <p className="text-xl text-gray-600">Welcome to the School Management System!</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Students</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Teachers</h3>
          <p className="text-3xl font-bold text-green-600">89</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold">Active Classes</h3>
          <p className="text-3xl font-bold text-purple-600">45</p>
        </div>
      </div>
    </div>
  );
}
